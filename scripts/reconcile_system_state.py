#!/usr/bin/env python3
"""Reconcile Victor evidence plus active Founder decisions into canonical current state."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MEMORY = ROOT / "memory"
OUT = DATA / "system_state.json"


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    except Exception:
        return {}


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            item = json.loads(line)
            if str(item.get("status", "active")).lower() == "active":
                out.append(item)
        except Exception:
            continue
    return out


def decision_text(item: dict[str, Any]) -> str:
    return str(item.get("summary") or item.get("text") or "").lower()


def decision_flags(decisions: list[dict[str, Any]]) -> dict[str, bool]:
    text = "\n".join(decision_text(item) for item in decisions)
    return {
        "aura2_hold": ("aura2" in text or "aura 2" in text) and "hold" in text,
        "rio_parked": "rio" in text and "parked" in text,
        "strict_supervision": "strict" in text and "supervis" in text,
        "victor_credential_authority": "credential" in text and "victor" in text and "authority" in text,
        "hulk_business_rnd": "hulk" in text and ("opportunity-discovery" in text or "business r&d" in text or "online business" in text),
    }


def main() -> int:
    ai = load(DATA / "ai_runtime_status.json")
    telegram = load(DATA / "telegram_runtime_status.json")
    registry = load(DATA / "department_registry.json")
    management = load(DATA / "management_protocol.json")
    vision = load(ROOT / "vision" / "status.json")
    decisions = load_jsonl(MEMORY / "decisions.jsonl")
    flags = decision_flags(decisions)

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

    departments: dict[str, Any] = {}
    for dept in registry.get("departments", []):
        if not isinstance(dept, dict) or not dept.get("id"):
            continue
        current = {
            "name": dept.get("name"),
            "registry_status": dept.get("status", "UNKNOWN"),
            "enabled": dept.get("enabled"),
            "credentials_scope": dept.get("credentials_scope"),
            "victor_connection": dept.get("victor_connection", "NOT_VERIFIED"),
            "live_certification": dept.get("live_certification", "NOT_VERIFIED"),
            "business_execution": dept.get("business_execution", "UNKNOWN"),
            "runtime_status": None,
        }
        if dept["id"] == "aura2" and flags["aura2_hold"]:
            current["registry_status"] = "HOLD"
            current["enabled"] = False
            current["effective_state_source"] = "ACTIVE_FOUNDER_DECISION"
        if dept["id"] == "rio" and flags["rio_parked"]:
            current["registry_status"] = "PARKED"
            current["business_execution"] = "BLOCKED_PENDING_FOUNDER_ACTIVATION"
            current["effective_state_source"] = "ACTIVE_FOUNDER_DECISION"
        departments[dept["id"]] = current

    if "vision" in departments and vision:
        departments["vision"]["runtime_status"] = {
            "overall": vision.get("overall"),
            "phase": vision.get("phase"),
            "current_episode": vision.get("current_episode"),
            "episode_status": vision.get("episode_status"),
        }

    state = {
        "schema_version": 2,
        "generated_at_utc": now(),
        "canonical": True,
        "decision_rule": "Fresh runtime evidence controls observed live facts; active Founder decisions control current governed state; stale historical plan text cannot override them.",
        "overall_state": "READY_WITH_CONFLICTS" if ai_ready and tg_verified and conflicts else ("READY" if ai_ready and tg_verified else "DEGRADED"),
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
            "credential_broker_model": management.get("security", {}).get("credential_broker_model"),
            "credential_use_authority": management.get("security", {}).get("credential_use_authority"),
            "raw_secret_disclosure_prohibited": management.get("security", {}).get("raw_secret_disclosure_prohibited", True),
            "secret_values_exposed": bool(ai.get("secret_values_exposed", False) or telegram.get("secret_values_exposed", False)),
        },
        "management": {
            "hierarchy": management.get("hierarchy"),
            "heartbeat": management.get("heartbeat"),
            "strict_supervision": flags["strict_supervision"],
            "daily_executive_report_required": management.get("daily_executive_report", {}).get("required"),
            "founder_meeting_local_time": management.get("founder_meeting", {}).get("local_time"),
        },
        "active_founder_decisions": decisions,
        "effective_decision_flags": flags,
        "departments": departments,
        "conflicts": conflicts,
        "evidence": {
            "ai_runtime": "data/ai_runtime_status.json",
            "telegram_runtime": "data/telegram_runtime_status.json",
            "department_registry": "data/department_registry.json",
            "management_protocol": "data/management_protocol.json",
            "founder_decisions": "memory/decisions.jsonl",
            "vision_runtime": "vision/status.json",
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(state, ensure_ascii=False))
    return 0 if ai_ready and tg_verified else 1


if __name__ == "__main__":
    raise SystemExit(main())
