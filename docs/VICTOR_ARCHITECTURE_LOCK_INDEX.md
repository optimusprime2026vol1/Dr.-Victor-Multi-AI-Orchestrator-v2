# Victor Architecture Lock Register

Status: ACTIVE — CANONICAL ARCHITECTURE RECORD
Authority: Founder → Victor
Scope: Victor control plane and all system departments

This file is the canonical register of architecture points explicitly designed and locked by the Founder and Victor. Detailed code, contracts, runtime state, policies, and ledgers may live elsewhere, but they must not contradict this record.

If implementation conflicts with this file, the conflict must be surfaced and reconciled through the proper authority chain. It must never be silently normalized.

---

# POINT 1 — Canonical System State — LOCKED

Victor must operate from one reconciled system state rather than multiple competing status files. Runtime evidence takes precedence over stale declarative state when a conflict is provable, and conflicts must be recorded rather than hidden.

Locked behavior: reconcile runtime/control-plane evidence into canonical state; runtime evidence may override stale registry claims while preserving conflict; Victor heartbeat/orchestration reads canonical state; critical invalid state fails closed; canonical state must never fabricate LIVE status.

Primary references: `scripts/reconcile_system_state.py`, `data/system_state.json`, `scripts/victor_heartbeat.py`, `data/department_registry.json`, `data/management_protocol.json`.

---

# POINT 2 — Victor Orchestration Engine — LOCKED

No consequential external or departmental action may flow directly from AI output to side effect.

Founder Objective → Canonical State → Planning / Decomposition → Routing → Capability Selection → Policy / Authority Check → Ledger → Executor → Result / Evidence → Verification → Retry / Failure / Escalation → KPI / Outcome → State / Report.

Hard invariant: AI DECISION → POLICY → AUTHORITY → EXECUTION → EVIDENCE → VERIFICATION. AI output alone is never execution authorization.

Primary references: `orchestrator/engine.py`, `orchestrator/tasks.py`, `orchestrator/planner.py`, `orchestrator/router.py`, `orchestrator/policy.py`, `orchestrator/ledger.py`, `orchestrator/evidence.py`, executor/verifier/outcomes modules.

---

# POINT 3 — Department Contracts & Adapter Framework — LOCKED

Victor interacts with departments through explicit capability/authority contracts rather than assuming repository existence implies executable capability.

Each department contract defines at minimum identity, allowed capabilities, enabled state, minimum evidence, secret scope, authority constraints, and safe execution boundary. Department credentials remain isolated to authorized department/capability scope. Missing, malformed, disabled, unverified, or unauthorized capability fails closed. Safe planning/drafting/analyzing may remain available even when external execution is disabled.

Primary references: `departments/*.json`, `orchestrator/contracts.py`, adapter/capability framework.

---

# POINT 4 — Resilience, Continuity & Tony Stark Recovery — LOCKED

Task continuity and system recovery are related but separate concerns. A failed capability may be bypassed by an authorized fallback to complete a task, but fallback success does not prove the original capability healed.

Continuity: Failure → alternate healthy authorized capability → policy/authority → preserve task identity → fallback → execute → verify → complete or continue fallback/block.

Recovery: Incident → severity → Tony diagnose → RCA → authorized repair → test → live verification → recover original capability → close only after verified recovery.

If Tony is blocked: Tony → Victor structured escalation → controlled retry/repair authorization → Founder where required.

Hard rules: fallback success ≠ original healed; task completion ≠ incident closure; repeated failures escalate to systemic RCA; capability health is separate from department health; Tony cannot auto-provision credentials, paid services, security exceptions, destructive actions, or redefine constitutional authority; Founder remains final authority for sensitive/external/destructive/cost-bearing/constitutional changes.

Repair authority: L0 diagnose/observe; L1 safe local recovery; L2 code/config/workflow repair within Victor scope; L3 external infrastructure/account action requires Founder; L4 sensitive/destructive/cost/security exception requires Founder.

---

# COMMUNICATION STANDARD — Department ↔ Department ↔ Victor ↔ Founder — LOCKED

Departments may collaborate, but Victor owns coordination, authority, state, and accountability. The system is hub-and-spoke under Victor, not uncontrolled all-to-all autonomy.

