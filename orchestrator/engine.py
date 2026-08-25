from __future__ import annotations

from typing import Any

from .policy import evaluate
from .router import route
from .state import load_system_state
from .tasks import new_task, transition


class OrchestrationEngine:
    """Phase-1 Victor control loop.

    This engine plans and authorizes routing only. It deliberately has no
    external-action executor. Destructive, publishing, messaging, spending and
    department-secret capabilities fail closed until explicit authorization and
    department adapters are implemented.
    """

    def plan(
        self,
        objective: str,
        requested_department: str | None = None,
        capabilities: list[str] | None = None,
    ) -> dict[str, Any]:
        if not objective or not objective.strip():
            raise ValueError("objective required")

        state = load_system_state()
        routing = route(objective, state, requested_department)
        task = new_task(objective.strip(), routing.get("department"), capabilities)
        transition(task, "PLANNED", "PROCESSED")

        if not routing.get("department"):
            transition(task, "BLOCKED", "PROCESSED")
            return {"task": task, "route": routing, "policy": {"allowed": False, "reasons": ["NO_SAFE_DEPARTMENT_ROUTE"]}}

        policy = evaluate(task, state)
        if not policy["allowed"]:
            transition(task, "BLOCKED", "PROCESSED")
            return {"task": task, "route": routing, "policy": policy}

        transition(task, "ASSIGNED", "PROCESSED")
        return {"task": task, "route": routing, "policy": policy}

    def execute(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        """Fail closed until department executors are explicitly onboarded."""
        plan = self.plan(*args, **kwargs)
        task = plan["task"]
        if task["status"] == "BLOCKED":
            return plan
        transition(task, "BLOCKED", "PROCESSED")
        plan["execution"] = {
            "executed": False,
            "reason": "DEPARTMENT_EXECUTOR_NOT_ONBOARDED",
            "safety": "NO_EXTERNAL_SIDE_EFFECT",
        }
        return plan
