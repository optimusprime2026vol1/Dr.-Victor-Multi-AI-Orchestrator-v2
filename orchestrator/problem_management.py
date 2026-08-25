from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
INCIDENT_LEDGER = ROOT / "data" / "incident_ledger.jsonl"


def recurrence_count(department: str | None, category: str | None) -> int:
    if not INCIDENT_LEDGER.exists():
        return 0
    incident_ids: set[str] = set()
    for line in INCIDENT_LEDGER.read_text(encoding="utf-8").splitlines():
        try:
            row = json.loads(line)
        except Exception:
            continue
        if row.get("event") != "DETECTED":
            continue
        if row.get("department") == department:
            # Category is held on the incident itself; DETECTED ledger rows may not include it yet.
            incident_ids.add(str(row.get("incident_id")))
    return len(incident_ids)


def evaluate(incident: dict[str, Any], threshold: int = 3) -> dict[str, Any]:
    count = recurrence_count(incident.get("department"), incident.get("category"))
    recurring = count >= threshold
    return {
        "recurring": recurring,
        "observed_incidents_for_department": count,
        "threshold": threshold,
        "action": "OPEN_PROBLEM_RECORD" if recurring else "NORMAL_INCIDENT_RECOVERY",
    }
