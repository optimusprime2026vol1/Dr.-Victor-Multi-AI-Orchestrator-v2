from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

MESSAGE_TYPES = {
    "TASK_REQUEST", "TASK_ACCEPTED", "TASK_PROGRESS", "TASK_RESULT",
    "CAPABILITY_REQUEST", "INFORMATION_REQUEST", "INFORMATION_RESPONSE",
    "HANDOFF_REQUEST", "DEPENDENCY_BLOCKED", "EVIDENCE_SUBMITTED",
    "INCIDENT_REPORT", "HEALTH_UPDATE", "ESCALATION",
}
PRIORITIES = {"LOW", "NORMAL", "HIGH", "CRITICAL"}


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def create(*, sender: str, recipient: str, message_type: str, payload: dict[str, Any],
           task_id: str | None = None, parent_objective: str | None = None,
           correlation_id: str | None = None, priority: str = "NORMAL",
           requires_response: bool = False, authority_required: bool = False) -> dict[str, Any]:
    if message_type not in MESSAGE_TYPES:
        raise ValueError("UNSUPPORTED_MESSAGE_TYPE")
    if priority not in PRIORITIES:
        raise ValueError("UNSUPPORTED_PRIORITY")
    return {
        "message_id": f"MSG-{uuid4().hex[:12]}",
        "timestamp_utc": utcnow(),
        "from": sender,
        "to": recipient,
        "type": message_type,
        "parent_objective": parent_objective,
        "task_id": task_id,
        "correlation_id": correlation_id,
        "priority": priority,
        "payload": payload,
        "requires_response": requires_response,
        "authority_required": authority_required,
        "status": "CREATED",
    }
