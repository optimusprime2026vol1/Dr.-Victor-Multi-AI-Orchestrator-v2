from __future__ import annotations

from typing import Any, Callable

from .safe_work_package import execute as safe_work_package

Adapter = Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]]
ADAPTERS: dict[str, Adapter] = {"safe_work_package": safe_work_package}


def get(name: str) -> Adapter | None:
    return ADAPTERS.get(name)