Recognized messages include TASK_REQUEST, TASK_ACCEPTED, TASK_PROGRESS, TASK_RESULT, CAPABILITY_REQUEST, INFORMATION_REQUEST, INFORMATION_RESPONSE, HANDOFF_REQUEST, DEPENDENCY_BLOCKED, EVIDENCE_SUBMITTED, INCIDENT_REPORT, HEALTH_UPDATE, ESCALATION.

Direct information exchange may occur when policy allows and remains auditable. Consequential action, authority transfer, external side effect, or scope expansion requires Victor mediation/authorization where applicable. Tony incident/recovery communication is severity-prioritized. Telegram is a Founder/management interface, not internal bus. Event-driven coordination is preferred; heartbeat reconciles missed/stale state. Message identity/dependency tracking/loop prevention must stop recursive delegation.

Core invariant: DEPARTMENTS MAY COLLABORATE, BUT VICTOR OWNS COORDINATION, AUTHORITY, STATE, AND ACCOUNTABILITY.

---

# POINT 5 — Department Activation & Live Qualification Standard — ACTIVE

RIO architectural study is the main reference model used to derive this standard.

---

## 5.1 — Department Identity & Constitutional Binding — LOCKED

A department is a persistent governed autonomous system whose identity, purpose, authority, and continuity survive AI calls, provider changes, task failures, heartbeat cycles, and capability outages.

Department Constitutional Identity = Identity + Locked Objective/Definition + SOUL + Authority Boundary + Persistent State/Memory Contract.

All five are mandatory. Identity defines organizational responsibility, objective provides measurable direction, SOUL is the constitutional kernel and not the AI provider, authority classes are AUTO / VICTOR_AUTHORIZATION / FOUNDER_ONLY / PROHIBITED, and persistent state preserves work/failures/evidence/blockers/next valid task/binding Founder-Victor decisions.

Provider/model/workflow/capability changes must not silently alter constitutional identity.

Hard invariant: NO VALID CONSTITUTIONAL BINDING = NO AUTONOMOUS DEPARTMENTAL EXECUTION. Invalid binding blocks business/external autonomous execution while diagnostics, health reporting, evidence collection, and Founder/Victor communication may remain. Runtime must actually load/validate the binding; file existence alone does not prove compliance.

---

## 5.2 — Runtime Liveness & Adaptive Heartbeat — LOCKED

A department is not LIVE merely because a workflow, process, API, model, or timer exists. Liveness must be continuously re-established through a bounded heartbeat/runtime mechanism.

Core cycle: WAKE → constitutional binding → persistent state → control/kill switch → runtime/provider health → domain validators → capability/dependency health → SOUL/authority revalidation → execution eligibility → execute/recover/diagnostic-only → persist evidence → schedule next wake.

Heartbeat is liveness, not execution permission.

Default heartbeat 60m; minimum 2m; approved ladder only 60 → 30 → 15 → 10 → 5 → 3 → 2 minutes.

Priority score: Founder/Victor priority up to25; objective/business impact up to25; urgency up to15; dependency criticality up to15; incident severity up to15; cost/rate-limit/concurrency penalty subtract up to15. Mapping: 0–20=60m; 21–35=30m; 36–50=15m; 51–65=10m; 66–80=5m; 81–90=3m; 91–100=2m.

AI may provide context, but cadence selection is deterministic/policy-bounded. Runtime overrides: IDLE 60m; PENDING score-based; EXECUTING typically 5–10m; WAITING_DEPENDENCY expected-change based; DEGRADED 5/3m; RECOVERING 3/2m; CRITICAL 2m where safe; PAUSED keeps diagnostic liveness while business actions stay off.

Founder/authorized Victor command uses immediate event wake but still passes constitutional/authority/policy/evidence gates. Heartbeat frequency and business-action frequency are separate. Concurrency guards prevent duplicate execution. Stale evidence is not fresh. Recommended misses: 1 warning, 2 degraded, 3 incident. Founder alerts are transition-driven. Pause keeps diagnostics/heartbeat/state/comms/safe recovery on. Heartbeat may trigger self-healing then Tony→Victor→Founder escalation. Recovery cadence may accelerate and back off with hysteresis.

Hard invariants: DEFAULT=60m; MINIMUM=2m; ONLY APPROVED LADDER; PRIORITY NEVER GRANTS AUTHORITY; DIRECT FOUNDER/AUTHORIZED VICTOR COMMAND=IMMEDIATE EVENT WAKE; NO FRESH VERIFIED LIVENESS=NO ASSUMPTION CAPABILITY LIVE; HEARTBEAT WAKES, VALID CONSTITUTIONAL/AUTHORITY/HEALTH/EVIDENCE STATE AUTHORIZES.

