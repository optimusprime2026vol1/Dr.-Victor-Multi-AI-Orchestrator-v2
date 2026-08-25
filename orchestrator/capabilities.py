from __future__ import annotations

from typing import Any

# Conservative bootstrap registry. Empty capability sets mean the department is
# known organizationally but no executable capability has been onboarded yet.
CAPABILITIES: dict[str, set[str]] = {
    "aura2": {"plan", "analyze", "draft"},
    "vision": {"plan", "analyze", "draft"},
    "rio": {"plan", "analyze"},
    "oracle": {"plan", "analyze"},
    "bubblebee": set(),
    "pa_victor": {"plan", "analyze", "draft"},
    "hulk": set(),
    "batman_bruce": set(),
}


def check(department: str | None, requested: list[str]) -> dict[str, Any]:
    if not department or department not in CAPABILITIES:
        return {"allowed": False, "missing": requested, "reason": "DEPARTMENT_CAPABILITIES_UNKNOWN"}
    declared = CAPABILITIES[department]
    requested_set = set(requested or ["plan"])
    missing = sorted(requested_set - declared)
    return {
        "allowed": not missing,
        "declared": sorted(declared),
        "requested": sorted(requested_set),
        "missing": missing,
        "reason": None if not missing else "CAPABILITY_NOT_ONBOARDED",
    }
