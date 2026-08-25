from __future__ import annotations

from typing import Any

from .evidence import rank, valid_level


def verify(execution: dict[str, Any], minimum_level: str = "EXECUTING") -> dict[str, Any]:
    level = execution.get("evidence_level", "OBSERVED")
    if not execution.get("ok"):
        return {"verified": False, "level": level, "reason": execution.get("reason", "EXECUTION_FAILED")}
    if not valid_level(level) or rank(level) < rank(minimum_level):
        return {"verified": False, "level": level, "reason": "INSUFFICIENT_EVIDENCE"}
    result = execution.get("result")
    if not isinstance(result, dict):
        return {"verified": False, "level": level, "reason": "RESULT_MISSING"}
    return {"verified": True, "level": level, "reason": None}
