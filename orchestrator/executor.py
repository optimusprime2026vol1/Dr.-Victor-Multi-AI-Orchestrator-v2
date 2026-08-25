from __future__ import annotations

from typing import Any

from .adapters.registry import get as get_adapter
from .contracts import capability_check


def execute(task: dict[str, Any]) -> dict[str, Any]:
    department = task.get("department")
    check = capability_check(department, task.get("capabilities"))
    if not check.get("allowed"):
        return {
            "ok": False,
            "retryable": False,
            "reason": check.get("reason", "DEPARTMENT_CONTRACT_REJECTED"),
            "contract_check": check,
            "evidence_level": "PROCESSED",
        }

    contract = check["contract"]
    adapter_name = contract.get("adapter")
    adapter = get_adapter(adapter_name)
    if adapter is None:
        return {
            "ok": False,
            "retryable": False,
            "reason": "DEPARTMENT_ADAPTER_NOT_REGISTERED",
            "adapter": adapter_name,
            "evidence_level": "PROCESSED",
        }

    result = adapter(task, contract)
    result["contract_id"] = contract.get("id")
    result["contract_schema_version"] = contract.get("schema_version")
    return result
