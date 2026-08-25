from __future__ import annotations

from typing import Any

from .contracts import capability_check


def check(department: str | None, requested: list[str]) -> dict[str, Any]:
    """Compatibility wrapper; canonical capabilities now live in department contracts."""
    return capability_check(department, requested)
