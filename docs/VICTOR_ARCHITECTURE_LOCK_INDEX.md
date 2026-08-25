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

Automatic switching only among qualified providers while preserving task identity, department identity, objective, SOUL, authority, capability constraints, validator/evidence requirements, and cost policy. Provider/AI/capability/department/task/business health are separate. No qualified provider may leave department alive in degraded diagnostic mode while AI planning is blocked. Provider transitions are auditable and flapping detectable. No paid inference without Founder approval.

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

### Core principle

Planning and execution are separate layers. AI/planners may recommend structured actions, but only an authorized deterministic executor may create consequential side effects.

Execution path:

Task
→ AI/planner recommendation
→ capability contract
→ policy gate
→ authority gate
→ dependency/precondition gate
→ cost gate
→ validated bounded execution plan
→ executor
→ side effect
→ evidence capture
→ post-action verification
→ persistent result/receipt.

### Execution authority and side-effect classes

Authority classes remain AUTO / VICTOR_AUTHORIZATION / FOUNDER_ONLY / PROHIBITED and must be enforced at execution time.

Actions may be classified as NO_SIDE_EFFECT, INTERNAL_REVERSIBLE, INTERNAL_STATE_CHANGE, EXTERNAL_READ, EXTERNAL_WRITE, PUBLIC_PUBLISH, FINANCIAL, CREDENTIAL_SECURITY, and DESTRUCTIVE or equivalent risk classes.

Higher-risk, less reversible, security-sensitive, public, destructive, or cost-bearing actions require correspondingly stronger authority, preflight, evidence, rollback/compensation planning where possible, and post-action verification.

Technical capability never implies execution authority.

### Mandatory precondition gate

Before consequential execution, the runtime must verify where applicable:

- constitutional binding valid;
- task identity/authorization valid;
- capability enabled and eligible;
- required credentials available and in-scope;
- dependencies healthy enough;
- required approval current and valid;
- cost authority satisfied;
- input schema and target valid;
- required evidence/preconditions fresh;
- kill/pause switch clear;
- concurrency/execution lock clear;
- requested action exists in the declared executor vocabulary.

Failure of a mandatory gate results in EXECUTION_BLOCKED or equivalent fail-closed state. The system must not “try anyway.”

### Deterministic bounded executor

Executors accept only declared, versioned, bounded action vocabularies/contracts. Free-form AI prose, unknown commands, arbitrary shell intent, undocumented APIs, security changes, destructive operations, or scope-expanding actions must not be interpreted into executable authority.

Unsupported or ambiguous execution request → reject → replan/escalate.

### Idempotency and duplicate protection

Consequential actions must use execution identity and duplicate protection where applicable, including task_id, execution_id, idempotency_key, target identity, and attempt number.

Before retrying after ambiguous timeout/failure, the system should determine whether the prior side effect already occurred where technically possible.

A heartbeat, event replay, retry, or workflow duplication must not silently produce duplicate publishes, transactions, messages, or mutations.

### Retry boundary

Retry is not new authorization.

A retry preserves the original task identity, intended outcome, target constraints, authority class, cost boundary, evidence requirements, and capability scope.

If a retry materially changes the target, action, authority, side-effect class, cost, or intended outcome, it becomes a replan/new authorization decision rather than a silent retry.

### Reversibility / rollback / compensation

Capabilities should declare side-effect reversibility where applicable, such as REVERSIBLE, COMPENSATABLE, or IRREVERSIBLE.

For safely reversible operations:

pre-state capture → execute → verify → if failure, authorized rollback → verify rollback → persist evidence.

Rollback must never be assumed safe merely because an action failed. Financial transactions, public submissions, credential/security changes, account actions, and other irreversible/externally controlled effects may require compensation or Founder decision instead of automatic rollback.

### Irreversible/high-risk actions

Destructive, financial, sensitive security/credential, account closure, legal/public irreversible submission, or equivalent high-risk actions require explicit declared target/action, appropriate higher authority, preflight, post-action evidence, and any required Founder confirmation.

The executor must never infer an irreversible operation from vague AI prose.

### Cost gate

Technical availability of a paid API/service/provider does not grant spending authority.

Any action exceeding approved zero-cost/explicit budget authority is BLOCKED_COST_AUTHORITY until Founder-approved cost authority exists.

No paid execution, including paid AI inference, is permitted merely because credentials are valid.

### Secret-use gate

Secret presence does not grant secret-use authority.

