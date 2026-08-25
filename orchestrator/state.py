from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SYSTEM_STATE = ROOT / "data" / "system_state.json"


class StateError(RuntimeError):
    pass


def load_system_state() -> dict[str, Any]:
    if not SYSTEM_STATE.exists():
        raise StateError("canonical system state missing")
    try:
        state = json.loads(SYSTEM_STATE.read_text(encoding="utf-8"))
    except Exception as exc:
        raise StateError(f"canonical system state invalid: {type(exc).__name__}") from exc
    if state.get("canonical") is not True:
        raise StateError("system state is not declared canonical")
    return state


def department_ids(state: dict[str, Any]) -> set[str]:
    departments = state.get("departments", {})
    return set(departments) if isinstance(departments, dict) else set()
