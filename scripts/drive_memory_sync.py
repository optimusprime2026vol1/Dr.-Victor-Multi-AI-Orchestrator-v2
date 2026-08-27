#!/usr/bin/env python3
"""Verified, fail-closed backup of Victor's repository memory to Google Drive."""

import hashlib
import io
import json
import os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEM = ROOT / "memory"
SCOPES = ["https://www.googleapis.com/auth/drive.file"]
TOKEN_URI = "https://oauth2.googleapis.com/token"
FILES = (
    "founder_memory.json",
    "decisions.jsonl",
    "operational_memory.jsonl",
    "memory_index.json",
)


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required secret/environment variable: {name}")
    return value


def drive_service():
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    # Do not send a new scope request while exchanging an existing refresh
    # token. Google binds the grant to the scopes approved during consent; a
    # second scope parameter can make an otherwise valid grant fail with
    # `invalid_scope`. The Drive operation below remains constrained by the
    # scopes originally granted to this token.
    creds = Credentials(
        token=None,
        refresh_token=required_env("GOOGLE_DRIVE_REFRESH_TOKEN"),
        token_uri=TOKEN_URI,
        client_id=required_env("GOOGLE_DRIVE_CLIENT_ID"),
        client_secret=required_env("GOOGLE_DRIVE_CLIENT_SECRET"),
    )
    creds.refresh(Request())
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def validate_folder(svc, folder_id: str) -> dict:
    folder = (
        svc.files()
        .get(
            fileId=folder_id,
            fields="id,name,mimeType,trashed",
            supportsAllDrives=True,
        )
        .execute()
    )
    if folder.get("trashed"):
        raise RuntimeError("Configured Victor memory Drive folder is trashed")
    if folder.get("mimeType") != "application/vnd.google-apps.folder":
        raise RuntimeError("GOOGLE_DRIVE_FOLDER_ID does not identify a Drive folder")
    return folder


def find_existing(svc, folder_id: str, name: str) -> list:
    safe_name = name.replace("'", "\\'")
    query = f"name='{safe_name}' and '{folder_id}' in parents and trashed=false"
    return (
        svc.files()
        .list(
            q=query,
            fields="files(id,name,appProperties)",
            spaces="drive",
            includeItemsFromAllDrives=True,
            supportsAllDrives=True,
            pageSize=10,
        )
        .execute()
        .get("files", [])
    )


def upload_one(svc, folder_id: str, path: Path) -> dict:
    from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

    payload = path.read_bytes()
    digest = sha256_bytes(payload)
    found = find_existing(svc, folder_id, path.name)
    if len(found) > 1:
        raise RuntimeError(f"Duplicate Drive memory objects found: {path.name}")

    media = MediaFileUpload(str(path), mimetype="application/octet-stream", resumable=False)
    metadata = {"appProperties": {"sha256": digest, "victorMemorySchema": "1"}}
    if found:
        file_id = found[0]["id"]
        result = (
            svc.files()
            .update(
                fileId=file_id,
                body=metadata,
                media_body=media,
                fields="id,name,size,appProperties",
                supportsAllDrives=True,
            )
            .execute()
        )
        action = "updated"
    else:
        metadata.update({"name": path.name, "parents": [folder_id]})
        result = (
            svc.files()
            .create(
                body=metadata,
                media_body=media,
                fields="id,name,size,appProperties",
                supportsAllDrives=True,
            )
            .execute()
        )
        file_id = result["id"]
        action = "created"

    downloaded = io.BytesIO()
    request = svc.files().get_media(fileId=file_id, supportsAllDrives=True)
    downloader = MediaIoBaseDownload(downloaded, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    remote_digest = sha256_bytes(downloaded.getvalue())
    if remote_digest != digest:
        raise RuntimeError(f"Drive verification checksum mismatch: {path.name}")

    return {
        "action": action,
        "file_id": file_id,
        "bytes": len(payload),
        "sha256": digest,
        "verified": True,
    }


def main():
    folder_id = required_env("GOOGLE_DRIVE_FOLDER_ID")
    svc = drive_service()
    folder = validate_folder(svc, folder_id)

    results = {}
    for name in FILES:
        path = MEM / name
        if not path.is_file():
            raise RuntimeError(f"Required Victor memory file missing: memory/{name}")
        results[name] = upload_one(svc, folder_id, path)

    manifest = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "vickykenin-lang/Dr.-Victor-Multi-AI-Orchestrator",
        "folder_id": folder_id,
        "files": {
            name: {
                "sha256": result["sha256"],
                "bytes": result["bytes"],
                "drive_file_id": result["file_id"],
            }
            for name, result in results.items()
        },
    }
    manifest_path = MEM / ".drive-sync-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    try:
        results[manifest_path.name] = upload_one(svc, folder_id, manifest_path)
    finally:
        manifest_path.unlink(missing_ok=True)

    print(
        json.dumps(
            {
                "status": "SYNC_VERIFIED",
                "auth_mode": "OAUTH_USER_REFRESH_TOKEN",
                "scope": SCOPES[0],
                "folder": folder.get("name"),
                "folder_id": folder_id,
                "files": results,
                "secrets_exposed": False,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
