#!/usr/bin/env python3
"""Safe Telegram bot/chat health check for Dr. Victor.

This script never prints or persists Telegram token/chat-id secret values. It
uses getMe and getChat only; it does not send messages or consume updates.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
STATUS_PATH = ROOT / "data/telegram_runtime_status.json"
TOKEN_ENV = "TELEGRAM_BOT_TOKEN_RIO"
CHAT_ENVS = ("TELEGRAM_CHAT_ID_RIO", "TELEGRAM_CHAT_ID_RIO_UI")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def write_status(status: dict[str, Any]) -> None:
    STATUS_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATUS_PATH.write_text(json.dumps(status, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(status, ensure_ascii=False))


def telegram_call(token: str, method: str, params: dict[str, str] | None = None) -> dict[str, Any]:
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = None
    if params:
        data = urllib.parse.urlencode(params).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        method="POST" if data is not None else "GET",
        headers={"User-Agent": "Dr-Victor-Telegram-Health/1.0"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def safe_failure(exc: Exception) -> dict[str, Any]:
    if isinstance(exc, urllib.error.HTTPError):
        return {"health": "FAILED", "error_class": "HTTPError", "http_status": exc.code}
    if isinstance(exc, urllib.error.URLError):
        return {"health": "FAILED", "error_class": "URLError", "reason_type": type(exc.reason).__name__}
    return {"health": "FAILED", "error_class": type(exc).__name__}


def main() -> int:
    token = (os.environ.get(TOKEN_ENV) or "").strip()
    chat_values = {env: (os.environ.get(env) or "").strip() for env in CHAT_ENVS}

    status: dict[str, Any] = {
        "schema_version": 1,
        "department": "Dr. Victor",
        "checked_at_utc": utc_now(),
        "state": "WAITING_TELEGRAM_CREDENTIAL",
        "credential_presence": {
            "bot_token": "SET" if token else "EMPTY",
            "chat_ids": {env: "SET" if value else "EMPTY" for env, value in chat_values.items()},
        },
        "bot_identity": None,
        "chat_health": [],
        "secret_values_exposed": False,
        "message_sent": False,
        "updates_consumed": False,
    }

    if not token:
        write_status(status)
        return 2

    try:
        me = telegram_call(token, "getMe")
        result = me.get("result") if isinstance(me, dict) else None
        if not me.get("ok") or not isinstance(result, dict):
            status["state"] = "BOT_AUTH_FAILED"
            status["bot_identity"] = {"health": "FAILED", "error_class": "TelegramApiError"}
            write_status(status)
            return 3
        status["bot_identity"] = {
            "health": "HEALTHY",
            "username": result.get("username"),
            "first_name": result.get("first_name"),
            "is_bot": result.get("is_bot"),
        }
    except Exception as exc:
        status["state"] = "BOT_AUTH_FAILED"
        status["bot_identity"] = safe_failure(exc)
        write_status(status)
        return 3

    any_chat = False
    all_configured_healthy = True
    for env, chat_id in chat_values.items():
        if not chat_id:
            continue
        any_chat = True
        try:
            payload = telegram_call(token, "getChat", {"chat_id": chat_id})
            result = payload.get("result") if isinstance(payload, dict) else None
            if payload.get("ok") and isinstance(result, dict):
                status["chat_health"].append(
                    {
                        "credential_env": env,
                        "health": "HEALTHY",
                        "chat_type": result.get("type"),
                        "title": result.get("title"),
                        "username": result.get("username"),
                    }
                )
            else:
                all_configured_healthy = False
                status["chat_health"].append(
                    {"credential_env": env, "health": "FAILED", "error_class": "TelegramApiError"}
                )
        except Exception as exc:
            all_configured_healthy = False
            failure = safe_failure(exc)
            failure["credential_env"] = env
            status["chat_health"].append(failure)

    if not any_chat:
        status["state"] = "BOT_AUTH_OK_WAITING_CHAT_ID"
        write_status(status)
        return 2

    status["state"] = "TELEGRAM_VERIFIED" if all_configured_healthy else "TELEGRAM_PARTIAL"
    write_status(status)
    return 0 if all_configured_healthy else 3


if __name__ == "__main__":
    raise SystemExit(main())
