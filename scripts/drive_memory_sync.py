#!/usr/bin/env python3
import json, os
from pathlib import Path
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = Path(__file__).resolve().parents[1]
MEM = ROOT / 'memory'
SCOPES = ['https://www.googleapis.com/auth/drive']
FOLDER_NAME = os.getenv('VICTOR_MEMORY_DRIVE_FOLDER', 'Victor Memory')
FILES = ['founder_memory.json','decisions.jsonl','operational_memory.jsonl','memory_index.json']

def service():
    raw = os.environ['GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON']
    info = json.loads(raw)
    creds = Credentials.from_service_account_info(info, scopes=SCOPES)
    return build('drive','v3',credentials=creds,cache_discovery=False)

def folder_id(svc):
    q = f"name='{FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    r = svc.files().list(
        q=q,
        fields='files(id,name,parents,shared)',
        spaces='drive',
        includeItemsFromAllDrives=True,
        supportsAllDrives=True,
        pageSize=100
    ).execute().get('files',[])
    if not r:
        raise RuntimeError(f'Shared Drive folder not found or not visible to service account: {FOLDER_NAME}')
    return r[0]['id']

def upsert(svc, fid, path):
    q = f"name='{path.name}' and '{fid}' in parents and trashed=false"
    found = svc.files().list(
        q=q,
        fields='files(id,name)',
        spaces='drive',
        includeItemsFromAllDrives=True,
        supportsAllDrives=True,
        pageSize=100
    ).execute().get('files',[])
    media = MediaFileUpload(str(path), mimetype='application/octet-stream', resumable=False)
    if found:
        svc.files().update(fileId=found[0]['id'], media_body=media, supportsAllDrives=True).execute()
        return 'updated'
    svc.files().create(
        body={'name':path.name,'parents':[fid]},
        media_body=media,
        fields='id',
        supportsAllDrives=True
    ).execute()
    return 'created'

def main():
    svc=service(); fid=folder_id(svc); results={}
    for name in FILES:
        p=MEM/name
        if p.exists():
            results[name]=upsert(svc,fid,p)
    print(json.dumps({'status':'SYNC_OK','folder':FOLDER_NAME,'files':results},indent=2))

if __name__=='__main__':
    main()
