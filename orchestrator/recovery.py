from __future__ import annotations

from typing import Any

from .incidents import transition

MAX_TONY_REPAIR_ATTEMPTS = 2
MAX_VICTOR_GUIDED_ATTEMPTS = 1

AUTO_CATEGORIES = {"CODE_ERROR", "CONFIG_ERROR", "WORKFLOW_ERROR", "DEPENDENCY_ERROR", "DATA_ERROR", "TIMEOUT", "PROVIDER_ERROR"}
FOUNDER_CATEGORIES = {"CREDENTIAL_ERROR", "SECURITY_ERROR", "QUOTA_ERROR"}


def assign_tony(incident: dict[str, Any]) -> dict[str, Any]:
    transition(incident, "TONY_ASSIGNED", {"repair_owner": "tony_stark"})
    transition(incident, "DIAGNOSING", {"category": incident.get("category")})
    category = incident.get("category")
    if category in FOUNDER_CATEGORIES:
        transition(incident, "VICTOR_ESCALATED", {"reason": "OUTSIDE_TONY_AUTONOMOUS_AUTHORITY"})
        return {"status": "VICTOR_ESCALATED", "next": "VICTOR_ANALYSIS", "founder_may_be_required": True}
    if category not in AUTO_CATEGORIES:
        transition(incident, "VICTOR_ESCALATED", {"reason": "UNKNOWN_OR_UNSAFE_REPAIR_CLASS"})
        return {"status": "VICTOR_ESCALATED", "next": "VICTOR_ANALYSIS", "founder_may_be_required": False}
    # Real repair adapters are intentionally not yet connected. Tony prepares a bounded repair work package.
    incident["repair_attempts"] += 1
    transition(incident, "REPAIRING", {"attempt": incident["repair_attempts"], "mode": "SAFE_REPAIR_WORK_PACKAGE"})
    return {
        "status": "REPAIRING",
        "next": "TONY_REAL_REPAIR_ADAPTER_REQUIRED",
        "repair_attempt": incident["repair_attempts"],
        "max_repair_attempts": MAX_TONY_REPAIR_ATTEMPTS,
        "requires_live_verification": True,
    }


def victor_escalation(incident: dict[str, Any], reason: str) -> dict[str, Any]:
    incident["victor_guided_attempts"] += 1
    if incident["victor_guided_attempts"] > MAX_VICTOR_GUIDED_ATTEMPTS:
        transition(incident, "FOUNDER_ESCALATED", {"reason": "VICTOR_GUIDED_RETRY_LIMIT_EXHAUSTED"})
        return {"status": "FOUNDER_ESCALATED", "founder_decision_required": True}
    transition(incident, "VICTOR_ESCALATED", {"reason": reason, "guided_attempt": incident["victor_guided_attempts"]})
    return {"status": "VICTOR_ESCALATED", "next": "VICTOR_PROPOSE_REPAIR_PLAN", "founder_decision_required": False}