---

## 5.3 — AI & Provider Binding — LOCKED

AI is replaceable reasoning/intelligence, not department identity, SOUL, objective, authority, persistent memory, or truth source. Provider/model changes must not change constitutional behavior.

AI may interpret evidence, reason, rank tasks, recommend capabilities, estimate outcomes/risk, and produce structured plans. AI may not grant itself permission, expand authority, redefine objective/SOUL, bypass validators, fabricate evidence, or convert technical capability into organizational authority.

Decision chain: AI recommendation → deterministic policy → authority → capability contract → executor → validators/evidence → persistent result. Free-form prose is not executor instruction; structured plans must match declared action vocabulary; unsupported/ambiguous actions fail closed/replan. AI claims are not runtime evidence.

Provider chain: PRIMARY → FALLBACK1 → FALLBACK2 → additional qualified fallback → NO-AI/DIAGNOSTIC MODE. Selection checks health, compatibility, credentials, adapter/protocol, policy, structured output, rate/resource, and cost authority.

Stable slots: `AI_PROVIDER_1` ... `AI_PROVIDER_N`; secret refs such as `AI_PROVIDER_1_SECRET`. Provider/vendor/model/protocol/endpoint/adapter/role metadata belongs in non-secret registry; credentials belong only in authorized secret store.

Onboarding: DISCOVERED → CREDENTIAL_PRESENT → CONFIG_PARSED → ADAPTER_RESOLVED → CONNECTIVITY_VERIFIED → MODEL_DISCOVERED/CONFIGURED → CAPABILITY_TESTED → COST/POLICY_CHECKED → QUALIFIED → AVAILABLE. Supported protocols may auto-configure through generic adapter subject to qualification; unsupported protocols require tested/qualified adapter. Tony may support adapter development within authority but may not infer provider from secret values, expose credentials, bypass qualification, approve paid inference, or expand authority.

Automatic switching only among qualified providers while preserving task identity, department identity, objective, SOUL, authority, capability constraints, validator/evidence requirements, and cost policy. Provider/AI/capability/department/task/business health are separate. If no qualified provider is available the department may remain alive in degraded diagnostic mode while autonomous AI planning is blocked. Provider transitions are auditable and flapping detectable. No paid inference without Founder approval.

---

## 5.4 — Capability Contracts, Qualification & Development Promotion — LOCKED

A capability is an explicitly contracted, independently qualified unit of action. Department health and capability health are separate.

Every consequential capability defines where applicable: capability/department IDs, description, input/output schemas, action vocabulary, authority class, credential scope, dependencies, validators, evidence requirements, side-effect/cost class, enabled/qualification state, version, lifecycle class, promotion authority.

Code presence proves implementation only, not operational readiness or LIVE behavior.

Production lifecycle: PROPOSED → DECLARED → IMPLEMENTED → CONFIGURED → TESTED → VERIFIED → LIVE. Runtime states include LIVE / DEGRADED / PAUSED / BLOCKED / FAILED. PAUSED ≠ FAILED; blocked capability ≠ dead department.

Capabilities use risk classes such as READ, ANALYZE, PLAN, DRAFT, WRITE_INTERNAL, EXTERNAL_READ, EXTERNAL_WRITE, PUBLISH, TRANSACT, DELETE, SECURITY_CHANGE. Technical capability never creates authority. Credentials are capability/department-scoped. Cross-department/shared use is prohibited by default absent explicit approved isolation model.

Dependencies are declared; missing dependencies block/degrade capability, not automatically department. LIVE needs capability-appropriate fresh evidence. Routing chooses only enabled, qualified, healthy-enough, authorized, dependency-ready, cost-allowed capability. Unknown/uncontracted capability fails closed/replans. Capability-level kill/pause must be possible.

Self-development: departments may develop new capabilities within delegated scope but cannot self-expand production authority. Development lifecycle: PROPOSED → DESIGN_APPROVED where required → IN_DEVELOPMENT → TESTING → VERIFIED → PROMOTION_REVIEW → PROMOTED_TO_OPERATIONAL. Lifecycle classes: OPERATIONAL / DEVELOPMENT / EXPERIMENTAL. Promotion authority: AUTO_WITH_VALIDATION / VICTOR / FOUNDER by risk/authority. A department may not redefine SOUL/objective/Founder authority/protected constitutional files/paid dependency authority/security policy or weaken validators. New capabilities remain non-production until promotion gate passes.

