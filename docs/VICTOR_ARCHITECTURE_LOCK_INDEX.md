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

# POINT 5 — Department Activation & Live Qualification Standard — LOCKED

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

A department and Victor preserve enough history to know what happened, why, under whose authority, what evidence proved it, and what was learned, without allowing learning/memory to rewrite constitutional rules.

Four memory layers are distinct: CONSTITUTIONAL MEMORY (SOUL/objective/Founder authority/delegation/protected rules), OPERATIONAL MEMORY (current work, blockers, incidents, capability/dependency/continuity state), EVIDENCE/AUDIT MEMORY (receipts, validators, approvals, external refs, failures, rollbacks, incidents, provider switches, communications), and LEARNING MEMORY (failure patterns, recovery lessons, source reliability, routing/retry/dependency insights).

Founder/Victor decisions intended to bind operations must be canonically persisted with decision_id, authority source, scope, action, effective time, conditions/limits, expiry/status, supersession and evidence/approval links where relevant. ACKNOWLEDGED DECISION ≠ PERSISTED BINDING DECISION.

Task identity/history survives retries, provider switches, fallbacks, recovery, delegation and subtasks. Audit/evidence/decision history is not silently rewritten; new state supersedes old with traceability. Memory informs reasoning but does not override fresh Point 5.5 verified truth.

Learning may improve recommendations/routing/retry/prioritization/diagnosis but may not modify SOUL/objective/Founder authority, grant external/security authority, create paid budget, weaken validators/evidence, weaken isolation/security, or modify protected architecture without proper approval.

Incident/problem learning preserves failure signature, root cause, containment, attempted repairs, failed/successful fixes, live-verification evidence, prevention recommendation and regression/prevention rules. Repeated failures create systemic RCA rather than endless isolated retries. Old repair advice is revalidated before reuse.

Retention may classify PERMANENT / LONG_TERM / OPERATIONAL / EPHEMERAL. Raw secrets/tokens/passwords never enter operational/audit/learning memory; only safe secret references may persist. Cross-department memory follows need-to-know/authority boundaries while Victor retains required control-plane visibility.

Founder need not read raw history; Victor must trace human-readable explanations back to authority, decision, evidence, execution and outcome.

Hard invariants: MEMORY LAYERS ARE DISTINCT; BINDING DECISIONS MUST BE CANONICALLY PERSISTED; TASK HISTORY SURVIVES RETRY/FALLBACK/PROVIDER CHANGE/RECOVERY; AUDIT HISTORY IS NOT SILENTLY REWRITTEN; LEARNING CANNOT CHANGE CONSTITUTION/AUTHORITY/COST/SECURITY/VALIDATORS WITHOUT APPROVAL; MEMORY DOES NOT OVERRIDE FRESH VERIFIED TRUTH; REPEATED FAILURES CREATE PROBLEM-LEVEL RCA; SECRETS ARE NOT STORED IN MEMORY; CROSS-DEPARTMENT MEMORY IS NEED-TO-KNOW; FOUNDER CAN ASK WHY AND VICTOR MUST TRACE THE CHAIN.

---

## 5.9 — Self-Healing, Recovery Contract & Problem Management — LOCKED

A LIVE department must detect failure, classify impact, contain risk, recover within delegated authority, verify recovery, preserve learning, and escalate when autonomous recovery is unsafe/unauthorized.

Lifecycle: DETECT → CLASSIFY → CONTAIN → DIAGNOSE → RECOVER → TEST → LIVE_VERIFY → RESTORE → LEARN → CLOSE.

Failure scopes include TASK_FAILURE, CAPABILITY_FAILURE, DEPENDENCY_FAILURE, PROVIDER_FAILURE, RUNTIME_FAILURE, DATA_STATE_FAILURE, SECURITY_FAILURE, BUSINESS_OUTCOME_FAILURE, and DEPARTMENT_FAILURE only when actual department-level criteria fail.

Recovery ladder: L0 observe/diagnose; L1 safe automatic local recovery inside predeclared authority; L2 Tony repair under Victor-authorized code/config/workflow scope; L3 external account/infrastructure repair requiring Founder; L4 sensitive/destructive/security/cost/constitutional recovery requiring Founder.

