from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "data" / "orchestration_ledger.jsonl"


def append(event: dict[str, Any]) -> None:
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    record = {"recorded_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), **event}
    with LEDGER.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")


def record_task(task: dict[str, Any], event: str, detail: dict[str, Any] | None = None) -> None:
    append({
        "type": "TASK_EVENT",
        "event": event,
        "task_id": task.get("task_id"),
        "status": task.get("status"),
        "evidence_level": task.get("evidence_level"),
        "department": task.get("department"),
        "detail": detail or {},
    })
