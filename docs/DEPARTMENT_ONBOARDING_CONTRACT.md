# Victor Department Onboarding Contract

Every department connected to Dr. Victor must remain an independent operational unit while exposing enough non-secret management evidence for executive oversight.

## Required management inputs
For each department Victor needs:
1. Repository identity.
2. Canonical objective / mandate path.
3. Soul / governance path when present.
4. Current work-state/report path when present.
5. Heartbeat or workflow evidence location when present.
6. Business KPIs/evidence location when present.
7. Department Telegram identity when connected.
8. Credential names required by the department — presence/status only where authorized, never secret values in the common room.
9. Runtime/provider manifest or equivalent provider-routing source when AI execution is expected.
10. Bootstrap/runtime health evidence showing the selected provider actually passed a safe health test before the department is called AI-ready.

## Oversight contract
Victor may inspect authorized repositories and compare execution against canonical objectives. Victor may request a corrective plan, evidence, or updated report. Victor must not silently rewrite a department objective, merge department credentials into Victor, or claim an external outcome from a processing-status message alone.

## SOUL plug-and-play runtime requirement — Founder locked 25 Aug 2026
Departments should follow `docs/SOUL_BOOTSTRAP_STANDARD.md`.

Once the standard bootstrap implementation is installed in a department repository, a valid Soul plus an authorized supported repository-scoped API credential should allow the department to discover, health-test and bind an AI provider automatically without exposing the secret value.

Rules:
- SOUL is governance/identity, not a secret store.
- Provider credentials stay in the department's own repository/runtime scope.
- Existing Founder-locked provider/model hierarchy takes precedence over generic bootstrap order.
- A detected secret is not proof that the provider works; a minimal provider health test is required.
- Automatic runtime binding grants technical readiness only and does not expand business authority or bypass approvals.
- If no supported credential is available, report `WAITING_CREDENTIAL` rather than pretending the department is AI-ready.
- If bootstrap code/adapters are absent, report `BOOTSTRAP_COMPONENT_MISSING`; documentation alone is not runtime execution.

## Report envelope
Departments should be able to report:
- department
- canonical objective reference
- current priority
- state
- selected AI provider/model where applicable
- provider/runtime health evidence without secret values
- evidence
- blocker
- Founder decision required
- next action
- timestamp

## Common Telegram rule
Telegram is the shared management communication layer. It does not merge runtimes, credentials, or objectives. Founder remains final authority; Victor leads management coordination.

## Onboarding states
Preferred state chain:

`DISCOVERED -> OBJECTIVE_VERIFIED -> SOUL_VERIFIED -> RUNTIME_BOOTSTRAPPED -> PROVIDER_HEALTH_VERIFIED -> REPORTING_CONNECTED -> TELEGRAM_CONNECTED -> MANAGED`

A department is not fully AI-ready until Victor can identify its canonical objective/Soul and verify that its selected provider/runtime actually passed the relevant health test. A department is not `MANAGED` until Victor can also receive auditable status evidence. Runtime-blocked departments may still be managed diagnostically, but their blocker must be explicit.