RIO remains one constitutional department with two operating zones: RIO-1 PRODUCTION contains only qualified/authorized operational capabilities and protected production authority/credentials; RIO-2 DEVELOPMENT contains Phase-2 evolution, experimentation/testing, and Tony support. RIO-2 has no unrestricted production side-effect authority; uses test/staging/mock where practical; production-impacting tests pass controlled gates. RIO-2 failure does not automatically fail RIO-1. One constitutional heart may track separate production/development states. RIO-2→RIO-1 promotion is auditable/versioned and passes tests, validators, integration/live verification where required, Victor certification, and Founder approval where authority/cost/security/external scope requires.

Hard invariants: DEPARTMENT HEALTH ≠ CAPABILITY HEALTH; CODE PRESENCE ≠ LIVE; EVERY CONSEQUENTIAL CAPABILITY REQUIRES CONTRACT/AUTHORITY/DEPENDENCIES/SECRET SCOPE/VALIDATORS/EVIDENCE; UNKNOWN CAPABILITY FAILS CLOSED; CAPABILITY USES ONLY AUTHORIZED CREDENTIALS; LIVE REQUIRES FRESH APPROPRIATE EVIDENCE; SELF-DEVELOPMENT ≠ SELF-EXPANSION; RIO-1=PRODUCTION, RIO-2=DEVELOPMENT under one constitutional RIO; RIO-2/Tony cannot self-grant RIO-1 production authority.

---

## 5.5 — Truth, Validators, Evidence & Victor Verification — LOCKED

The system distinguishes CLAIM, EVIDENCE, VALIDATOR, and VERDICT. AI output, executor output, self-report, config declarations, or absence of errors are not automatically truth.

Truth hierarchy where relevant: constitutional/hard authority gates; Founder-locked decisions; fresh externally verifiable runtime evidence; deterministic validators; reconciled canonical state; trusted source data; AI interpretation.

Recommended verdicts: VERIFIED / FAILED / PARTIAL / UNKNOWN / STALE / CONFLICTED / NOT_APPLICABLE.

Evidence classes: E0 NONE; E1 DECLARATIVE; E2 INTERNAL_EXECUTION; E3 INTEGRATION; E4 EXTERNAL_VERIFIED; E5 BUSINESS_OUTCOME. Required class depends on risk/side-effect/authority/reversibility/completion policy.

Every department defines domain-specific validators such as CONSTITUTIONAL, SCHEMA, POLICY, DOMAIN, INTEGRATION, EXTERNAL, OUTCOME. The actor making a claim is not sole verifier where independent verification is required.

Evidence carries provenance/freshness where applicable: task, department/capability, type/class, source, observed time, validator, runtime/provider context, external reference, TTL. Stale evidence cannot silently support current LIVE/HEALTHY/COMPLETED claims. Conflicts are preserved/reconciled. Absence of failure is not success. Evidence history is auditable.

Executor success ≠ task completion. Completion requires declared evidence, validators, side-effect confirmation where applicable, and completion policy satisfaction. High-risk/external actions require stronger post-action proof. Department/runtime/AI-provider/capability/task/business-outcome states remain separate.

Victor verification is rule-bound: each task/capability has declared completion/verification policy identifying required validators, evidence strength, freshness, authority, dependencies, and external confirmation. Victor returns VERIFIED only when policy is satisfied; otherwise UNKNOWN/PARTIAL/STALE/CONFLICTED/BLOCKED/FAILED as appropriate.

Founder reporting has three levels: Level1 Founder Summary default; Level2 Victor Verification Detail on demand/escalation; Level3 Raw Technical Evidence for debug/audit/on demand. Victor automatically surfaces more detail when Founder decision, money/cost, security/credential issue, consequential external failure/ambiguity, validator conflict, repeated systemic failure, material business miss, or unresolved consequential truth requires awareness.

