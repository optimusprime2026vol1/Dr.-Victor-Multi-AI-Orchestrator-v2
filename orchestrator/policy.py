from __future__ import annotations

from typing import Any

# Founder-locked SELF_MODE: only credential administration retains a
# per-action Founder approval gate. Existing department-scoped credentials may
# be used inside their configured purpose and automatic controls.
FOUNDER_GATED_CAPABILITIES = {
    "add_credential",
    "create_credential",
    "replace_credential",
    "rotate_credential",
    "revoke_credential",
    "expand_credential_scope",
    "expand_account_identity_scope",
}


def evaluate(task: dict[str, Any], state: dict[str, Any]) -> dict[str, Any]:
    requested = set(task.get("capabilities", []))
    blocked = sorted(requested & FOUNDER_GATED_CAPABILITIES)
    security = state.get("security", {})

    reasons: list[str] = []
    if not state.get("victor", {}).get("ai_ready", False):
        reasons.append("VICTOR_AI_NOT_READY")
    if security.get("department_credentials_isolated") is not True:
        reasons.append("CREDENTIAL_ISOLATION_NOT_VERIFIED")
    if security.get("secret_values_exposed") is True:
        reasons.append("SECRET_EXPOSURE_REPORTED")
    if blocked:
        reasons.append("FOUNDER_CREDENTIAL_ADMINISTRATION_APPROVAL_REQUIRED")

    return {
        "allowed": not reasons,
        "blocked_capabilities": blocked,
        "reasons": reasons,
        "mode": "GOVERNED_SELF_MODE_CREDENTIAL_ADMIN_ONLY",
    }
