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

Technical ability to act externally is never equal to organizational permission to act externally. Every external action needs an explicit action/risk class, valid authority source, bounded scope, and auditable authorization path.

External classes: E0 INTERNAL_ONLY; E1 EXTERNAL_READ; E2 LOW_RISK_EXTERNAL_WRITE; E3 PUBLIC_OR_REPUTATIONAL; E4 FINANCIAL_OR_COMMERCIAL; E5 SECURITY_IDENTITY_ACCOUNT; E6 DESTRUCTIVE_LEGAL_IRREVERSIBLE.

Default authority: E0 AUTO where contracted; E1 AUTO where contracted/policy-compliant; E2 AUTO or VICTOR_AUTHORIZATION by contract; E3 VICTOR_AUTHORIZATION or FOUNDER_ONLY unless bounded Founder delegation exists; E4 FOUNDER_ONLY absent explicit budget/delegation; E5 FOUNDER_ONLY by default; E6 FOUNDER_ONLY or PROHIBITED.

Founder may grant bounded recurring delegation envelopes that bind department, capability/action, targets/surfaces, limits/rate, validators/evidence, budget, time/expiry, reversibility/safety, and communication/escalation conditions. Delegation is not blanket authority.

Objective optimization, AI initiative, fallback, retry, or collaboration may never silently expand external scope, target, side-effect class, spending, security privilege, or authority. Materially new external action requires separate authorization.

Approvals should bind who/department, capability/action, target, limits, cost, conditions, duration, authority source. Lifecycle may include REQUESTED / APPROVED / ACTIVE / EXPIRED / REVOKED / CONSUMED / SUSPENDED. Natural-language Founder instructions are interpreted conservatively into the narrowest operational authority consistent with intent.

Founder revocation/stop/pause uses immediate authenticated control path, not heartbeat wait: update control state → block/pause affected queue/capability → safely assess in-flight state → acknowledge Founder.

Public/outbound communication authority is surface-specific. Website publish permission does not imply email/DM/partner outreach/official statement authority.

No autonomous system may create a new financial commitment without explicit Founder-approved budget/delegation. Until approved, cost limit is zero. Budgeted delegation must enforce envelope, track usage, prevent overrun, and report material spend/status.

Credential creation/rotation, permissions, account ownership/access, DNS/security settings, repository/account access default to Founder authority. Tony/Victor may diagnose/recommend/stage safe repairs and perform explicitly delegated low-risk recovery, but may not silently expand privilege.

Prefer reversible alternatives before hard delete. Destructive/legal/irreversible actions require exact target, Founder authority where applicable, pre-action evidence/backup status, guarded receipt, and post-action verification.

Emergency autonomy may reduce exposure through pause/block/isolation/reduced internal privilege where authorized, but cannot silently expand authority, create paid services, alter external account authority beyond delegated recovery scope, or create irreversible commitments.

Cross-department routing/fallback cannot bypass authority. Authority follows task/action scope, not whichever department can technically perform it.

Founder approval requests are concise management decisions explaining what/why/department/capability/target/risk/cost/reversibility/expected outcome/Victor recommendation/requested decision; raw policy JSON is not default.

Consequential approvals are auditable and linked through approval_id to execution receipt: Founder authority → Victor authorization record → Department execution → Evidence → Victor verification.

Hard invariants: EXTERNAL TECHNICAL CAPABILITY ≠ EXTERNAL AUTHORITY; EVERY EXTERNAL ACTION REQUIRES ACTION CLASS + VALID AUTHORITY; FOUNDER DELEGATION IS BOUNDED/AUDITABLE; OPTIMIZATION CANNOT SILENTLY EXPAND SCOPE/TARGET/COST/PRIVILEGE/AUTHORITY; AUTHORITY FOLLOWS TASK/ACTION; NO NEW FINANCIAL COMMITMENT WITHOUT FOUNDER BUDGET; SECURITY/IDENTITY/ACCOUNT/LEGAL/DESTRUCTIVE/IRREVERSIBLE DEFAULT TO FOUNDER OR PROHIBITED; FOUNDER REVOCATION IS IMMEDIATE; EMERGENCY AUTONOMY MAY REDUCE EXPOSURE BUT NOT EXPAND AUTHORITY; CROSS-DEPARTMENT ROUTING CANNOT BYPASS AUTHORITY; APPROVALS LINK TO EXECUTION RECEIPTS.

