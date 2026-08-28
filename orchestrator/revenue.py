from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any


FUNNEL_STAGES = (
    "LEAD_CAPTURED",
    "CONTACT_VERIFIED",
    "OPPORTUNITY_QUALIFIED",
    "CLOSED_WON",
    "PAYMENT_RECEIVED",
)

REQUIRED_EVIDENCE = {
    "LEAD_CAPTURED": {"LEAD_CAPTURE"},
    "CONTACT_VERIFIED": {"LEAD_CAPTURE", "CONTACT"},
    "OPPORTUNITY_QUALIFIED": {"LEAD_CAPTURE", "CONTACT", "QUALIFICATION"},
    "CLOSED_WON": {"LEAD_CAPTURE", "CONTACT", "QUALIFICATION", "CLOSE"},
    "PAYMENT_RECEIVED": {"LEAD_CAPTURE", "CONTACT", "QUALIFICATION", "CLOSE", "PAYMENT"},
}


def _amount(value: Any) -> Decimal | None:
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None
    return amount if amount >= 0 else None


def validate_event(event: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    for field in ("event_id", "lead_id", "department_id", "occurred_at", "stage", "verified_by"):
        if not str(event.get(field, "")).strip():
            errors.append(f"MISSING_{field.upper()}")

    stage = str(event.get("stage", "")).upper()
    if stage not in FUNNEL_STAGES:
        errors.append("INVALID_FUNNEL_STAGE")

    evidence = event.get("evidence")
    if not isinstance(evidence, list) or not evidence:
        errors.append("EVIDENCE_REQUIRED")
        evidence = []
    evidence_types = {
        str(item.get("type", "")).upper()
        for item in evidence
        if isinstance(item, dict) and str(item.get("ref", "")).strip()
    }
    if stage in REQUIRED_EVIDENCE:
        missing = REQUIRED_EVIDENCE[stage] - evidence_types
        errors.extend(f"MISSING_{kind}_EVIDENCE" for kind in sorted(missing))

    if event.get("verified") is not True:
        errors.append("NOT_INDEPENDENTLY_VERIFIED")
    if str(event.get("verified_by", "")).strip().lower() == str(event.get("department_id", "")).strip().lower():
        errors.append("SELF_VERIFICATION_NOT_ALLOWED")

    amount = _amount(event.get("amount_inr", 0))
    if amount is None:
        errors.append("INVALID_AMOUNT_INR")
        amount = Decimal(0)
    if stage != "PAYMENT_RECEIVED" and amount != 0:
        errors.append("REVENUE_REQUIRES_PAYMENT_RECEIVED_STAGE")
    if stage == "PAYMENT_RECEIVED" and amount <= 0:
        errors.append("PAYMENT_AMOUNT_MUST_BE_POSITIVE")

    return {"valid": not errors, "errors": errors, "stage": stage, "amount_inr": float(amount)}


def summarize(events: list[dict[str, Any]]) -> dict[str, Any]:
    valid: list[tuple[dict[str, Any], dict[str, Any]]] = []
    invalid: list[dict[str, Any]] = []
    seen: set[str] = set()
    for event in events:
        result = validate_event(event)
        event_id = str(event.get("event_id", ""))
        if event_id in seen:
            result["valid"] = False
            result["errors"].append("DUPLICATE_EVENT_ID")
        seen.add(event_id)
        if result["valid"]:
            valid.append((event, result))
        else:
            invalid.append({"event_id": event_id or None, "errors": result["errors"]})

    qualified_leads = {
        str(event["lead_id"])
        for event, result in valid
        if FUNNEL_STAGES.index(result["stage"]) >= FUNNEL_STAGES.index("OPPORTUNITY_QUALIFIED")
    }
    closed_won = {
        str(event["lead_id"])
        for event, result in valid
        if FUNNEL_STAGES.index(result["stage"]) >= FUNNEL_STAGES.index("CLOSED_WON")
    }
    paid = [(event, result) for event, result in valid if result["stage"] == "PAYMENT_RECEIVED"]
    collected = sum((Decimal(str(result["amount_inr"])) for _, result in paid), Decimal(0))
    return {
        "verified_event_count": len(valid),
        "invalid_event_count": len(invalid),
        "qualified_leads": len(qualified_leads),
        "closed_won": len(closed_won),
        "payments_received": len(paid),
        "collected_revenue_inr": float(collected),
        "invalid_events": invalid,
    }
