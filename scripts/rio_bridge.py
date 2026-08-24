#!/usr/bin/env python3
"""Dr. Victor -> RIO direct backend bridge.

Uses Victor's own narrowly scoped GitHub credential to dispatch RIO's bridge
workflow and poll the committed response. It never uses or reads RIO's Telegram,
AI-provider, Instagram, affiliate, or other department secrets.
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from uuid import uuid4

from victor_governance_gate import require_ready, VictorGovernanceError

TOKEN=(os.environ.get("VICTOR_RIO_GITHUB_TOKEN") or "").strip()
COMMAND=(os.environ.get("VICTOR_RIO_COMMAND") or "").strip()
RIO_REPO="vickykenin-lang/rio-affiliate-engine"
WORKFLOW="victor-bridge.yml"
RESPONSE_PATH="data/victor_bridge_response.json"
API="https://api.github.com"


def gh(path, data=None, method=None):
    headers={
        "Authorization":f"Bearer {TOKEN}",
        "Accept":"application/vnd.github+json",
        "X-GitHub-Api-Version":"2022-11-28",
        "User-Agent":"Dr-Victor-RIO-Bridge/1.0",
    }
    body=json.dumps(data).encode() if data is not None else None
    req=urllib.request.Request(API+path,data=body,method=method,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as r:
        raw=r.read()
        return json.loads(raw) if raw else {}


def fetch_response():
    try:
        doc=gh(f"/repos/{RIO_REPO}/contents/{RESPONSE_PATH}?ref=main")
        raw=base64.b64decode(doc.get("content","")).decode("utf-8")
        return json.loads(raw)
    except Exception:
        return None


def main():
    try:
        require_ready(action="direct_interaction_with_RIO")
    except VictorGovernanceError as exc:
        print(json.dumps({"status":"SAFE_STOP","error":str(exc)},ensure_ascii=False))
        return 3

    if not TOKEN:
        print(json.dumps({
            "status":"FOUNDER_ACTION_REQUIRED",
            "error":"VICTOR_RIO_GITHUB_TOKEN is missing in Victor repository secrets.",
            "required":"Fine-grained GitHub token owned by Victor, scoped only to rio-affiliate-engine with Actions: Read/Write and Contents: Read."
        },ensure_ascii=False))
        return 2
    if not COMMAND:
        print(json.dumps({"status":"FAILED","error":"VICTOR_RIO_COMMAND is empty"},ensure_ascii=False))
        return 2

    request_id=f"victor-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{uuid4().hex[:8]}"
    payload={"ref":"main","inputs":{"request_id":request_id,"command":COMMAND[:5000]}}
    try:
        gh(f"/repos/{RIO_REPO}/actions/workflows/{WORKFLOW}/dispatches",payload,"POST")
    except urllib.error.HTTPError as exc:
        body=exc.read().decode(errors="replace")
        print(json.dumps({"status":"DISPATCH_FAILED","http":exc.code,"detail":body[:1000]},ensure_ascii=False))
        return 1

    deadline=time.time()+240
    while time.time()<deadline:
        response=fetch_response()
        if isinstance(response,dict) and response.get("request_id")==request_id:
            print(json.dumps(response,ensure_ascii=False))
            return 0 if response.get("status") in {"RESPONDED","COMPLETED","NO_EXECUTION"} or response.get("execution_ok") is True else 1
        time.sleep(8)

    print(json.dumps({
        "status":"TIMEOUT_WAITING_FOR_RIO",
        "request_id":request_id,
        "detail":"RIO workflow was dispatched but matching committed response was not observed within 240 seconds. Do not treat as completion."
    },ensure_ascii=False))
    return 1


if __name__=="__main__":
    sys.exit(main())
