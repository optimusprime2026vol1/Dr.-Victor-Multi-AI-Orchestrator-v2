# Victor Revenue Evidence Standard

Authority: Founder Vicky Gautam  
Canonical ledger: `data/revenue_outcomes.json`

## Final business outcome

The auditable funnel is:

`LEAD_CAPTURED → CONTACT_VERIFIED → OPPORTUNITY_QUALIFIED → CLOSED_WON → PAYMENT_RECEIVED`

A post, click, traffic figure, ready offer, estimate, proposal, verbal promise, invoice, self-report, or system-green status is not collected revenue.

## Evidence contract

Every event requires a stable event ID, privacy-safe lead ID, department ID, UTC timestamp, independent verifier, stage, and evidence references. Evidence references point to department-owned records; they must not contain credentials or unnecessary customer personal data.

Required evidence accumulates through the funnel:

- Lead: `LEAD_CAPTURE`
- Contact: lead + `CONTACT`
- Qualified: contact + `QUALIFICATION`
- Closed: qualified + `CLOSE`
- Paid: closed + `PAYMENT`

Only a valid `PAYMENT_RECEIVED` event may have a positive `amount_inr`. Only that amount contributes to `collected_revenue_inr`.

## Verification and reporting

The producing department cannot verify its own event. Victor validates the record and evidence chain; independent evidence must come from the applicable external or Founder-controlled business record. Invalid or incomplete events score no revenue and cannot support a department 10/10 outcome.

`python scripts/validate_revenue_outcomes.py` recomputes totals from events and fails if a declared total is unsupported. Until a valid event exists, the honest canonical status remains `NO_VERIFIED_REVENUE_EVENT` and collected revenue remains ₹0.
