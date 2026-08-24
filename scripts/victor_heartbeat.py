#!/usr/bin/env python3
"""Victor management heartbeat with fail-closed governance readiness."""
import json
from datetime import datetime, timezone
from pathlib import Path
from victor_governance_gate import evaluate

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data" / "department_registry.json"
OUT = ROOT / "data" / "victor_heartbeat_status.json"

registry = {}
try:
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
except Exception:
    registry = {}

governance = evaluate(action="victor_heartbeat_readiness", write_status=True)
ready = governance["valid"]
status = {
    "timestamp_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    "state": "READY" if ready else "SAFE_STOP",
    "heartbeat_minutes": 5,
    "hard_fail_closed": True,
    "governance_gate": {
        "valid": governance["valid"],
        "failed_checks": governance["failed_checks"],
        "execution_effect": governance["execution_effect"],
        "soul_sha256": governance["soul_sha256"],
        "master_rule_book_sha256": governance["master_rule_book_sha256"],
        "executive_charter_sha256": governance["executive_charter_sha256"],
    },
    "checks": governance["checks"],
    "telegram_configured": bool(registry.get("telegram", {}).get("configured", False)),
    "management_model": "Founder Vicky -> Dr. Victor -> all department AIs / department heads",
    "daily_report_required": True,
    "founder_meeting_local_time": "22:00",
    "note": (
        "Victor governance READY. Consequential orchestration is allowed only through entry points that call the common governance gate; normal Founder/department authority gates remain in force."
        if ready else
        "Victor SAFE_STOP. Consequential orchestration is blocked by the common governance gate; diagnostics/reporting may continue until the failed governance precondition is repaired."
    ),
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(status, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(status, ensure_ascii=False))
raise SystemExit(0 if ready else 1)
