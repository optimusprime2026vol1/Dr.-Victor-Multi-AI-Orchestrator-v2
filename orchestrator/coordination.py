from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .messages import create

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "data" / "coordination_ledger.jsonl"
INBOX_ROOT = ROOT / "data" / "coordination_inbox"

# Informational collaboration may flow directly but is always logged.
DIRECT_TYPES = {"INFORMATION_REQUEST", "INFORMATION_RESPONSE", "TASK_PROGRESS", "EVIDENCE_SUBMITTED", "HEALTH_UPDATE"}
# Consequential work/authority requests are mediated by Victor.
VICTOR_MEDIATED_TYPES = {"TASK_REQUEST", "CAPABILITY_REQUEST", "HANDOFF_REQUEST", "DEPENDENCY_BLOCKED", "INCIDENT_REPORT", "ESCALATION"}


def _append(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")


def send(*, sender: str, recipient: str, message_type: str, payload: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
    msg = create(sender=sender, recipient=recipient, message_type=message_type, payload=payload, **kwargs)
    original_recipient = recipient

    if sender != "victor" and recipient != "victor" and message_type in VICTOR_MEDIATED_TYPES:
        msg["requested_recipient"] = original_recipient
        msg["to"] = "victor"
        msg["status"] = "AWAITING_VICTOR_MEDIATION"
    elif sender != "victor" and recipient != "victor" and message_type not in DIRECT_TYPES:
        msg["requested_recipient"] = original_recipient
        msg["to"] = "victor"
        msg["status"] = "AWAITING_VICTOR_MEDIATION"
    else:
        msg["status"] = "DELIVERED"

    _append(LEDGER, msg)
    _append(INBOX_ROOT / f"{msg['to']}.jsonl", msg)
    return msg


def acknowledge(message: dict[str, Any], actor: str) -> dict[str, Any]:
    event = {
        "event": "MESSAGE_ACKNOWLEDGED",
        "message_id": message["message_id"],
        "actor": actor,
        "timestamp_utc": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(timespec="seconds"),
    }
    _append(LEDGER, event)
    return event