Each capability declares retryability/max attempts/backoff/retry conditions/non-retryable failures where applicable. Retries are bounded/condition-aware/backoff-controlled. Invalid credentials, schema mismatch, security/authorization/business-rule failures do not get blind retry loops.

Fallback success restores task continuity but does not close original capability incident. When further execution may amplify harm, containment can take priority: pause capability, block queue, preserve evidence, isolate component, reduce exposure.

Repeated qualifying failures trigger circuit-breaker/problem-management behavior, conceptually CLOSED → OPEN → HALF_OPEN → CLOSED, with deterministic capability-specific thresholds. Recovery requires applicable repair + tests + validators + fresh live evidence; restart or disappearance of an error is insufficient.

Incident lifecycle retains DETECTED → CLASSIFIED → TONY_ASSIGNED where required → DIAGNOSING → REPAIRING → TESTING → LIVE_VERIFIED → RECOVERED → CLOSED, with VICTOR_ESCALATED / FOUNDER_ESCALATED / BLOCKED / ROLLED_BACK variants. Closure requires verified recovery or explicit authorized terminal disposition.

Repeated equivalent failures create systemic RCA, permanent fix, regression test and prevention rule. Healing memory records failure signature/root cause/containment/attempts/success/failure/recovery evidence/prevention. Recovery cadence integrates with Point 5.2 and backs off after stable verification.

Founder is escalated when authority/action or material impact requires it, not for every transient error. Founder incident summary explains failure, business impact, Victor/Tony attempts, containment, current state, required decision/action and recommendation.

RIO-1 production failure receives production priority; RIO-2 development failure remains separate unless shared dependency/infrastructure/constitutional/production resource is affected. RIO-1 HEALTHY / RIO-2 DEVELOPMENT_FAILED is valid.

Self-healing/Tony/Victor may restore only within existing authority; recovery cannot create unauthorized accounts, paid services, credentials, expanded secret access, Founder authority changes or privilege expansion.

Hard invariants: CLASSIFY BEFORE BLIND RECOVERY; TASK/CAPABILITY/DEPENDENCY/PROVIDER/RUNTIME/DEPARTMENT/BUSINESS FAILURES ARE DISTINCT; LOCAL SELF-HEALING ONLY IN PREDECLARED AUTHORITY; RETRY BOUNDED/CONDITION-AWARE/BACKOFF-CONTROLLED; FALLBACK SUCCESS DOES NOT CLOSE ORIGINAL INCIDENT; CONTAINMENT MAY PRECEDE RESTORATION; REPEATED FAILURE TRIGGERS CIRCUIT-BREAKER/PROBLEM MANAGEMENT; RECOVERY REQUIRES TESTS/VALIDATORS/FRESH LIVE EVIDENCE; INCIDENT CLOSURE REQUIRES VERIFIED RECOVERY OR AUTHORIZED TERMINAL DISPOSITION; HEALING HISTORY PERSISTS; TONY/VICTOR RECOVERY CANNOT EXPAND FOUNDER AUTHORITY/SPEND/SECRET ACCESS/SECURITY PRIVILEGES; RIO-2 FAILURE DOES NOT AUTOMATICALLY DEGRADE RIO-1.

---

## 5.10 — LIVE Qualification, End-to-End Certification & Department Activation Gate — LOCKED

### Core principle

LIVE is a certification state backed by current runtime evidence, not a declarative label, repository state, green workflow, heartbeat success, model availability, or AI claim.

A department may be called LIVE_COMPLIANT only after all mandatory Point 5 gates required for its role are demonstrated end-to-end with fresh evidence.

### Mandatory qualification dimensions

Where applicable to the department, LIVE qualification covers:

- constitutional binding;
- runtime liveness and adaptive heartbeat;
- qualified AI/provider binding where AI is required;
- capability qualification and core-capability readiness;
- truth/validators/evidence;
- guarded execution and side-effect controls;
- external action/Founder authority boundaries;
- memory/audit/decision persistence;
- self-healing/recovery/problem management;
- Victor↔Department communication;
- Founder-readable reporting.