---

## 5.8 — Memory, Audit, Learning & Decision Persistence — LOCKED

### Core principle

A department and Victor must preserve enough history to know what happened, why it happened, under whose authority it happened, what evidence proved it, and what was learned, without allowing learning or memory to silently rewrite constitutional rules.

### Memory layers

The architecture distinguishes four memory layers:

1. **CONSTITUTIONAL MEMORY** — SOUL, locked objective/definition, Founder authority, delegation boundaries, protected architecture/governance rules. This is high-protection and cannot be modified by ordinary task/AI/department execution.
2. **OPERATIONAL MEMORY** — current/pending/blocked work, active incidents, capability state, dependencies, last valid action, next valid action, execution locks and continuity state.
3. **EVIDENCE / AUDIT MEMORY** — execution receipts, validators, approvals, external references, failures, rollbacks, incidents, provider switches, communication and verification history.
4. **LEARNING MEMORY** — failure patterns, successful/failed recovery approaches, source reliability observations, routing/retry lessons, recurring dependency patterns and improvement recommendations.

Learning may influence future recommendations, routing, retry, prioritization and diagnosis, but it is not constitutional authority.

### Binding decision persistence

Founder/Victor decisions that are intended to become operationally binding must be persisted canonically rather than existing only as chat/Telegram acknowledgment.

A decision record should contain where applicable:

- decision_id;
- authority source;
- scope/department/capability/task;
- decision/action;
- effective_from;
- conditions/limits;
- expiry where applicable;
- current status;
- supersedes/superseded_by reference;
- evidence/approval reference where relevant.

ACKNOWLEDGED DECISION ≠ PERSISTED BINDING DECISION.

### Task lineage

Task identity/history must survive retries, provider switches, fallbacks, recovery, delegation and subtask decomposition.

Relevant lineage includes parent task, subtasks, assigned department/capability, attempts, fallbacks, approvals, execution receipts, evidence, verification, blockers, incidents and final business/technical outcome.

A new AI call or fallback provider does not create a new constitutional/task history.

### Audit immutability and supersession

Historical audit/evidence/decision records must not be silently rewritten to make past state disappear.

New state may supersede old state using explicit version/supersession linkage. Current canonical state can change, but historical provenance remains traceable.

### Memory versus current truth

Memory informs present reasoning but does not override fresh verified runtime truth.

Old healthy state, old provider success, old approval, old capability evidence or stale business state cannot silently remain current merely because it exists in memory.

Fresh evidence and Point 5.5 truth policy determine current operational truth.

### Learning authority boundary

Learning may recommend changes but may not autonomously:

- modify SOUL;
- change locked objective/definition;
- expand/reduce Founder authority outside approved process;
- grant new external or security authority;
- create paid authority/budget;
- weaken required validators/evidence;
- weaken secret isolation/security policy;
- modify protected constitutional architecture.

Such changes require the appropriate Victor/Founder approval and canonical persistence.

### Incident/problem learning

Recovery records should preserve where applicable:

- failure signature;
- root cause;
- containment;
- attempted repairs;
- failed repairs;
- successful recovery;
- validation/live-verification evidence;
- prevention recommendation;
- regression/prevention rule.

Repeated equivalent failures should create problem-level/systemic RCA rather than endless isolated retries.

Historical repair guidance can accelerate diagnosis, but an old fix must not be blindly executed if current state, authority, dependency, version or evidence no longer matches.

### Retention classes

Memory may be classified as PERMANENT / LONG_TERM / OPERATIONAL / EPHEMERAL or equivalent.

