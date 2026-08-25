from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CONTRACTS = ROOT / "departments"
REQUIRED = {"schema_version", "id", "name", "enabled", "adapter", "capabilities", "credential_scope"}


def load(department: str) -> dict[str, Any]:
    path = CONTRACTS / f"{department}.json"
    if not path.exists():
        return {"valid": False, "id": department, "reason": "DEPARTMENT_CONTRACT_MISSING"}
    try:
        contract = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"valid": False, "id": department, "reason": "DEPARTMENT_CONTRACT_INVALID_JSON"}
    missing = sorted(REQUIRED - set(contract))
    if missing:
        return {"valid": False, "id": department, "reason": "DEPARTMENT_CONTRACT_FIELDS_MISSING", "missing": missing}
    if contract.get("id") != department:
        return {"valid": False, "id": department, "reason": "DEPARTMENT_CONTRACT_ID_MISMATCH"}
    if contract.get("credential_scope") != "department_only":
        return {"valid": False, "id": department, "reason": "INVALID_CREDENTIAL_SCOPE"}
    contract["valid"] = True
    return contract


def capability_check(department: str | None, requested: list[str] | None) -> dict[str, Any]:
    if not department:
        return {"allowed": False, "reason": "NO_DEPARTMENT_ROUTE", "missing": requested or []}
    contract = load(department)
    if not contract.get("valid"):
        return {"allowed": False, "reason": contract.get("reason"), "contract": contract}
    if contract.get("enabled") is not True:
        return {"allowed": False, "reason": "DEPARTMENT_DISABLED", "contract": contract}
    requested_set = set(requested or ["plan"])
    declared = set(contract.get("capabilities", []))
    missing = sorted(requested_set - declared)
    return {
        "allowed": not missing,
        "reason": None if not missing else "CAPABILITY_NOT_ONBOARDED",
        "requested": sorted(requested_set),
        "declared": sorted(declared),
        "missing": missing,
        "contract": contract,
    }
