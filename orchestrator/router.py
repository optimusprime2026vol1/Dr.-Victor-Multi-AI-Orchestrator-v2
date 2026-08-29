from __future__ import annotations

from typing import Any

# Founder-locked alias rule: bare "aura" always means AURA3. Only an explicit
# "aura2" / "aura 2" selects AURA2.
KEYWORDS = {
    "aura3": {
        "aura",
        "aura3",
        "instagram",
        "interior",
        "interiors",
        "design",
        "lead",
        "leads",
        "post",
        "caption",
        "publish",
        "kitchen",
        "wardrobe",
        "ceiling",
    },
    "aura2": {"aura2"},
    "rio": {
        "rio",
        "affiliate",
        "amazon",
        "commission",
        "offer",
        "offers",
        "product",
        "buying guide",
        "associates",
    },
    "hulk": {
        "hulk",
        "research",
        "opportunity",
        "opportunities",
        "blueprint",
        "market",
        "feasibility",
        "assessment",
    },
    "tony_stark": {
        "tony",
        "stark",
        "engineering",
        "diagnostic",
        "repair",
        "reliability",
        "audit",
        "incident",
    },
    "vision": {"vision", "youtube", "video", "episode", "stills", "shot", "reel"},
    "oracle": {"oracle", "trading", "forecast"},
    "bubblebee": {"bubblebee", "kids"},
    "pa_victor": {"pa victor", "assistant", "schedule", "admin"},
    "batman_bruce": {"batman", "bruce"},
}

# Multi-word phrases must be matched before single tokens so that
# "aura 2" resolves to AURA2 rather than falling through to AURA3.
EXPLICIT_PHRASES = {
    "aura 2": "aura2",
    "aura2": "aura2",
    "aura 3": "aura3",
    "aura3": "aura3",
}


def route(
    objective: str,
    state: dict[str, Any],
    requested_department: str | None = None,
) -> dict[str, Any]:
    departments = (
        state.get("departments", {}) if isinstance(state.get("departments"), dict) else {}
    )
    if requested_department:
        if requested_department in departments:
            return {
                "department": requested_department,
                "confidence": 1.0,
                "reason": "explicit_department",
            }
        return {
            "department": None,
            "confidence": 0.0,
            "reason": "requested_department_unknown",
        }

    text = objective.lower()

    for phrase, department in EXPLICIT_PHRASES.items():
        if phrase in text and department in departments:
            return {
                "department": department,
                "confidence": 1.0,
                "reason": "founder_alias_rule",
            }

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
        return {
            "department": None,
            "confidence": 0.0,
            "reason": "ambiguous_route",
            "candidates": tied,
        }
    return {
        "department": department,
        "confidence": min(1.0, 0.5 + top_score * 0.15),
        "reason": "keyword_route",
    }
