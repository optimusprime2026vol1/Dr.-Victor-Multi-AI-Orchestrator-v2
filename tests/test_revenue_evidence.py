import json
import unittest
from pathlib import Path

from orchestrator.revenue import summarize, validate_event


ROOT = Path(__file__).resolve().parents[1]


def paid_event(**overrides):
    event = {
        "event_id": "rev-1",
        "lead_id": "lead-hash-1",
        "department_id": "rio",
        "occurred_at": "2026-08-28T13:00:00Z",
        "stage": "PAYMENT_RECEIVED",
        "amount_inr": 2500,
        "verified": True,
        "verified_by": "victor",
        "evidence": [
            {"type": "LEAD_CAPTURE", "ref": "repo://lead"},
            {"type": "CONTACT", "ref": "repo://contact"},
            {"type": "QUALIFICATION", "ref": "repo://qualified"},
            {"type": "CLOSE", "ref": "repo://close"},
            {"type": "PAYMENT", "ref": "repo://payment"},
        ],
    }
    event.update(overrides)
    return event


class RevenueEvidenceTests(unittest.TestCase):
    def test_empty_canonical_ledger_is_honest_and_valid(self):
        ledger = json.loads((ROOT / "data/revenue_outcomes.json").read_text(encoding="utf-8"))
        self.assertEqual(ledger["status"], "NO_VERIFIED_REVENUE_EVENT")
        self.assertEqual(summarize(ledger["events"])["collected_revenue_inr"], 0)
        self.assertEqual(ledger["verified_totals"]["collected_revenue_inr"], 0)

    def test_complete_payment_event_counts_collected_revenue(self):
        result = summarize([paid_event()])
        self.assertEqual(result["payments_received"], 1)
        self.assertEqual(result["qualified_leads"], 1)
        self.assertEqual(result["collected_revenue_inr"], 2500)

    def test_non_payment_stage_cannot_claim_revenue(self):
        result = validate_event(paid_event(stage="CLOSED_WON"))
        self.assertFalse(result["valid"])
        self.assertIn("REVENUE_REQUIRES_PAYMENT_RECEIVED_STAGE", result["errors"])

    def test_payment_without_complete_funnel_evidence_is_rejected(self):
        result = validate_event(paid_event(evidence=[{"type": "PAYMENT", "ref": "repo://payment"}]))
        self.assertFalse(result["valid"])
        self.assertIn("MISSING_LEAD_CAPTURE_EVIDENCE", result["errors"])

    def test_department_self_verification_is_rejected(self):
        result = validate_event(paid_event(verified_by="rio"))
        self.assertFalse(result["valid"])
        self.assertIn("SELF_VERIFICATION_NOT_ALLOWED", result["errors"])

    def test_duplicate_event_ids_do_not_double_count(self):
        result = summarize([paid_event(), paid_event()])
        self.assertEqual(result["payments_received"], 1)
        self.assertEqual(result["invalid_event_count"], 1)


if __name__ == "__main__":
    unittest.main()
