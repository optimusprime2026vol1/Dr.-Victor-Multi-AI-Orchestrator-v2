from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "data" / "incident_ledger.jsonl"

CATEGORIES = {
    "AUTH": "AUTH_ERROR", "401": "AUTH_ERROR", "403": "AUTH_ERROR",
    "CREDENTIAL": "CREDENTIAL_ERROR", "SECRET": "CREDENTIAL_ERROR",
    "TIMEOUT": "TIMEOUT", "RATE": "RATE_LIMIT", "429": "RATE_LIMIT",
    "QUOTA": "QUOTA_ERROR", "CONFIG": "CONFIG_ERROR",
    "WORKFLOW": "WORKFLOW_ERROR", "DEPENDENCY": "DEPENDENCY_ERROR",
    "SECURITY": "SECURITY_ERROR", "DATA": "DATA_ERROR",
    "PROVIDER": "PROVIDER_ERROR", "CODE": "CODE_ERROR",
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def classify(execution: dict[str, Any]) -> str:
    text = " ".join(str(execution.get(k, "")) for k in ("reason", "error", "message")).upper()
    for needle, category in CATEGORIES.items():
        if needle in text:
            return category
    return "UNKNOWN_ERROR"


def severity(fallback_available: bool, critical: bool = False) -> str:
    if critical and not fallback_available:
        return "SEV-1"
    if not fallback_available:
        return "SEV-2"
    return "SEV-3"


def open_incident(task: dict[str, Any], execution: dict[str, Any], fallback_available: bool = False) -> dict[str, Any]:
    incident = {
        "incident_id": f"INC-{uuid.uuid4().hex[:10].upper()}",
        "created_at_utc": _now(),
        "updated_at_utc": _now(),
        "status": "DETECTED",
        "department": task.get("department"),
        "capabilities": task.get("capabilities", []),
        "task_id": task.get("task_id"),
        "category": classify(execution),
        "severity": severity(fallback_available),
        "repair_owner": "tony_stark",
        "repair_attempts": 0,
        "victor_guided_attempts": 0,
        "business_task_status": "CONTINUITY_REQUIRED",
        "evidence": [{"at": _now(), "event": "FAILURE_OBSERVED", "execution": execution}],
    }
    record(incident, "DETECTED")
    return incident


def transition(incident: dict[str, Any], status: str, detail: dict[str, Any] | None = None) -> None:
    incident["status"] = status
    incident["updated_at_utc"] = _now()
    if detail:
        incident.setdefault("evidence", []).append({"at": _now(), "event": status, **detail})
    record(incident, status, detail)


def record(incident: dict[str, Any], event: str, detail: dict[str, Any] | None = None) -> None:
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    row = {"at": _now(), "event": event, "incident_id": incident.get("incident_id"), "department": incident.get("department"), "status": incident.get("status"), "detail": detail or {}}
    with LEDGER.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")