Hard invariants: AI OUTPUT IS A CLAIM, NOT TRUTH; CLAIM/EVIDENCE/VALIDATOR/VERDICT ARE SEPARATE; DOMAIN-SPECIFIC VALIDATORS REQUIRED; CLAIMANT NOT SOLE VERIFIER WHERE INDEPENDENT VERIFICATION REQUIRED; LIVE/COMPLETED/HEALTHY REQUIRE FRESH APPROPRIATE EVIDENCE; ABSENCE OF FAILURE ≠ SUCCESS; STALE EVIDENCE ≠ CURRENT TRUTH; CONFLICTS RECORDED; EXECUTION SUCCESS ≠ VERIFIED COMPLETION; HIGH-RISK/EXTERNAL ACTIONS REQUIRE STRONGER PROOF; TECHNICAL/CAPABILITY/TASK/BUSINESS TRUTH DOMAINS SEPARATE; VICTOR VERIFIES BY DECLARED POLICY, NOT SUBJECTIVE AI CONFIDENCE; FOUNDER GETS VERIFIED MANAGEMENT MEANING BY DEFAULT.

---

## 5.6 — Guarded Execution & Side-Effect Control — LOCKED

Planning and execution are separate layers. AI/planners may recommend structured actions, but only an authorized deterministic executor may create consequential side effects.

Execution path: Task → AI/planner recommendation → capability contract → policy → authority → dependency/precondition → cost → validated bounded execution plan → executor → side effect → evidence capture → post-action verification → persistent result/receipt.

Authority classes AUTO / VICTOR_AUTHORIZATION / FOUNDER_ONLY / PROHIBITED are enforced at execution time. Side-effect classes may include NO_SIDE_EFFECT, INTERNAL_REVERSIBLE, INTERNAL_STATE_CHANGE, EXTERNAL_READ, EXTERNAL_WRITE, PUBLIC_PUBLISH, FINANCIAL, CREDENTIAL_SECURITY, DESTRUCTIVE. Higher risk/reduced reversibility requires stronger authority/preflight/evidence/rollback or compensation/post-action verification.

Mandatory preconditions where applicable: constitutional binding valid; task authorized; capability eligible; credentials available/in-scope; dependencies healthy; approval valid; cost authority satisfied; inputs/target valid; evidence/preconditions fresh; kill/pause clear; concurrency lock clear; action exists in declared executor vocabulary. Mandatory failure → EXECUTION_BLOCKED; never “try anyway.”

Executors accept only declared/versioned/bounded action vocabularies. Free-form AI prose, arbitrary shell intent, unknown APIs, security/destructive/scope-expanding action is not executable authority. Unknown/ambiguous request rejects and replans/escalates.

Consequential actions use execution identity/idempotency where applicable: task_id, execution_id, idempotency_key, target, attempt. Before ambiguous retry, determine where possible whether prior side effect occurred. Retry preserves original task/outcome/target/authority/cost/evidence/capability scope; material change is replan/new authorization.

Capabilities declare REVERSIBLE / COMPENSATABLE / IRREVERSIBLE where applicable. Safe rollback: capture pre-state → execute → verify → authorized rollback if needed → verify rollback → persist. Rollback is never assumed safe for financial/public/security/account effects.

High-risk/irreversible actions require explicit target/action, appropriate authority, preflight, post-action evidence, and required Founder confirmation. Cost gate blocks paid activity absent Founder-approved cost authority. Secret presence ≠ secret-use authority; execution binds secrets to authorized department/capability/action/scope and never exposes secret values.

Executor/API success ≠ desired side-effect success. Where applicable post-action evidence includes external retrieval, object ID/permalink, callback, transaction confirmation, live URL/state check, or equivalent independent evidence.

Multi-step partial execution records exact committed steps as PARTIALLY_EXECUTED or equivalent and chooses continuation/rollback/compensation/incident/Founder decision from actual state. Conflicting operations use department/capability/task/resource/target locks with safe timeout/recovery.

Development zones use dry-run/mock/sandbox/staging where practical. Dry-run success is not production proof. RIO-1 uses qualified production executors/credentials/authority. RIO-2 defaults to development/test/mock/staging/safe internal work; production-impacting execution passes controlled gates. Tony cannot create production authority.

Every consequential execution produces an auditable receipt containing where applicable task/execution IDs, department, capability/version, action, authority, target, timestamps, attempt, gate summary, result, side-effect reference, evidence refs, verification verdict, rollback/compensation state, and cost/budget result. Victor verifies using receipt plus Point 5.5 evidence; Founder gets management summary by default.

