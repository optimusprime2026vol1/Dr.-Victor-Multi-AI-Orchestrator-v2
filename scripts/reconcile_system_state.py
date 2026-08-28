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
        "rio_active_governed": "rio" in text and "active_governed" in text,
        "strict_supervision": "strict" in text and "supervis" in text,
        "victor_credential_authority": "credential" in text and "victor" in text and "authority" in text,
        "hulk_business_rnd": "hulk" in text and ("opportunity-discovery" in text or "business r&d" in text or "online business" in text),
    }


def main() -> int:
    ai = load(DATA / "ai_runtime_status.json")
    telegram = load(DATA / "telegram_runtime_status.json")
    registry = load(DATA / "department_registry.json")
    management = load(DATA / "management_protocol.json")
    report_card_policy = load(DATA / "victor_report_card_policy.json")
    runtime_ownership = load(DATA / "runtime_ownership.json")
    revenue_outcomes = load(DATA / "revenue_outcomes.json")
    department_contracts = {
        "aura3": load(ROOT / "departments" / "aura3.json"),
        "rio": load(ROOT / "departments" / "rio.json"),
    }
    vision = load(ROOT / "vision" / "status.json")
    decisions = load_jsonl(MEMORY / "decisions.jsonl")
    flags = decision_flags(decisions)

    conflicts: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    tg_verified = bool(
        telegram.get("binding_scope") == "VICTOR"
        and telegram.get("binding_allowed") is True
        and telegram.get("private_binding_verified") is True
        and telegram.get("state") == "VICTOR_TELEGRAM_VERIFIED"
    )
    registry_tg = bool(registry.get("telegram", {}).get("configured", False))

    # A stale source mismatch is not an operational conflict when fresh runtime evidence is healthy.
    # Keep it as a warning for audit visibility. Only an actual/unresolved Telegram runtime problem
    # should create an active conflict.
    if tg_verified:
        if registry_tg != tg_verified:
            warnings.append({
                "field": "communications.telegram.configured",
                "registry_value": registry_tg,
                "runtime_evidence_value": tg_verified,
                "resolution": "runtime_evidence_wins",
                "status": "RESOLVED_SOURCE_MISMATCH",
            })
    else:
        conflicts.append({
            "field": "communications.telegram.runtime",
            "registry_configured": registry_tg,
            "runtime_verified": False,
            "runtime_state": telegram.get("state", "UNKNOWN"),
            "resolution": "UNRESOLVED_RUNTIME_ERROR",
            "status": "ACTIVE_CONFLICT",
        })

    ai_ready = ai.get("state") == "READY" and ai.get("provider_health", {}).get("health") == "HEALTHY"
    if not ai_ready:
        conflicts.append({
            "field": "victor.ai_runtime",
            "runtime_state": ai.get("state", "UNKNOWN"),
            "provider_health": ai.get("provider_health", {}).get("health", "UNKNOWN"),
            "resolution": "UNRESOLVED_RUNTIME_ERROR",
            "status": "ACTIVE_CONFLICT",
        })

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
        if dept["id"] == "rio" and flags["rio_active_governed"]:
            current["registry_status"] = "ACTIVE_GOVERNED"; current["enabled"] = True
            current["business_execution"] = "GOVERNED_AUTONOMOUS_ENABLED"
            current["effective_state_source"] = "ACTIVE_FOUNDER_DECISION"
        departments[dept["id"]] = current

    # A registry claim must agree with Victor's department contract snapshot.
    # This prevents optimistic registry values from silently overriding a stale
    # or contradictory connection/certification contract.
    for department_id, contract in department_contracts.items():
        current = departments.get(department_id)
        if not current or not contract:
            continue
        contract_connection = (
            contract.get("transport", {}).get("status")
            if department_id == "aura3"
            else contract.get("victor_connection")
        )
        contract_live = contract.get("live_certification")
        comparisons = [
            ("victor_connection", current.get("victor_connection"), contract_connection),
            ("live_certification", current.get("live_certification"), contract_live),
        ]
        for field, registry_value, contract_value in comparisons:
            if contract_value and registry_value != contract_value:
                conflicts.append({
                    "field": f"departments.{department_id}.{field}",
                    "registry_value": registry_value,
                    "contract_value": contract_value,
                    "resolution": "RECONCILE_REGISTRY_AND_DEPARTMENT_CONTRACT",
                    "status": "ACTIVE_CONFLICT",
                })

    # Founder decisions are authoritative, but the registry must not silently
    # contradict them. Surface drift until the source record is reconciled.
    rio_registry = next((d for d in registry.get("departments", []) if d.get("id") == "rio"), {})
    if flags["rio_parked"] and rio_registry.get("status") != "PARKED":
        conflicts.append({
            "field": "departments.rio.registry_status",
            "registry_value": rio_registry.get("status", "UNKNOWN"),
            "founder_decision_value": "PARKED",
            "resolution": "RECONCILE_DEPARTMENT_REGISTRY",
            "status": "ACTIVE_CONFLICT",
        })

    if "vision" in departments and vision:
        departments["vision"]["runtime_status"] = {
            "overall": vision.get("overall"),
            "phase": vision.get("phase"),
            "current_episode": vision.get("current_episode"),
            "episode_status": vision.get("episode_status"),
        }

    if ai_ready and tg_verified and not conflicts:
        overall_state = "READY"
    elif conflicts:
        overall_state = "DEGRADED_WITH_CONFLICTS"
    else:
        overall_state = "DEGRADED"

    state = {
        "schema_version": 3,
        "generated_at_utc": now(),
        "canonical": True,
        "decision_rule": "Fresh runtime evidence controls observed live facts. Resolved source mismatches are warnings, not active conflicts. Active conflicts represent unresolved runtime errors or contradictory evidence without a valid resolution.",
        "overall_state": overall_state,
        "clear": overall_state == "READY",
        "victor": {
            "ai_ready": ai_ready,
            "provider": ai.get("selected_provider"),
            "model": ai.get("selected_model"),
            "runtime_checked_at_utc": ai.get("checked_at_utc"),
        },
        "communications": {
            "telegram": {
                "configured": tg_verified,
                "verified": tg_verified,
                "state": telegram.get("state", "UNKNOWN"),
                "private_binding_verified": bool(telegram.get("private_binding_verified", False)),
                "management_binding_verified": bool(telegram.get("management_binding_verified", False)),
                "checked_at_utc": telegram.get("checked_at_utc"),
            }
        },
        "security": {
            "credential_broker_model": management.get("security", {}).get("credential_broker_model"),
            "credential_use_authority": management.get("security", {}).get("credential_use_authority"),
            "shared_secret_pool": False,
            "credential_storage": management.get("security", {}).get("credential_vault_runtime_location"),
            "founder_approval_gate": "CREDENTIAL_ADMINISTRATION_ONLY",
            "raw_secret_disclosure_prohibited": management.get("security", {}).get("raw_secret_disclosure_prohibited", True),
            "secret_values_exposed": bool(ai.get("secret_values_exposed", False) or telegram.get("secret_values_exposed", False)),
        },
        "management": {
            "hierarchy": management.get("hierarchy"),
            "heartbeat": management.get("heartbeat"),
            "strict_supervision": flags["strict_supervision"],
            "daily_executive_report_required": management.get("daily_executive_report", {}).get("required"),
            "founder_meeting_local_time": management.get("founder_meeting", {}).get("local_time"),
            "production_control_plane": runtime_ownership.get("production_control_plane", {}).get("owner"),
            "department_execution_plane": runtime_ownership.get("department_execution_plane", {}).get("owner"),
            "duplicate_production_controller": not bool(runtime_ownership.get("no_duplicate_production_controller", False)),
            "victor_report_card": {
                "target": report_card_policy.get("scale", {}).get("target", 10),
                "basis": report_card_policy.get("basis", "VERIFIED_DEPARTMENT_FINAL_OUTCOMES_ONLY"),
            },
        },
        "business_outcomes": {
            "source": "data/revenue_outcomes.json",
            "status": revenue_outcomes.get("status", "NOT_VERIFIED"),
            "currency": revenue_outcomes.get("currency", "INR"),
            "verified_totals": revenue_outcomes.get("verified_totals", {}),
            "truth_rule": revenue_outcomes.get("truth_rule"),
        },
        "active_founder_decisions": decisions,
        "effective_decision_flags": flags,
        "departments": departments,
        "conflicts": conflicts,
        "warnings": warnings,
        "evidence": {
            "ai_runtime": "data/ai_runtime_status.json",
            "telegram_runtime": "data/telegram_runtime_status.json",
            "department_registry": "data/department_registry.json",
            "aura3_contract": "departments/aura3.json",
            "rio_contract": "departments/rio.json",
            "management_protocol": "data/management_protocol.json",
            "runtime_ownership": "data/runtime_ownership.json",
            "victor_report_card_policy": "data/victor_report_card_policy.json",
            "revenue_outcomes": "data/revenue_outcomes.json",
            "founder_decisions": "memory/decisions.jsonl",
            "vision_runtime": "vision/status.json",
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(state, ensure_ascii=False))
    return 0 if overall_state == "READY" else 1


if __name__ == "__main__":
    raise SystemExit(main())
