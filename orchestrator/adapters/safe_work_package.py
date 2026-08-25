from __future__ import annotations

from typing import Any


def execute(task: dict[str, Any], contract: dict[str, Any]) -> dict[str, Any]:
    """Side-effect-free adapter used until a real department runtime is verified."""
    return {
        "ok": True,
        "retryable": False,
        "adapter": "safe_work_package",
        "result": {
            "kind": "SAFE_WORK_PACKAGE",
            "department": contract.get("id"),
            "department_name": contract.get("name"),
            "objective": task.get("objective"),
            "capabilities": task.get("capabilities") or ["plan"],
            "external_side_effect": False,
            "credential_access": False,
        },
        "evidence_level": "EXECUTING",
    }