Hard invariants: AI NEVER DIRECTLY OWNS CONSEQUENTIAL SIDE EFFECTS; EVERY CONSEQUENTIAL ACTION PASSES POLICY/AUTHORITY/CAPABILITY/PRECONDITION/SECRET-SCOPE/COST GATES; EXECUTORS ACCEPT ONLY BOUNDED DECLARED ACTIONS; UNKNOWN/AMBIGUOUS REQUESTS FAIL CLOSED; RETRY PRESERVES ORIGINAL BOUNDARIES; DUPLICATES PREVENTED WHERE APPLICABLE; EXECUTION/API SUCCESS ≠ VERIFIED SIDE-EFFECT SUCCESS; PARTIAL EXECUTION RECORDED EXACTLY; ROLLBACK ONLY WHERE SAFE; SECRET AVAILABILITY ≠ SECRET-USE AUTHORITY; NO PAID EXECUTION WITHOUT FOUNDER APPROVAL; RIO-2 HAS NO DEFAULT RIO-1 PRODUCTION AUTHORITY; CONSEQUENTIAL EXECUTION PRODUCES RECEIPT + POST-ACTION EVIDENCE.

---

## 5.7 — External Action Gates & Founder Authority Boundaries — LOCKED

### Core principle

Technical ability to act externally is never equal to organizational permission to act externally.

Every external action must have an explicit action/risk class, a valid authority source, a bounded scope, and an auditable authorization path before execution.

### External action classes

Default classes:

- E0 — INTERNAL_ONLY: internal reasoning, drafting, state, analysis; no external side effect.
- E1 — EXTERNAL_READ: external information retrieval with no material write/commitment.
- E2 — LOW_RISK_EXTERNAL_WRITE: bounded reversible external write already covered by a declared capability/policy.
- E3 — PUBLIC_OR_REPUTATIONAL: public publishing, outbound representation, social/company-facing communication, public website changes.
- E4 — FINANCIAL_OR_COMMERCIAL: spending, purchases, ads, subscriptions, payments, paid services, commercial commitments.
- E5 — SECURITY_IDENTITY_ACCOUNT: credentials, permissions, access control, account ownership, token/key/security configuration.
- E6 — DESTRUCTIVE_LEGAL_IRREVERSIBLE: hard deletion, account closure, legal/binding submissions, irreversible commitments, equivalent high-risk actions.

Default authority guidance:

- E0: AUTO where contracted.
- E1: AUTO where contracted and policy-compliant.
- E2: AUTO or VICTOR_AUTHORIZATION according to capability contract.
- E3: VICTOR_AUTHORIZATION or FOUNDER_ONLY unless Founder has explicitly delegated a bounded autonomous envelope.
- E4: FOUNDER_ONLY unless an explicit Founder-approved budget/delegation exists.
- E5: FOUNDER_ONLY by default; only specifically delegated safe/recovery operations may be narrower.
- E6: FOUNDER_ONLY or PROHIBITED according to policy.

These are defaults; explicit Founder-approved policy may delegate narrower authority without changing Founder final authority.

### Delegation envelope

Founder may grant bounded recurring authority so safe repetitive work does not require repeated approval.

A delegation envelope should bind where applicable:

- department;
- capability/action;
- allowed targets/surfaces;
- authority class;
- quantitative limits/rate limits;
- required validators/evidence;
- cost/budget limit;
- time/expiry conditions;
- reversibility/safety conditions;
- communication/escalation conditions.

Example concept: RIO-1 may autonomously publish verified affiliate content only to RIO-owned approved targets, only after required validators pass, within zero-cost policy and declared rate limits.

Delegation is bounded authority, not blanket permission to “do whatever is needed.”

### Scope-expansion rule

Objective optimization, AI initiative, fallback routing, retry, or departmental collaboration must never silently expand external scope, target, side-effect class, spending, security privilege, or authority.

If an optimized plan introduces a materially new external action, it becomes a separate authorization decision.

### Approval specificity and lifecycle

Consequential approvals should bind to who/department, capability/action, target, limits, cost, conditions, duration, and authority source.

Approval states may include REQUESTED / APPROVED / ACTIVE / EXPIRED / REVOKED / CONSUMED / SUSPENDED.

One-time approval becomes CONSUMED after its authorized action is completed. Recurring delegation may remain ACTIVE until expiry/revocation/suspension.

