from __future__ import annotations

from typing import Any


def evaluate(task: dict[str, Any], verification: dict[str, Any]) -> dict[str, Any]:
    if not verification.get("verified"):
        return {"complete": False, "follow_up_required": True, "reason": verification.get("reason")}
    level = verification.get("level")
    return {
        "complete": level in {"LIVE_VERIFIED", "BUSINESS_OUTCOME_VERIFIED"},
        "follow_up_required": level not in {"LIVE_VERIFIED", "BUSINESS_OUTCOME_VERIFIED"},
        "reason": "BUSINESS_OR_LIVE_VERIFICATION_PENDING" if level not in {"LIVE_VERIFIED", "BUSINESS_OUTCOME_VERIFIED"} else None,
    }
