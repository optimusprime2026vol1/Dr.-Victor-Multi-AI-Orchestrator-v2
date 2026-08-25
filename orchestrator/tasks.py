from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_task(objective: str, department: str | None, capabilities: list[str] | None = None) -> dict[str, Any]:
    created = utc_now()
    digest = hashlib.sha256(f"{created}|{objective}|{department}".encode()).hexdigest()[:16]
    return {
        "task_id": f"victor-{digest}",
        "created_at_utc": created,
        "objective": objective,
        "department": department,
        "capabilities": capabilities or [],
        "status": "CREATED",
        "evidence_level": "OBSERVED",
        "history": [{"at_utc": created, "status": "CREATED"}],
    }


def transition(task: dict[str, Any], status: str, evidence_level: str | None = None) -> None:
    task["status"] = status
    if evidence_level:
        task["evidence_level"] = evidence_level
    task.setdefault("history", []).append({
        "at_utc": utc_now(),
        "status": status,
        "evidence_level": task.get("evidence_level"),
    })