Victor must interpret natural-language Founder instructions conservatively into the narrowest operational authority consistent with Founder intent; ambiguous language must not become unlimited production authority.

### Immediate Founder revocation / pause

Founder revocation, stop, pause, or narrowing of external authority uses an immediate authenticated control path and must not wait for the next heartbeat.

Founder revoke → Victor control-state update → affected capability/queue blocked or paused → in-flight state safely assessed → Founder acknowledgment.

Revocation affects pending/new executions immediately; handling of already-committed side effects follows Point 5.6 recovery/compensation rules.

### Public communication surfaces

Public/outbound communication authority is surface-specific. PUBLIC_POST, DIRECT_MESSAGE, EMAIL, CUSTOMER_RESPONSE, PARTNER_OUTREACH, OFFICIAL_STATEMENT, or equivalent communication capabilities require their own declared scope.

Permission to publish a website article does not automatically grant authority to send emails, represent the Founder, contact partners, make official statements, or post on unrelated social surfaces.

### Financial authority

No autonomous system may create a new financial commitment without explicit Founder-approved budget/delegation.

Paid APIs, paid AI inference, ads, subscriptions, purchases, infrastructure upgrades, vendor payments, domains, or other paid actions remain blocked when cost authority is absent.

Until a Founder-approved budget exists, the default cost limit is zero.

If a budget is delegated, Victor must enforce the exact envelope, track usage, prevent overrun, and surface material spending/status to the Founder according to reporting policy.

### Security / identity / account authority

Credential creation/rotation, permission changes, access invitations/removals, account ownership, DNS/security settings, repository/account access, or equivalent identity/security controls default to Founder authority.

Tony/Victor may diagnose, recommend, stage safe internal repairs, and perform explicitly delegated low-risk recovery, but may not silently expand privilege or alter external account authority.

### Destructive / irreversible actions

Prefer reversible alternatives when they satisfy the objective, e.g. archive/disable before hard delete.

Hard delete, irreversible submission, account closure, legal/binding action, or equivalent requires explicit target, appropriate Founder authority, pre-action evidence/backup/recovery status where applicable, guarded execution receipt, and post-action verification.

Vague AI prose must never be interpreted into irreversible authority.

### Emergency containment rule

Emergency autonomy may reduce exposure without waiting for Founder where already authorized for safety: pause capability, block queue, disable internal execution path, isolate runtime, reduce internal privileges, or prevent additional side effects.

Emergency response may not silently expand authority, create paid services, modify external account ownership/security beyond delegated recovery scope, or make new irreversible commitments.

Core principle: EMERGENCY AUTONOMY MAY REDUCE EXPOSURE; IT MAY NOT SILENTLY EXPAND AUTHORITY.

### Cross-department authority preservation

Cross-department routing/fallback cannot be used as an authority bypass.

If task/action authority is FOUNDER_ONLY for one department, routing it to another technically capable department does not convert it to AUTO.

Authority follows the task/action and its declared scope, not whichever executor can technically perform it.

### Founder approval request abstraction

When Founder approval is required, Victor should present a concise human-readable decision request containing where relevant:

- what will happen;
- why it is proposed;
- department/capability;
- exact target/scope;
- material risk;
- cost/budget impact;
- reversibility;
- expected outcome;
- Victor recommendation;
- requested Founder decision.

Raw policy JSON/logs are not the default Founder interface.

### Authorization audit linkage

Consequential authority records should contain where applicable:

- approval_id;
- authority source;
- task_id;
- department/capability;
- action/class;
- target/scope/limits;
- cost allowance;
- issued/approved/activated timestamps;
- expiry/consumption/revocation/suspension state.

Execution receipts must reference the applicable approval/delegation identifier so the chain remains auditable:

Founder authority → Victor authorization record → Department execution → Evidence → Victor verification.

No secret values may be included in approval records.

### 5.7 Hard invariants

EXTERNAL TECHNICAL CAPABILITY DOES NOT CREATE EXTERNAL AUTHORITY.

EVERY EXTERNAL ACTION REQUIRES AN EXPLICIT ACTION CLASS AND VALID AUTHORITY SOURCE.

FOUNDER AUTHORITY MAY BE DELEGATED ONLY THROUGH A BOUNDED, AUDITABLE ENVELOPE; DELEGATION IS NOT UNLIMITED AUTHORITY.