Examples: constitutional identity/Founder authority → PERMANENT; approvals/incidents/execution receipts → LONG_TERM according to policy; active task context → OPERATIONAL; disposable AI scratch reasoning/output → EPHEMERAL unless promoted into an approved record.

Retention policy must preserve required auditability without treating every temporary AI artifact as permanent truth.

### Secret safety

Raw secrets, API keys, tokens, passwords or equivalent credential material must not be stored in operational, audit or learning memory.

Safe secret references/identifiers may be persisted when needed, but the credential value remains only in the authorized secret store.

### Cross-department memory isolation

Department-specific operational/sensitive memory follows need-to-know and authority boundaries. One department does not automatically gain another department's operational memory or sensitive evidence.

Victor may retain the control-plane visibility required for coordination/accountability, while cross-department sharing is limited to authorized task context, approved evidence, dependencies, handoff data and required management state.

### Founder traceability

The Founder is not required to read raw history during normal operation. Victor must be able to answer human-readable questions such as why a department is blocked, what changed, why a fallback was chosen, who authorized an action, and whether a failure has happened before.

Victor must trace such answers back to the relevant authority, decision, evidence, execution and outcome records.

### 5.8 Hard invariants

CONSTITUTIONAL MEMORY, OPERATIONAL MEMORY, AUDIT MEMORY, AND LEARNING MEMORY ARE DISTINCT LAYERS.

FOUNDER/VICTOR BINDING DECISIONS MUST BE PERSISTED CANONICALLY; CHAT OR TELEGRAM ACKNOWLEDGMENT ALONE IS NOT ENOUGH.

TASK IDENTITY AND HISTORY SURVIVE RETRIES, FALLBACKS, PROVIDER CHANGES, AND RECOVERY.

AUDIT/EVIDENCE HISTORY MUST NOT BE SILENTLY REWRITTEN; NEW STATE SUPERSEDES OLD STATE WITH TRACEABILITY.

LEARNING MAY IMPROVE RECOMMENDATIONS, ROUTING, RETRY, PRIORITIZATION AND DIAGNOSIS, BUT MAY NOT CHANGE SOUL, OBJECTIVE, FOUNDER AUTHORITY, SECURITY POLICY, COST AUTHORITY OR REQUIRED VALIDATORS WITHOUT PROPER APPROVAL.

MEMORY DOES NOT OVERRIDE FRESH VERIFIED RUNTIME TRUTH.

REPEATED FAILURES MUST CREATE PROBLEM-LEVEL LEARNING/RCA, NOT ENDLESS BLIND RETRIES.

SECRETS MUST NEVER BE STORED IN OPERATIONAL/AUDIT/LEARNING MEMORY; ONLY SAFE REFERENCES MAY BE PERSISTED.

CROSS-DEPARTMENT MEMORY ACCESS FOLLOWS NEED-TO-KNOW AND AUTHORITY BOUNDARIES.

FOUNDER MUST BE ABLE TO ASK WHY A DECISION/ACTION HAPPENED AND VICTOR MUST TRACE IT TO AUTHORITY, EVIDENCE, EXECUTION AND OUTCOME.

---

## 5.9 — Self-Healing, Recovery Contract & Problem Management — LOCKED

### Core principle

A LIVE department is not only able to execute work; it must be able to detect failure, classify impact, contain risk, recover within delegated authority, verify recovery, preserve learning, and escalate when autonomous recovery is no longer safe or authorized.

Standard lifecycle:

DETECT → CLASSIFY → CONTAIN → DIAGNOSE → RECOVER → TEST → LIVE_VERIFY → RESTORE → LEARN → CLOSE.

Failure detection must not immediately become blind retry.

### Failure-scope classification

The architecture distinguishes where applicable:

- TASK_FAILURE;
- CAPABILITY_FAILURE;
- DEPENDENCY_FAILURE;
- PROVIDER_FAILURE;
- RUNTIME_FAILURE;
- DATA_STATE_FAILURE;
- SECURITY_FAILURE;
- BUSINESS_OUTCOME_FAILURE;
- DEPARTMENT_FAILURE only when department-level constitutional/liveness criteria actually fail.

