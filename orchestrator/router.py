from __future__ import annotations

from typing import Any

KEYWORDS = {
    "vision": {"vision", "youtube", "video", "episode", "stills", "image", "shot"},
    "aura2": {"aura", "aura2", "instagram", "interior", "design", "post", "lead"},
    "rio": {"rio", "ui", "interface"},
    "oracle": {"oracle", "research", "analysis", "forecast"},
    "bubblebee": {"bubblebee"},
    "pa_victor": {"pa victor", "assistant", "schedule", "admin"},
    "hulk": {"hulk"},
    "batman_bruce": {"batman", "bruce"},
}


def route(objective: str, state: dict[str, Any], requested_department: str | None = None) -> dict[str, Any]:
    departments = state.get("departments", {}) if isinstance(state.get("departments"), dict) else {}
    if requested_department:
        if requested_department in departments:
            return {"department": requested_department, "confidence": 1.0, "reason": "explicit_department"}
        return {"department": None, "confidence": 0.0, "reason": "requested_department_unknown"}

    text = objective.lower()
    scores: list[tuple[int, str]] = []
    for department, words in KEYWORDS.items():
        if department not in departments:
            continue
        score = sum(1 for word in words if word in text)
        if score:
            scores.append((score, department))
    if not scores:
        return {"department": None, "confidence": 0.0, "reason": "no_safe_route"}
    scores.sort(reverse=True)
    top_score, department = scores[0]
    tied = [d for score, d in scores if score == top_score]
    if len(tied) > 1:
        return {"department": None, "confidence": 0.0, "reason": "ambiguous_route", "candidates": tied}
    return {"department": department, "confidence": min(1.0, 0.5 + top_score * 0.15), "reason": "keyword_route"}