OBJECTIVE OPTIMIZATION MUST NEVER SILENTLY EXPAND EXTERNAL SCOPE, TARGETS, COST, SECURITY PRIVILEGE, OR AUTHORITY.

AUTHORITY FOLLOWS THE TASK/ACTION, NOT WHICHEVER DEPARTMENT OR FALLBACK EXECUTOR CAN TECHNICALLY PERFORM IT.

NO NEW FINANCIAL COMMITMENT WITHOUT FOUNDER-APPROVED BUDGET/AUTHORITY.

SECURITY, IDENTITY, ACCOUNT CONTROL, LEGAL, DESTRUCTIVE, AND IRREVERSIBLE ACTIONS DEFAULT TO FOUNDER AUTHORITY OR PROHIBITED.

FOUNDER REVOCATION/PAUSE MUST USE AN IMMEDIATE CONTROL PATH, NOT HEARTBEAT WAIT.

EMERGENCY AUTONOMY MAY REDUCE EXPOSURE/PRIVILEGE; IT MAY NOT SILENTLY EXPAND AUTHORITY.

CROSS-DEPARTMENT ROUTING MAY NOT BYPASS ACTION AUTHORITY.

CONSEQUENTIAL AUTHORITY/APPROVALS MUST BE AUDITABLE AND LINKED TO EXECUTION RECEIPTS.

---

# POST-ARCHITECTURE DEPARTMENT MIGRATION & COMMUNICATION CERTIFICATION — LOCKED

Architecture/rule-set locking precedes broad department migration. Departments are handled one-by-one in Founder-selected order:

Architecture Standard → Department Audit → Gap Analysis → Migration/Implementation → Tests/Validators → Live Verification → Victor Compliance Certification → Victor↔Department Communication Certification → Founder-visible operational update.

Compliance states: LOCKED / ASSESSED / MIGRATION_REQUIRED / IMPLEMENTED / VERIFIED / LIVE_COMPLIANT. Existing departments may remain legacy/current until migrated; new departments should be born against locked standard and not called fully autonomous/LIVE before qualification.

Mandatory communication certification: Victor TASK_REQUEST/authorized instruction → Department TASK_ACCEPTED → progress/dependency reporting where relevant → TASK_RESULT → evidence → Victor verification → Founder-readable update. Failure/blocker paths represent BLOCKED, INCIDENT, CAPABILITY_PAUSED, FOUNDER_ACTION_REQUIRED, recovery/escalation.

Founder-facing output is concise human-readable management language, not raw machine message dumps.

Founder ↔ Victor interaction experience remains REQUIRED / PARKED FOR LATER DESIGN. A later phase must improve commands, updates, decisions, blockers, evidence, and department activity into a smooth management experience, potentially through a Founder Communication Viewer / Command Center or equivalent. Project must not be declared fully complete until this is designed, implemented, and verified to Founder-approved standard.

---

# CURRENT LOCK STATUS

- Point 1 — Canonical System State: LOCKED
- Point 2 — Victor Orchestration Engine: LOCKED
- Point 3 — Department Contracts & Adapter Framework: LOCKED
- Point 4 — Resilience / Tony Stark Recovery: LOCKED
- Communication Standard: LOCKED
- Point 5.1 — Department Identity & Constitutional Binding: LOCKED
- Point 5.2 — Runtime Liveness & Adaptive Heartbeat: LOCKED
- Point 5.3 — AI & Provider Binding / Provider-Agnostic AI Slots: LOCKED
- Point 5.4 — Capability Contracts, Qualification & Development Promotion: LOCKED
- RIO-1 Production / RIO-2 Development operating split: LOCKED under Point 5.4
- Point 5.5 — Truth, Validators, Evidence & Victor Verification: LOCKED
- Point 5.6 — Guarded Execution & Side-Effect Control: LOCKED
- Point 5.7 — External Action Gates & Founder Authority Boundaries: LOCKED
- Post-Architecture Department Migration & Communication Certification: LOCKED
- Founder ↔ Victor Communication Experience Improvement: REQUIRED / PARKED FOR LATER DESIGN
- Point 5.8 onward: NOT YET LOCKED

---

# CANONICAL STORAGE RULE

Every newly locked architecture point or sub-point must be added to this file as the authoritative architecture record.

Implementation-specific files may contain detailed executable logic, schemas, code, state, or specialized policies, but this file remains the top-level Founder/Victor lock register describing what has been approved and what remains unlocked.
