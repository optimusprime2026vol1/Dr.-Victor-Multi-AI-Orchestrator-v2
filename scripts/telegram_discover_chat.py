#!/usr/bin/env python3
"""One-time safe discovery of Victor's Telegram management group chat ID.

This helper is intentionally separate from the normal health checker because
getUpdates consumes bot updates. It only reacts to an explicit /chatid command
in a group/supergroup, replies with the chat ID inside that Telegram group, and
persists only a SHA-256 fingerprint (never the raw chat ID or bot token).
"""
from __future__ import annotations

import hashlib
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
STATUS_PATH = ROOT / "data" / "telegram_chat_discovery_status.json"
TOKEN_ENV = "TELEGRAM_BOT_TOKEN_VICTOR"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def tg(token: str, method: str, params: dict[str, str] | None = None) -> dict[str, Any]:
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = urllib.parse.urlencode(params).encode("utf-8") if params else None
    req = urllib.request.Request(url, data=data, method="POST" if data else "GET", headers={"User-Agent": "Victor-Chat-Discovery/1.0"})
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def save(status: dict[str, Any]) -> None:
    STATUS_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATUS_PATH.write_text(json.dumps(status, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(status, ensure_ascii=False))


def main() -> int:
    token = (os.environ.get(TOKEN_ENV) or "").strip()
    base: dict[str, Any] = {
        "schema_version": 1,
        "department": "Dr. Victor",
        "checked_at_utc": utc_now(),
        "state": "STARTING",
        "token_present": bool(token),
        "secret_values_exposed": False,
        "raw_chat_id_persisted": False,
        "updates_consumed": False,
        "message_sent": False,
    }
    if not token:
        base["state"] = "WAITING_VICTOR_TELEGRAM_CREDENTIAL"
        save(base)
        return 2

    me = tg(token, "getMe")
    me_result = me.get("result") or {}
    if not me.get("ok") or not me_result.get("is_bot"):
        base["state"] = "BOT_AUTH_FAILED"
        save(base)
        return 3
    username = str(me_result.get("username") or "")
    base["bot_username"] = username

    webhook = tg(token, "getWebhookInfo")
    webhook_url = str((webhook.get("result") or {}).get("url") or "")
    if webhook_url:
        base["state"] = "WEBHOOK_ACTIVE_DISCOVERY_ABORTED"
        base["webhook_configured"] = True
        save(base)
        return 4
    base["webhook_configured"] = False

    updates_payload = tg(token, "getUpdates", {"timeout": "0", "limit": "100", "allowed_updates": json.dumps(["message"])})
    updates = updates_payload.get("result") or []
    target = None
    for update in reversed(updates):
        msg = update.get("message") or {}
        chat = msg.get("chat") or {}
        text = str(msg.get("text") or "").strip()
        command = text.split(None, 1)[0].lower() if text else ""
        valid_command = command == "/chatid" or (username and command == f"/chatid@{username.lower()}")
        if valid_command and chat.get("type") in {"group", "supergroup"}:
            target = (update, chat)
            break

    if not target:
        base["state"] = "CHATID_COMMAND_NOT_FOUND"
        base["pending_update_count"] = len(updates)
        save(base)
        return 5

    update, chat = target
    chat_id = str(chat.get("id"))
    reply = (
        "Victor management group detected ✅\n"
        f"Chat ID: {chat_id}\n\n"
        "Add this exact value to the Victor GitHub Actions secret:\n"
        "TELEGRAM_MANAGEMENT_CHAT_ID\n\n"
        "Do not share the bot token in Telegram or chat."
    )
    sent = tg(token, "sendMessage", {"chat_id": chat_id, "text": reply, "disable_web_page_preview": "true"})
    if not sent.get("ok"):
        base["state"] = "CHAT_FOUND_REPLY_FAILED"
        save(base)
        return 6

    update_id = int(update.get("update_id"))
    tg(token, "getUpdates", {"offset": str(update_id + 1), "timeout": "0", "limit": "1"})

    base.update({
        "state": "CHAT_ID_DELIVERED_IN_TELEGRAM",
        "chat_type": chat.get("type"),
        "chat_title": chat.get("title"),
        "chat_id_sha256": hashlib.sha256(chat_id.encode("utf-8")).hexdigest(),
        "updates_consumed": True,
        "message_sent": True,
    })
    save(base)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
