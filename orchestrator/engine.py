from __future__ import annotations

from typing import Any

from .capabilities import check as check_capabilities
from .executor import execute as execute_department
from .ledger import record_task
from .outcomes import evaluate as evaluate_outcome
from .planner import decompose
from .policy import evaluate
from .router import route
from .state import load_system_state
from .tasks import new_task, transition
from .verifier import verify


class OrchestrationEngine:
    """Victor control loop: state -> plan -> route -> policy -> execute -> verify."""

    def plan(self, objective: str, requested_department: str | None = None, capabilities: list[str] | None = None) -> dict[str, Any]:
        if not objective or not objective.strip():
            raise ValueError("objective required")
        state = load_system_state()
        decomposition = decompose(objective)
        routing = route(objective, state, requested_department)
        task = new_task(objective.strip(), routing.get("department"), capabilities or ["plan"])
        task["decomposition"] = decomposition
        record_task(task, "CREATED")
        transition(task, "PLANNED", "PROCESSED")
        record_task(task, "PLANNED", {"decomposition": decomposition})

        if not routing.get("department"):
            transition(task, "BLOCKED", "PROCESSED")
            record_task(task, "BLOCKED", {"reason": "NO_SAFE_DEPARTMENT_ROUTE"})
            return {"task": task, "route": routing, "policy": {"allowed": False, "reasons": ["NO_SAFE_DEPARTMENT_ROUTE"]}}

        capability = check_capabilities(task["department"], task["capabilities"])
        if not capability["allowed"]:
            transition(task, "BLOCKED", "PROCESSED")
            record_task(task, "BLOCKED", {"capability": capability})
            return {"task": task, "route": routing, "capability": capability, "policy": {"allowed": False, "reasons": [capability["reason"]]}}

        policy = evaluate(task, state)
        if not policy["allowed"]:
            transition(task, "BLOCKED", "PROCESSED")
            record_task(task, "BLOCKED", {"policy": policy})
            return {"task": task, "route": routing, "capability": capability, "policy": policy}

        transition(task, "ASSIGNED", "PROCESSED")
        record_task(task, "ASSIGNED")
        return {"task": task, "route": routing, "capability": capability, "policy": policy}

    def execute(self, *args: Any, max_retries: int = 1, **kwargs: Any) -> dict[str, Any]:
        plan = self.plan(*args, **kwargs)
        task = plan["task"]
        if task["status"] == "BLOCKED":
            plan["escalation"] = {"required": True, "reason": "PLANNING_OR_POLICY_BLOCK"}
            return plan

        execution = None
        for attempt in range(max_retries + 1):
            transition(task, "EXECUTING", "EXECUTING")
            record_task(task, "EXECUTING", {"attempt": attempt + 1})
            execution = execute_department(task)
            if execution.get("ok") or not execution.get("retryable"):
                break
            transition(task, "RETRYING", execution.get("evidence_level", "EXECUTING"))
            record_task(task, "RETRYING", {"attempt": attempt + 1, "reason": execution.get("reason")})

        assert execution is not None
        verification = verify(execution)
        if not verification["verified"]:
            transition(task, "FAILED", verification.get("level", "EXECUTING"))
            record_task(task, "FAILED", {"verification": verification})
            plan.update({"execution": execution, "verification": verification, "escalation": {"required": True, "reason": verification.get("reason")}})
            return plan

        transition(task, "VERIFYING", verification["level"])
        record_task(task, "VERIFIED", {"verification": verification})
        outcome = evaluate_outcome(task, verification)
        if outcome["complete"]:
            transition(task, "COMPLETE", verification["level"])
            record_task(task, "COMPLETE", {"outcome": outcome})
        else:
            transition(task, "FOLLOW_UP_REQUIRED", verification["level"])
            record_task(task, "FOLLOW_UP_REQUIRED", {"outcome": outcome})

        plan.update({
            "execution": execution,
            "verification": verification,
            "outcome": outcome,
            "escalation": {"required": False},
        })
        return plan
