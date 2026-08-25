from __future__ import annotations

from typing import Any

# Only side-effect-free local capabilities are executable at this stage.
LOCAL_SAFE = {"plan", "analyze", "draft"}


def execute(task: dict[str, Any]) -> dict[str, Any]:
    requested = set(task.get("capabilities") or ["plan"])
    if not requested.issubset(LOCAL_SAFE):
        return {"ok": False, "retryable": False, "reason": "EXTERNAL_EXECUTOR_NOT_ONBOARDED", "evidence_level": "PROCESSED"}
    # The control plane does not fabricate department output. It confirms only
    # that a safe work package is ready for a department adapter.
    return {
        "ok": True,
        "retryable": False,
        "result": {
            "kind": "SAFE_WORK_PACKAGE",
            "department": task.get("department"),
            "objective": task.get("objective"),
            "capabilities": sorted(requested),
            "external_side_effect": False,
        },
        "evidence_level": "EXECUTING",
    }