At execution time the system must bind secret access to the authorized department, capability, action, and credential scope. Cross-department/cross-capability borrowing is prohibited unless explicitly approved under the isolation model.

Secret values must not be exposed in logs, evidence records, communication, or execution receipts.

### Side-effect verification

Executor/API success and desired side-effect success are separate stages.

HTTP 200, zero exit code, accepted request, or AI/executor “success” response does not automatically prove the intended external state.

Where applicable, the system must perform post-action verification such as external object retrieval, platform identifier/permalink, callback, transaction confirmation, live URL/state check, or equivalent independent evidence before the action/task is marked VERIFIED.

### Partial execution

Multi-step operations must record each committed step. If some steps succeed and a later step fails, the state is PARTIALLY_EXECUTED or equivalent, not silently collapsed into success/failure.

The recovery decision must determine safe continuation, rollback, compensation, incident escalation, or Founder decision from the exact committed state.

### Concurrency/resource locks

Where simultaneous operations can conflict, execution must support appropriate department/capability/task/resource/target locks. Stuck locks require timeout/recovery handling and must not be silently bypassed.

### Dry-run / development boundary

Development/experimental zones should use dry-run, mock, sandbox, staging, or other isolated execution where technically practical before production effects.

Dry-run success is not production proof.

RIO-1 uses qualified production executors/credentials/authority. RIO-2 defaults to development, test, mock, staging, and safe internal changes. RIO-2 production-impacting execution must pass controlled qualification/authority gates. Tony may repair/build RIO-2 but cannot create production authority.

### Execution receipt

Every consequential execution must produce an auditable machine-readable receipt containing where applicable:

- task_id;
- execution_id;
- department;
- capability/version;
- action;
- authority used;
- target/reference;
- start/finish timestamps;
- attempt number;
- precondition/gate result summary;
- execution result;
- side-effect reference;
- evidence references;
- post-action verification verdict;
- rollback/compensation state;
- cost/budget result.

Victor uses the receipt plus required evidence/validators for Point 5.5 verification. Founder receives the management summary by default, not raw receipt data.

### 5.6 Hard invariants

AI NEVER DIRECTLY OWNS CONSEQUENTIAL SIDE EFFECTS.

EVERY CONSEQUENTIAL ACTION PASSES POLICY, AUTHORITY, CAPABILITY, PRECONDITION, SECRET-SCOPE, AND COST GATES BEFORE EXECUTION.

EXECUTORS ACCEPT ONLY DECLARED BOUNDED ACTION VOCABULARIES.

UNKNOWN OR AMBIGUOUS EXECUTION REQUESTS FAIL CLOSED / REPLAN.

RETRY PRESERVES ORIGINAL TASK, AUTHORITY, TARGET, CAPABILITY, EVIDENCE, AND COST BOUNDARY.

DUPLICATE SIDE EFFECTS MUST BE PREVENTED THROUGH EXECUTION IDENTITY / IDEMPOTENCY WHERE APPLICABLE.

EXECUTION/API SUCCESS ≠ VERIFIED SIDE-EFFECT SUCCESS.

PARTIAL EXECUTION MUST BE RECORDED EXACTLY AND RECOVERED FROM THE ACTUAL COMMITTED STATE.

ROLLBACK IS PERMITTED ONLY WHERE THE ACTION CONTRACT DEFINES IT AS SAFE; IRREVERSIBLE/HIGH-RISK ACTIONS REQUIRE STRONGER AUTHORITY AND VERIFICATION.

SECRET AVAILABILITY ≠ SECRET-USE AUTHORITY.

NO PAID EXECUTION WITHOUT FOUNDER-APPROVED COST AUTHORITY.

RIO-2 DEVELOPMENT DOES NOT RECEIVE RIO-1 PRODUCTION EXECUTION AUTHORITY BY DEFAULT.

EVERY CONSEQUENTIAL EXECUTION PRODUCES AN AUDITABLE EXECUTION RECEIPT AND POST-ACTION EVIDENCE.

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
- Post-Architecture Department Migration & Communication Certification: LOCKED
- Founder ↔ Victor Communication Experience Improvement: REQUIRED / PARKED FOR LATER DESIGN
- Point 5.7 onward: NOT YET LOCKED

---

# CANONICAL STORAGE RULE

Every newly locked architecture point or sub-point must be added to this file as the authoritative architecture record.

Implementation-specific files may contain detailed executable logic, schemas, code, state, or specialized policies, but this file remains the top-level Founder/Victor lock register describing what has been approved and what remains unlocked.