One capability/task failure does not automatically classify the whole department as failed.

### Recovery authority ladder

Point 4 repair authority is operationalized as:

- L0 — observe/diagnose;
- L1 — safe automatic local recovery inside predeclared departmental authority;
- L2 — Tony repair under Victor-authorized code/config/workflow scope;
- L3 — external account/infrastructure repair requiring Founder authority;
- L4 — sensitive/destructive/security/cost/constitutional recovery requiring Founder authority.

Examples of potentially L1 recovery when explicitly declared safe include state refresh, bounded transient retry, qualified provider fallback, safe local worker restart, stale-lock reconciliation, and rollback of a reversible local change.

### Retry contract

Each capability should define where applicable whether an error is retryable, maximum attempts, backoff policy, retry conditions and non-retryable errors.

Retries are bounded, condition-aware and backoff-controlled. Permanent/authorization/credential/schema/security/business-rule failures must not be hammered with blind retry.

Examples: rate-limit/transient error may back off; invalid credentials should block/escalate rather than loop; schema mismatch should replan/Tony; financial rejection should not be blindly retried.

### Fallback versus healing

Task continuity and original-capability recovery remain separate.

If fallback completes the task, task continuity may be RESTORED while the failed original capability still has an OPEN incident.

FALLBACK SUCCESS DOES NOT CLOSE THE ORIGINAL INCIDENT.

### Containment priority

When further execution could amplify harm, containment may take priority over immediate restoration.

Examples include duplicate publishing, credential anomaly, wrong public content, runaway loop, unexpected paid request or corrupted state.

Authorized containment may pause a capability, block a queue, preserve evidence, isolate the affected component or reduce internal execution exposure before repair.

### Circuit breaker / anti-loop behavior

Repeated qualifying failures should trigger circuit-breaker/problem-management behavior rather than endless retries.

Conceptual states may include CLOSED → OPEN → HALF_OPEN → CLOSED.

OPEN blocks normal execution after repeated failure; HALF_OPEN permits a controlled test after repair/recovery; return to CLOSED requires successful validation/live verification.

Thresholds are capability/risk-specific and deterministic/policy-bounded.

### Recovery verification

Restart/process success or disappearance of an error is not recovery proof.

Recovery requires the applicable repair plus required tests, validators and fresh capability-appropriate live evidence.

Only after required evidence passes may the relevant capability/runtime be marked RECOVERED/HEALTHY. Otherwise it remains RECOVERING, DEGRADED, BLOCKED or FAILED as appropriate.

### Incident lifecycle

Standard incident lifecycle retains Point 4 semantics:

DETECTED → CLASSIFIED → TONY_ASSIGNED where required → DIAGNOSING → REPAIRING → TESTING → LIVE_VERIFIED → RECOVERED → CLOSED.

Valid variants include VICTOR_ESCALATED / FOUNDER_ESCALATED / BLOCKED / ROLLED_BACK.

Incident CLOSED requires verified recovery or an explicit authorized terminal disposition; task completion alone is not sufficient.

### Problem management

Repeated equivalent failures must generate problem-level/systemic RCA.

Problem management identifies the shared failure pattern, root/systemic cause, permanent repair, regression test, prevention rule and evidence that the fix prevents recurrence.

A persistent planner/executor vocabulary mismatch, repeatedly failing dependency, recurring state corruption or repeated provider flapping should be treated as a systemic problem rather than a stream of unrelated incidents.

### Healing memory

Point 5.8 learning/audit memory stores the failure signature, root cause, containment, attempted repairs, what failed/worked, recovery evidence and prevention action.

Previous recovery knowledge may accelerate diagnosis, but current version/state/authority/dependencies must still be validated before reusing a repair.

### Recovery cadence and priority

Incident severity may accelerate the adaptive heartbeat/recovery cadence within Point 5.2 limits. Critical recovery may use the 2-minute minimum where safe; lower severity uses an appropriate ladder step. After verified stability, cadence backs off with anti-flapping hysteresis.

