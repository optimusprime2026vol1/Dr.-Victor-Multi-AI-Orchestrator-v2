from __future__ import annotations

from typing import Any

from .capabilities import check as check_capabilities
from .executor import execute as execute_department
from .fallback import resolve as resolve_fallback
from .incidents import open_incident, transition as incident_transition
from .ledger import record_task
from .outcomes import evaluate as evaluate_outcome
from .planner import decompose
from .policy import evaluate
from .problem_management import evaluate as evaluate_problem
from .recovery import assign_tony
from .router import route
from .state import load_system_state
from .tasks import new_task, transition
from .verifier import verify


class OrchestrationEngine:
    """Victor control loop with independent business-continuity and recovery paths."""

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

    def _failure_paths(self, plan: dict[str, Any], execution: dict[str, Any], verification: dict[str, Any]) -> dict[str, Any]:
        task = plan["task"]
        state = load_system_state()
        fallback = resolve_fallback(task.get("department"), task.get("capabilities", []), state)
        incident = open_incident(task, execution, fallback_available=fallback.get("found", False))
        problem = evaluate_problem(incident)
        recovery = assign_tony(incident)
        continuity: dict[str, Any] = {"fallback": fallback, "status": "BLOCKED_NO_FALLBACK"}

        if fallback.get("found"):
            selected = fallback["selected"]["department"]
            original_department = task.get("department")
            task.setdefault("execution_history", []).append({"department": original_department, "result": "FAILED", "execution": execution})
            task["department"] = selected
            record_task(task, "FALLBACK_ASSIGNED", {"from": original_department, "to": selected, "incident_id": incident["incident_id"]})
            fallback_policy = evaluate(task, state)
            if fallback_policy.get("allowed"):
                fallback_execution = execute_department(task)
                fallback_verification = verify(fallback_execution)
                continuity.update({"policy": fallback_policy, "execution": fallback_execution, "verification": fallback_verification})
                if fallback_verification.get("verified"):
                    continuity["status"] = "BUSINESS_CONTINUITY_RESTORED"
                    task.setdefault("execution_history", []).append({"department": selected, "result": "VERIFIED", "execution": fallback_execution})
                    record_task(task, "FALLBACK_VERIFIED", {"department": selected, "incident_id": incident["incident_id"]})
                    incident["business_task_status"] = "CONTINUITY_RESTORED"
                    incident_transition(incident, incident["status"], {"business_continuity": "RESTORED", "fallback_department": selected})
                else:
                    continuity["status"] = "FALLBACK_FAILED"
                    record_task(task, "FALLBACK_FAILED", {"department": selected, "incident_id": incident["incident_id"]})
            else:
                continuity.update({"status": "FALLBACK_POLICY_BLOCKED", "policy": fallback_policy})

        transition(task, "FAILED", verification.get("level", "EXECUTING"))
        record_task(task, "FAILED", {"verification": verification, "incident_id": incident["incident_id"], "continuity": continuity.get("status")})
        plan.update({
            "execution": execution,
            "verification": verification,
            "incident": incident,
            "problem_management": problem,
            "business_continuity": continuity,
            "recovery": recovery,
            "escalation": {"required": recovery.get("status") in {"VICTOR_ESCALATED", "FOUNDER_ESCALATED"}, "reason": recovery.get("status")},
        })
        return plan

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
            return self._failure_paths(plan, execution, verification)
        transition(task, "VERIFYING", verification["level"])
        record_task(task, "VERIFIED", {"verification": verification})
        outcome = evaluate_outcome(task, verification)
        if outcome["complete"]:
            transition(task, "COMPLETE", verification["level"])
            record_task(task, "COMPLETE", {"outcome": outcome})
        else:
            transition(task, "FOLLOW_UP_REQUIRED", verification["level"])
            record_task(task, "FOLLOW_UP_REQUIRED", {"outcome": outcome})
        plan.update({"execution": execution, "verification": verification, "outcome": outcome, "escalation": {"required": False}})
        return plan
