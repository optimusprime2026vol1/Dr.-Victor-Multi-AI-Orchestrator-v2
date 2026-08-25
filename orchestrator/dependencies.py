from __future__ import annotations

from typing import Any


def build(tasks: list[dict[str, Any]]) -> dict[str, Any]:
    nodes = []
    edges = []
    for task in tasks:
        tid = task.get("task_id") or task.get("sequence")
        nodes.append({"id": tid, "department": task.get("department"), "status": task.get("status")})
        for dep in task.get("depends_on", []):
            edges.append({"from": dep, "to": tid})
    return {"nodes": nodes, "edges": edges}


def ready(task: dict[str, Any], completed: set[Any]) -> bool:
    return all(dep in completed for dep in task.get("depends_on", []))
