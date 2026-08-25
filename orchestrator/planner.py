from __future__ import annotations

from typing import Any


def decompose(objective: str) -> list[dict[str, Any]]:
    """Deterministic safe decomposition; AI planning can be added behind policy later."""
    text = objective.strip()
    parts = [p.strip() for p in text.replace(";", "\n").splitlines() if p.strip()]
    if len(parts) <= 1:
        return [{"sequence": 1, "objective": text, "depends_on": []}]
    return [
        {"sequence": i, "objective": part, "depends_on": [i - 1] if i > 1 else []}
        for i, part in enumerate(parts, 1)
    ]
