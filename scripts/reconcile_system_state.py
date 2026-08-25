#!/usr/bin/env python3
"""Reconcile Victor's evidence files into one canonical system state.

Evidence files remain authoritative for their own observations. This script
creates the single decision-facing view used by Victor and explicitly records
conflicts instead of silently overwriting evidence.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = DATA / "system_state.json"


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    except Exception:
        return {}


def main() -> int:
    ai = load(DATA / "ai_runtime_status.json")
    telegram = load(DATA / "telegram_runtime_status.json")
    registry = load(DATA / "department_registry.json")
    management = load(DATA / "management_protocol.json")
    vision = load(ROOT / "vision" / "status.json")

    conflicts: list[dict[str, Any]] = []
    tg_verified = bool(
        telegram.get("binding_scope") == "VICTOR"
        and telegram.get("binding_allowed") is True
        and telegram.get("private_binding_verified") is True
    )
    registry_tg = bool(registry.get("telegram", {}).get("configured", False))
    if tg_verified != registry_tg:
        conflicts.append({
            "field": "communications.telegram.configured",
            "registry_value": registry_tg,
            "runtime_evidence_value": tg_verified,
            "resolution": "runtime_evidence_wins",
        })

    ai_ready = ai.get("state") == "READY" and ai.get("provider_health", {}).get("health") == "HEALTHY"
    credential_isolation = (
        registry.get("credential_policy") == "department_scoped_only"
        and registry.get("shared_secret_pool") is False
    )

    departments = {}
    for dept in registry.get("departments", []):
        if not isinstance(dept, dict) or not dept.get("id"):
            continue
        departments[dept["id"]] = {
            "name": dept.get("name"),
            "registry_status": dept.get("status", "UNKNOWN"),
            "credentials_scope": dept.get("credentials_scope"),
            "runtime_status": None,
        }
    if "vision" in departments and vision:
        departments["vision"]["runtime_status"] = {
            "overall": vision.get("overall"),
            "phase": vision.get("phase"),
            "current_episode": vision.get("current_episode"),
            "episode_status": vision.get("episode_status"),
        }

    state = {
        "schema_version": 1,
        "generated_at_utc": now(),
        "canonical": True,
        "decision_rule": "Victor decisions use this reconciled state; source files remain evidence.",
        "overall_state": "READY_WITH_CONFLICTS" if ai_ready and tg_verified and conflicts else (
            "READY" if ai_ready and tg_verified else "DEGRADED"
        ),
        "victor": {
            "ai_ready": ai_ready,
            "provider": ai.get("selected_provider"),
            "model": ai.get("selected_model"),
            "runtime_checked_at_utc": ai.get("checked_at_utc"),
        },
        "communications": {
            "telegram": {
                "configured": tg_verified,
                "state": telegram.get("state", "UNKNOWN"),
                "private_binding_verified": bool(telegram.get("private_binding_verified", False)),
                "management_binding_verified": bool(telegram.get("management_binding_verified", False)),
                "checked_at_utc": telegram.get("checked_at_utc"),
            }
        },
        "security": {
            "department_credentials_isolated": credential_isolation,
            "shared_secret_pool": registry.get("shared_secret_pool"),
            "secret_values_exposed": bool(ai.get("secret_values_exposed", False) or telegram.get("secret_values_exposed", False)),
        },
        "management": {
            "hierarchy": management.get("hierarchy"),
            "heartbeat_minutes": management.get("heartbeat_minutes"),
            "daily_executive_report_required": management.get("daily_executive_report", {}).get("required"),
            "founder_meeting_local_time": management.get("founder_meeting", {}).get("local_time"),
        },
        "departments": departments,
        "conflicts": conflicts,
        "evidence": {
            "ai_runtime": "data/ai_runtime_status.json",
            "telegram_runtime": "data/telegram_runtime_status.json",
            "department_registry": "data/department_registry.json",
            "management_protocol": "data/management_protocol.json",
            "vision_runtime": "vision/status.json",
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(state, ensure_ascii=False))
    return 0 if ai_ready and tg_verified and credential_isolation else 1


if __name__ == "__main__":
    raise SystemExit(main())