Failure of a mandatory dimension prevents full LIVE_COMPLIANT certification.

### Operational activation ladder

Recommended activation states:

PRESENT → CONSTITUTIONALLY_BOUND → RUNTIME_READY → CAPABILITIES_QUALIFIED → EXECUTION_VERIFIED → E2E_VERIFIED → COMMUNICATION_CERTIFIED → LIVE_COMPLIANT.

This operational ladder is distinct from migration/compliance progress states LOCKED / ASSESSED / MIGRATION_REQUIRED / IMPLEMENTED / VERIFIED / LIVE_COMPLIANT.

### Department LIVE versus capability LIVE

Department LIVE_COMPLIANT does not require every optional capability to be LIVE.

Capabilities are designated where relevant as CORE_REQUIRED / OPTIONAL / DEVELOPMENT.

The department must have all mandatory constitutional/liveness/control-plane gates plus a qualified minimum operational path for its locked objective. A failed or paused optional capability must be represented truthfully and does not automatically make the whole department dead.

If a CORE_REQUIRED capability is unavailable and no qualified authorized fallback preserves the minimum objective path, the department degrades/suspends according to impact rather than remaining falsely green.

### End-to-end certification test

LIVE certification must demonstrate the real chain:

Victor authorized TASK_REQUEST → Department TASK_ACCEPTED → planner/reasoning → capability selection → policy/authority gates → guarded executor → actual result/side effect where applicable → evidence → validators → TASK_RESULT / EVIDENCE_SUBMITTED → Victor rule-bound verification → Founder-readable management update.

Unit tests/config existence alone are insufficient.

External capabilities require controlled real-world evidence where appropriate to the side effect and risk.

### Negative-path certification

Happy-path success alone is insufficient.

Certification must deliberately verify important failure/control paths appropriate to the department, including where relevant:

- invalid/insufficient authority;
- missing or out-of-scope secret;
- provider unavailable;
- validator failure;
- dependency failure;
- unknown/uncontracted capability;
- duplicate/retry/idempotency handling;
- external post-action verification failure;
- kill/pause command;
- Founder revocation;
- recovery/Tony escalation;
- cost authority absent.

Expected behavior must be deterministic fail-closed/degraded/escalated behavior according to the locked rules.

### Kill-switch / Founder-control certification

Before LIVE_COMPLIANT certification, the system must prove the authenticated immediate Founder/authorized Victor control path where applicable:

Founder pause/revoke → immediate control-state update → new business/external execution blocked → in-flight state safely assessed → diagnostics/liveness/state persistence/communication remain available → Founder-readable acknowledgment.

Resume requires appropriate revalidation and must not blindly restore stale execution eligibility.

### Authority-boundary certification

Certification must test at least one representative unauthorized or out-of-envelope consequential action and prove it is blocked.

Examples include paid action with no budget, wrong department secret, Founder-only action, undeclared capability, external scope expansion, or fallback authority bypass.

Execution of a prohibited/unauthorized test action is a certification failure.

### Evidence certification

Victor must prove that workflow green, exit code 0, HTTP accepted, executor self-report, or AI claim is not treated as VERIFIED when the capability contract requires stronger evidence.

External side effects must reach the required post-action evidence and validator threshold before VERIFIED completion.

### Persistence/restart certification

A department must preserve constitutional identity, binding decisions, operational state, and task continuity across fresh wake/runtime cycles.

Representative test: begin/persist task state → runtime/wake boundary → reload constitutional + operational memory → continue/reconcile correctly without creating a new identity or forgetting the original task.

### Provider-fallback certification

Where AI reasoning is operationally required, a representative qualified provider fallback path should prove that task identity, objective, SOUL, authority, capability constraints, validator/evidence requirements and cost policy remain unchanged.

If all qualified AI providers are unavailable, the department must enter the correct degraded/diagnostic state rather than fabricate completion.

### Recovery certification

At least one representative recoverable failure should demonstrate:

failure → detection → classification → containment where needed → bounded recovery/Tony path → tests → validators → fresh live verification → recovered state.

The certification must preserve the distinction that fallback task success does not automatically close the failed original capability incident.

### Communication certification

The already locked communication standard becomes an activation gate.

Victor must demonstrate TASK_REQUEST → TASK_ACCEPTED → progress/dependency/blocker where relevant → TASK_RESULT → EVIDENCE_SUBMITTED → Victor verification → Founder-readable update.

Failure states such as BLOCKED, INCIDENT, CAPABILITY_PAUSED and FOUNDER_ACTION_REQUIRED must be representable and correctly surfaced.

### Founder-facing certification result

Founder receives a concise certification summary rather than raw technical dumps. It should identify status, core capability coverage, external execution verification where relevant, authority-control result, recovery/control result, communication result, material limitations, Founder action required and current business/outcome tracking state.

Level 2/3 evidence remains available under Point 5.5.

### Certification freshness and runtime states

LIVE_COMPLIANT is not a permanent badge. It depends on current evidence and mandatory gate validity.

Relevant states may include LIVE_COMPLIANT / LIVE_DEGRADED / CERTIFICATION_STALE / SUSPENDED / NON_COMPLIANT.

If critical evidence becomes stale, a constitutional/runtime/authority gate fails, or a material violation is detected, the certification must degrade/suspend rather than remain falsely LIVE.

### Risk-based recertification

Material changes trigger full or targeted recertification according to risk. Triggers include where relevant SOUL/objective change, authority change, new high-risk capability, executor change, provider protocol/adapter change, secret-scope change, major recovery, security incident, or material production architecture change.

Routine content/task changes do not require unnecessary full recertification when the governing capability/control contract is unchanged.

### RIO-1 / RIO-2 certification model

RIO remains one constitutional department.

RIO-1 PRODUCTION may achieve LIVE_COMPLIANT independently when its production gates/core capabilities pass.

RIO-2 DEVELOPMENT is reported as DEVELOPMENT_ACTIVE / DEVELOPMENT_DEGRADED / equivalent development state rather than production LIVE. Its capabilities move through the development/promotion lifecycle and undergo production qualification before entering RIO-1.

Valid management state: RIO Production = LIVE_COMPLIANT; RIO Development = ACTIVE.

### Victor certification authority is rule-bound

Victor may certify only from declared policies and evidence. Victor may not waive Founder-only authority, missing evidence, constitutional failure, secret-isolation violation, paid-action approval, failed mandatory validator, or required communication/control gate.

If a mandatory unwaivable gate fails, status is CERTIFICATION_BLOCKED / NON_COMPLIANT / appropriate degraded state rather than an optimistic LIVE claim.

### 5.10 Hard invariants

LIVE IS A VERIFIED CERTIFICATION STATE, NOT A DECLARATIVE LABEL.

REPOSITORY EXISTENCE, WORKFLOW GREEN, HEARTBEAT SUCCESS, MODEL AVAILABILITY OR AI CLAIM ALONE MUST NEVER PROVE LIVE STATUS.

LIVE_COMPLIANT REQUIRES ALL MANDATORY CONSTITUTIONAL, RUNTIME, CAPABILITY, AUTHORITY, EXECUTION, EVIDENCE, RECOVERY AND COMMUNICATION GATES TO PASS.

DEPARTMENT LIVE STATUS DOES NOT REQUIRE EVERY OPTIONAL CAPABILITY TO BE LIVE; CORE_REQUIRED CAPABILITIES DEFINE THE MINIMUM OPERATIONAL PATH.

END-TO-END CERTIFICATION MUST TEST REAL TASK FLOW FROM VICTOR INSTRUCTION THROUGH VERIFIED RESULT AND FOUNDER-READABLE REPORTING.

NEGATIVE/POLICY FAILURE PATHS MUST BE TESTED; HAPPY-PATH SUCCESS ALONE IS INSUFFICIENT.

FOUNDER PAUSE/REVOCATION AND FAIL-CLOSED AUTHORITY CONTROLS MUST BE PROVEN BEFORE LIVE CERTIFICATION.