### Founder escalation policy

Founder should not receive every transient technical error. Victor escalates when Founder authority/action is required or when impact warrants management attention, including security/account action, cost, destructive action, material public/customer/business impact, repeated/systemic failure, recovery deadline breach, unresolved consequential truth, or exhaustion of safe recovery paths.

Founder-facing incident communication should summarize what failed, business impact, what Victor/Tony tried, containment, current state, required Founder decision/action and Victor recommendation, rather than raw logs by default.

### RIO-1 / RIO-2 recovery separation

RIO-1 production failures receive production/business-continuity priority with authorized fallback, containment, Tony repair and live verification.

RIO-2 development failures remain development incidents/problems and do not automatically degrade RIO-1 unless a shared dependency, infrastructure, constitutional binding or production resource is actually affected.

Valid state example: RIO-1 HEALTHY / RIO-2 DEVELOPMENT_FAILED.

### Recovery authority cannot expand itself

Self-healing, Tony repair or Victor recovery may restore operation only within existing constitutional/delegated authority.

Recovery may diagnose a missing credential/account/budget/security requirement and prepare/escalate the needed action, but may not create unauthorized external accounts, provision paid services, expose/generate unauthorized credentials, expand secret access, alter Founder authority or silently increase privileges.

### 5.9 Hard invariants

FAILURE DETECTION MUST LEAD TO CLASSIFICATION BEFORE BLIND RECOVERY.

TASK FAILURE, CAPABILITY FAILURE, DEPENDENCY FAILURE, PROVIDER FAILURE, RUNTIME FAILURE, DEPARTMENT FAILURE AND BUSINESS OUTCOME FAILURE ARE SEPARATE STATES.

SAFE LOCAL SELF-HEALING IS ALLOWED ONLY WITHIN PREDECLARED AUTHORITY.

RETRY MUST BE BOUNDED, CONDITION-AWARE AND BACKOFF-CONTROLLED.

FALLBACK SUCCESS DOES NOT CLOSE THE ORIGINAL INCIDENT.

CONTAINMENT MAY TAKE PRIORITY OVER SERVICE RESTORATION WHEN FURTHER EXECUTION COULD CAUSE HARM.

REPEATED FAILURE MUST TRIGGER CIRCUIT-BREAKER / PROBLEM-MANAGEMENT BEHAVIOR RATHER THAN ENDLESS RETRIES.

RECOVERY IS NOT VERIFIED UNTIL REQUIRED TESTS, VALIDATORS AND FRESH LIVE EVIDENCE PASS.

INCIDENT CLOSURE REQUIRES VERIFIED RECOVERY OR AN EXPLICIT AUTHORIZED TERMINAL DISPOSITION.

HEALING HISTORY MUST BE PERSISTED FOR FUTURE RCA AND PREVENTION.

TONY/VICTOR RECOVERY AUTHORITY MAY REPAIR WITHIN SCOPE BUT MAY NOT EXPAND FOUNDER AUTHORITY, SPEND, SECRET ACCESS OR SECURITY PRIVILEGES.

RIO-2 DEVELOPMENT FAILURE DOES NOT AUTOMATICALLY DEGRADE RIO-1 PRODUCTION.

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
- Point 5.8 — Memory, Audit, Learning & Decision Persistence: LOCKED
- Point 5.9 — Self-Healing, Recovery Contract & Problem Management: LOCKED
- Post-Architecture Department Migration & Communication Certification: LOCKED
- Founder ↔ Victor Communication Experience Improvement: REQUIRED / PARKED FOR LATER DESIGN
- Point 5.10 onward: NOT YET LOCKED

---

# CANONICAL STORAGE RULE

Every newly locked architecture point or sub-point must be added to this file as the authoritative architecture record.

Implementation-specific files may contain detailed executable logic, schemas, code, state, or specialized policies, but this file remains the top-level Founder/Victor lock register describing what has been approved and what remains unlocked.
