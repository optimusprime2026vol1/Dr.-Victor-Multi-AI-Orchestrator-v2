#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from orchestrator.revenue import summarize


LEDGER = ROOT / "data" / "revenue_outcomes.json"


def main() -> int:
    record = json.loads(LEDGER.read_text(encoding="utf-8"))
    if record.get("schema_version") != 1 or record.get("canonical") is not True:
        print(json.dumps({"status": "FAILED", "reason": "INVALID_LEDGER_CONTRACT"}, indent=2))
        return 1
    result = summarize(record.get("events", []))
    declared = record.get("verified_totals", {})
    expected = {
        "qualified_leads": result["qualified_leads"],
        "closed_won": result["closed_won"],
        "payments_received": result["payments_received"],
        "collected_revenue_inr": result["collected_revenue_inr"],
    }
    if result["invalid_event_count"] or declared != expected:
        print(json.dumps({"status": "FAILED", "computed": result, "declared": declared}, indent=2))
        return 1
    print(json.dumps({"status": "VERIFIED", "computed": result}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