CERTIFICATION REQUIRES CAPABILITY-APPROPRIATE REAL EVIDENCE, NOT ONLY EXIT CODES OR AI/WORKFLOW CLAIMS.

RUNTIME RESTART MUST NOT DESTROY DEPARTMENT IDENTITY, PERSISTENT STATE OR TASK CONTINUITY.

LIVE_COMPLIANT IS EVIDENCE-FRESHNESS DEPENDENT AND MAY DEGRADE, BECOME STALE OR BE SUSPENDED.

MATERIAL CHANGES TRIGGER RISK-APPROPRIATE RECERTIFICATION.

RIO-1 MAY BE LIVE_COMPLIANT WHILE RIO-2 REMAINS DEVELOPMENT_ACTIVE.

VICTOR MAY CERTIFY ONLY FROM DECLARED RULES AND EVIDENCE; VICTOR MAY NOT WAIVE FOUNDER AUTHORITY OR MANDATORY GATES.

---

# POINT 5 CLOSURE — LOCKED

Point 5.1 through Point 5.10 together form the locked Department Activation & Live Qualification Standard.

This closes the architecture definition for how a Victor-system department is constituted, kept alive, bound to AI/providers, divided into capabilities, verified for truth, executed safely, constrained by Founder authority, persisted/audited, healed/recovered, and certified LIVE.

Point 5 closure is an architecture milestone only. It does not certify any existing department as LIVE_COMPLIANT until that department completes the Founder-selected migration/audit/implementation/verification/certification sequence below.

---

# POST-ARCHITECTURE DEPARTMENT MIGRATION & COMMUNICATION CERTIFICATION — LOCKED

Architecture/rule-set locking precedes broad department migration. Departments are handled one-by-one in Founder-selected order:

Architecture Standard → Department Audit → Gap Analysis → Migration/Implementation → Tests/Validators → Live Verification → Victor Compliance Certification → Victor↔Department Communication Certification → Founder-visible operational update.

Compliance states: LOCKED / ASSESSED / MIGRATION_REQUIRED / IMPLEMENTED / VERIFIED / LIVE_COMPLIANT. Existing departments may remain legacy/current until migrated; new departments should be born against locked standard and not called fully autonomous/LIVE before qualification.

Mandatory communication certification: Victor TASK_REQUEST/authorized instruction → Department TASK_ACCEPTED → progress/dependency reporting where relevant → TASK_RESULT → evidence → Victor verification → Founder-readable update. Failure/blocker paths represent BLOCKED, INCIDENT, CAPABILITY_PAUSED, FOUNDER_ACTION_REQUIRED, recovery/escalation.

Founder-facing output is concise human-readable management language, not raw machine message dumps.

Founder ↔ Victor interaction experience remains REQUIRED / PARKED FOR LATER DESIGN. A later phase must improve commands, updates, decisions, blockers, evidence, and department activity into a smooth management experience, potentially through a Founder Communication Viewer / Command Center or equivalent. The overall Victor project must not be declared fully complete until this is designed, implemented, and verified to Founder-approved standard.

---

# CURRENT LOCK STATUS

- Point 1 — Canonical System State: LOCKED
- Point 2 — Victor Orchestration Engine: LOCKED
- Point 3 — Department Contracts & Adapter Framework: LOCKED
- Point 4 — Resilience / Tony Stark Recovery: LOCKED
- Communication Standard: LOCKED
- Point 5 — Department Activation & Live Qualification Standard: LOCKED / ARCHITECTURE CLOSED
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
- Point 5.10 — LIVE Qualification, End-to-End Certification & Department Activation Gate: LOCKED
- Post-Architecture Department Migration & Communication Certification: LOCKED
- Founder ↔ Victor Communication Experience Improvement: REQUIRED / PARKED FOR LATER DESIGN

---

# CANONICAL STORAGE RULE

Every newly locked architecture point or sub-point must be added to this file as the authoritative architecture record.

Implementation-specific files may contain detailed executable logic, schemas, code, state, or specialized policies, but this file remains the top-level Founder/Victor lock register describing what has been approved and what remains unlocked.
