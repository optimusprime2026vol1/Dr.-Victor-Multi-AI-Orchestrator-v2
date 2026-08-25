from __future__ import annotations

from pathlib import Path
from typing import Any

from .contracts import capability_check, load

ROOT = Path(__file__).resolve().parents[1]
CONTRACTS = ROOT / "departments"


def candidates(failed_department: str | None, capabilities: list[str], state: dict[str, Any]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for path in sorted(CONTRACTS.glob("*.json")):
        department = path.stem
        if department in {failed_department, "tony_stark"}:
            continue
        check = capability_check(department, capabilities)
        if not check.get("allowed"):
            continue
        dept_state = state.get("departments", {}).get(department, {})
        health = dept_state.get("health") or dept_state.get("runtime_status", {}).get("overall") or "UNKNOWN"
        if str(health).upper() in {"DEGRADED", "UNAVAILABLE", "MAINTENANCE", "DISABLED"}:
            continue
        contract = load(department)
        results.append({"department": department, "health": health, "adapter": contract.get("adapter"), "capabilities": contract.get("capabilities", [])})
    return results


def resolve(failed_department: str | None, capabilities: list[str], state: dict[str, Any]) -> dict[str, Any]:
    options = candidates(failed_department, capabilities, state)
    if not options:
        return {"found": False, "reason": "NO_SAFE_FALLBACK", "candidates": []}
    # Deterministic first-safe selection until quality/cost/success metrics are available.
    return {"found": True, "selected": options[0], "candidates": options}
