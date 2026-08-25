from __future__ import annotations

EVIDENCE_LEVELS = (
    "OBSERVED",
    "PROCESSED",
    "EXECUTING",
    "API_CONFIRMED",
    "LIVE_VERIFIED",
    "BUSINESS_OUTCOME_VERIFIED",
)


def valid_level(level: str) -> bool:
    return level in EVIDENCE_LEVELS


def rank(level: str) -> int:
    return EVIDENCE_LEVELS.index(level) if valid_level(level) else -1
