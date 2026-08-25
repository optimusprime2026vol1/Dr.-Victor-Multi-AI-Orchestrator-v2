from __future__ import annotations

from typing import Any

# Phase 1 is deliberately non-destructive. These capabilities require a future
# explicit authorization mechanism before an executor may implement them.
BLOCKED_CAPABILITIES = {
    "spend_money",
    "publish_external",
    "delete_external",
    "modify_external",
    "send_message_external",
    "use_department_secret",
}


def evaluate(task: dict[str, Any], state: dict[str, Any]) -> dict[str, Any]:
    requested = set(task.get("capabilities", []))
    blocked = sorted(requested & BLOCKED_CAPABILITIES)
    security = state.get("security", {})

    reasons: list[str] = []
    if not state.get("victor", {}).get("ai_ready", False):
        reasons.append("VICTOR_AI_NOT_READY")
    if security.get("department_credentials_isolated") is not True:
        reasons.append("CREDENTIAL_ISOLATION_NOT_VERIFIED")
    if security.get("secret_values_exposed") is True:
        reasons.append("SECRET_EXPOSURE_REPORTED")
    if blocked:
        reasons.append("EXPLICIT_AUTHORIZATION_REQUIRED")

    return {
        "allowed": not reasons,
        "blocked_capabilities": blocked,
        "reasons": reasons,
        "mode": "FAIL_CLOSED",
    }
