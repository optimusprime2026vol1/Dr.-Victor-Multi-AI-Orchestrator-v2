#!/usr/bin/env python3
import json
import os
from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = Path(__file__).resolve().parents[1]
MEM = ROOT / "memory"
SCOPES = ["https://www.googleapis.com/auth/drive"]
FOLDER_NAME = os.getenv("VICTOR_MEMORY_DRIVE_FOLDER", "Victor Memory")
FILES = [
    "founder_memory.json",
    "decisions.jsonl",
    "operational_memory.jsonl",
    "memory_index.json",
]
TOKEN_URI = "https://oauth2.googleapis.com/token"


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required GitHub secret/environment variable: {name}")
    return value


def service():
    creds = Credentials(
        token=None,
        refresh_token=required_env("GOOGLE_DRIVE_REFRESH_TOKEN"),
        token_uri=TOKEN_URI,
        client_id=required_env("GOOGLE_DRIVE_CLIENT_ID"),
        client_secret=required_env("GOOGLE_DRIVE_CLIENT_SECRET"),
        scopes=SCOPES,
    )
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def escaped(value: str) -> str:
    return value.replace("'", "\\'")


def folder_id(svc):
    q = (
        f"name='{escaped(FOLDER_NAME)}' and "
        "mimeType='application/vnd.google-apps.folder' and trashed=false"
    )
    files = svc.files().list(
        q=q,
        fields="files(id,name,parents,driveId)",
        spaces="drive",
        includeItemsFromAllDrives=True,
        supportsAllDrives=True,
        pageSize=100,
    ).execute().get("files", [])

    if not files:
        raise RuntimeError(
            f"Victor memory folder not found in authorized Google Drive account: {FOLDER_NAME}"
        )

    if len(files) > 1:
        print(
            json.dumps(
                {
                    "warning": "MULTIPLE_FOLDERS_FOUND",
                    "folder_name": FOLDER_NAME,
                    "selected_id": files[0]["id"],
                    "matches": len(files),
                }
            )
        )
    return files[0]["id"]


def upsert(svc, fid, path):
    q = f"name='{escaped(path.name)}' and '{fid}' in parents and trashed=false"
    found = svc.files().list(
        q=q,
        fields="files(id,name)",
        spaces="drive",
        includeItemsFromAllDrives=True,
        supportsAllDrives=True,
        pageSize=100,
    ).execute().get("files", [])

    media = MediaFileUpload(
        str(path), mimetype="application/octet-stream", resumable=False
    )

    if found:
        svc.files().update(
            fileId=found[0]["id"],
            media_body=media,
            supportsAllDrives=True,
        ).execute()
        return "updated"

    svc.files().create(
        body={"name": path.name, "parents": [fid]},
        media_body=media,
        fields="id",
        supportsAllDrives=True,
    ).execute()
    return "created"


def main():
    svc = service()
    fid = folder_id(svc)
    results = {}

    for name in FILES:
        path = MEM / name
        if path.exists():
            results[name] = upsert(svc, fid, path)

    print(
        json.dumps(
            {
                "status": "SYNC_OK",
                "auth_mode": "OAUTH_USER_REFRESH_TOKEN",
                "folder": FOLDER_NAME,
                "folder_id": fid,
                "files": results,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
