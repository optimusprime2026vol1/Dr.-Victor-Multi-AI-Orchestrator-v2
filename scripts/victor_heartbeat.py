#!/usr/bin/env python3
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOUL = ROOT / "VICTOR_SOUL.md"
RULES = ROOT / "VICTOR_MASTER_RULE_BOOK.md"
REGISTRY = ROOT / "data" / "department_registry.json"
OUT = ROOT / "data" / "victor_heartbeat_status.json"

checks = {
    "soul_present": SOUL.exists() and SOUL.stat().st_size > 0,
    "master_rules_present": RULES.exists() and RULES.stat().st_size > 0,
    "department_registry_present": REGISTRY.exists() and REGISTRY.stat().st_size > 0,
}
registry = {}
if checks["department_registry_present"]:
    try:
        registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
        checks["department_credentials_isolated"] = registry.get("credential_policy") == "department_scoped_only" and registry.get("shared_secret_pool") is False
    except Exception:
        checks["department_credentials_isolated"] = False
else:
    checks["department_credentials_isolated"] = False

ready = all(checks.values())
status = {
    "timestamp_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    "state": "READY" if ready else "SAFE_STOP",
    "heartbeat_minutes": 5,
    "checks": checks,
    "telegram_configured": bool(registry.get("telegram", {}).get("configured", False)),
    "note": "Telegram remains unconfigured until Victor's own bot token and common management group chat ID are supplied as repository secrets. Department credentials remain isolated."
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(status, indent=2) + "\n", encoding="utf-8")
print(json.dumps(status))
raise SystemExit(0 if ready else 1)
