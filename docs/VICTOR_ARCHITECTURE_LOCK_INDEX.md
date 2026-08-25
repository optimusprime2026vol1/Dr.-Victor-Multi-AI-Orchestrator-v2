# Victor Architecture Lock Register

Status: ACTIVE — CANONICAL ARCHITECTURE RECORD
Authority: Founder → Victor
Scope: Victor control plane and all system departments

This file is the canonical register of architecture points that the Founder and Victor have explicitly designed and locked. Detailed code, contracts, runtime state, policies, and ledgers remain in their implementation files, but they must not contradict this record.

If a future implementation conflicts with this file, the conflict must be surfaced and reconciled through the proper authority chain; it must not be silently normalized.

---

# POINT 1 — Canonical System State — LOCKED

## Principle

Victor must operate from one reconciled system state rather than from multiple competing status files.

Runtime evidence takes precedence over stale declarative state when a conflict is provable, and conflicts must be recorded rather than hidden.

## Locked behavior

- Reconcile AI runtime, Telegram runtime, department registry, management state, Vision state, and other control-plane evidence into one canonical state.
- Runtime evidence may override stale registry claims, but the conflict must be preserved in the canonical state until reconciled.
- Victor heartbeat and orchestration must read canonical state rather than independently trusting stale source files.
- Critical AI, Telegram, authority/isolation, or canonical-state failures must fail closed where autonomous execution would otherwise rely on invalid state.
- Canonical state is a truth-reconciliation layer, not a mechanism for fabricating LIVE status.

## Primary implementation references

- `scripts/reconcile_system_state.py`
- `data/system_state.json`
- `scripts/victor_heartbeat.py`
- `data/department_registry.json`
- `data/management_protocol.json`

---

# POINT 2 — Victor Orchestration Engine — LOCKED

## Principle

No consequential external or departmental action may flow directly from AI output to side effect.

The locked control flow is:

Founder Objective
→ Canonical State
→ Planning / Decomposition
→ Routing
→ Capability Selection
→ Policy / Authority Check
→ Ledger
→ Executor
→ Result / Evidence
→ Verification
→ Retry / Failure / Escalation
→ KPI / Outcome
→ State / Report

## Hard invariant

AI DECISION → POLICY → AUTHORITY → EXECUTION → EVIDENCE → VERIFICATION.

AI output alone is never execution authorization.

## Primary implementation references

- `orchestrator/engine.py`
- `orchestrator/tasks.py`
- `orchestrator/planner.py`
- `orchestrator/router.py`
- `orchestrator/policy.py`
- `orchestrator/ledger.py`
- `orchestrator/evidence.py`
- executor / verifier / outcomes modules

---

# POINT 3 — Department Contracts & Adapter Framework — LOCKED

## Principle

Victor must interact with departments through explicit capability/authority contracts rather than assuming that repository existence implies executable capability.

## Locked behavior

Each department contract must define at minimum:

- identity / department name;
- allowed capabilities;
- enabled / disabled status;
- minimum evidence level;
- credential / secret scope;
- authority constraints;
- safe execution boundary.

Department-only credentials must remain isolated to their department scope.

A missing, malformed, disabled, unverified, or unauthorized capability must fail closed.

Safe planning/drafting/analyzing capabilities may exist even when external execution capability is intentionally disabled.

## Current contract references

- `departments/aura2.json`
- `departments/rio.json`
- `departments/oracle.json`
- `departments/pa_victor.json`
- `departments/vision.json`
- `departments/bubblebee.json`
- `departments/hulk.json`
- `departments/batman_bruce.json`
- `departments/tony_stark.json`
- `orchestrator/contracts.py`
- adapter / capability framework

---

# POINT 4 — Resilience, Continuity & Tony Stark Recovery — LOCKED

## Principle

Task continuity and system recovery are related but separate concerns.

A failed capability may be bypassed by an authorized fallback to complete a task, but fallback success does not prove that the failed original capability has healed.

## Continuity branch

Failure
→ identify alternate healthy authorized capability
→ policy / authority check
→ preserve parent task identity
→ fallback attempt
→ execute
→ verify
→ complete task or continue fallback / block.

## Recovery branch

Incident
→ classify severity
→ Tony diagnose
→ RCA
→ authorized repair
→ test
→ live verification
→ recover original capability
→ close incident only after verified recovery.

If Tony is blocked:

Tony → Victor structured escalation → controlled retry / repair authorization → Founder where authority requires.

## Hard rules

- Fallback success ≠ original capability healed.
- Task completion ≠ incident closure.
- Repeated failures must escalate from one-off incident handling into problem/systemic RCA.
- Capability-level health should be tracked separately from overall department health.
- Tony may not auto-provision credentials, paid services, security exceptions, destructive actions, or redefine constitutional authority.
- Founder remains final authority for sensitive / external / destructive / cost-bearing actions.

## Repair authority model

- L0 — diagnose / observe;
- L1 — safe local recovery;
- L2 — code/config/workflow repair under Victor-authorized scope;
- L3 — external infrastructure / account action requires Founder authority;
- L4 — sensitive/destructive/cost/security exception requires Founder authority.

## Primary implementation references

- `departments/tony_stark.json`
- `orchestrator/engine.py`
- incident / recovery / fallback logic
- department registry Tony entry

---

# COMMUNICATION STANDARD — Department ↔ Department ↔ Victor ↔ Founder — LOCKED

## Principle

Departments may collaborate, but Victor owns coordination, authority, state, and accountability.

The system is hub-and-spoke under Victor, not uncontrolled all-to-all autonomy.

## Allowed coordination concepts

Recognized message classes include:

- TASK_REQUEST
- TASK_ACCEPTED
- TASK_PROGRESS
- TASK_RESULT
- CAPABILITY_REQUEST
- INFORMATION_REQUEST
- INFORMATION_RESPONSE
- HANDOFF_REQUEST
- DEPENDENCY_BLOCKED
- EVIDENCE_SUBMITTED
- INCIDENT_REPORT
- HEALTH_UPDATE
- ESCALATION

## Rules

- Direct information exchange may occur when policy allows and must remain auditable.
- Consequential action, authority transfer, external side effect, or scope expansion requires Victor mediation / authorization where applicable.
- Tony incident/recovery messages receive priority according to severity.
- Telegram is a Founder/management interface, not the internal coordination bus.
- Event-driven communication is preferred; heartbeat may reconcile missed/stale coordination state.
- Loop prevention / message identity / dependency tracking must prevent uncontrolled recursive delegation.

## Core invariant

DEPARTMENTS MAY COLLABORATE, BUT VICTOR OWNS COORDINATION, AUTHORITY, STATE, AND ACCOUNTABILITY.

## Primary implementation references

- `orchestrator/messages.py`
- `orchestrator/coordination.py`
- `orchestrator/dependencies.py`
- `data/coordination_policy.json`
- `data/coordination_ledger.jsonl`

---

# POINT 5 — Department Activation & Live Qualification Standard — ACTIVE

Point 5 defines when a department may move from merely existing to being considered operationally autonomous / LIVE.

RIO architectural study is the main reference model used to derive this standard.

---

## 5.1 — Department Identity & Constitutional Binding — LOCKED

A Victor-system department must not be treated as an AI agent, bot, workflow, repository, provider, or single runtime process. It is a persistent governed autonomous system whose identity, purpose, authority, and continuity survive individual AI calls, provider changes, task failures, heartbeat cycles, and capability outages.

### Constitutional Identity Formula

Department Constitutional Identity =

Identity
+ Locked Objective / Definition
+ SOUL
+ Authority Boundary
+ Persistent State / Memory Contract

All five elements are mandatory for autonomous departmental execution.

### Identity

Each department must have an explicit organizational identity stating why it exists, which function it owns, and which responsibility it is accountable for.

Identity is not a list of capabilities. Capabilities may change without changing the department's identity.

### Locked Objective / Definition

Each department must have a Founder-approved or Founder-delegated objective/definition that provides measurable direction for autonomous decision-making.

Task selection must be objective-driven rather than activity-driven.

The governing question is:

Which permitted action, using current verified evidence, most effectively advances the locked objective?

Activity does not equal progress. Output does not equal outcome.

### SOUL

SOUL is the department's constitutional operating kernel. It governs how intelligence is used; it is not the intelligence provider itself.

AI providers are replaceable. A provider change must never change the department's identity, objective, authority, truth standard, evidence requirements, or SOUL.

No model or provider may expand its own authority.

### Authority Boundary

At creation time, each consequential action class must be assigned to one of these authority states:

- AUTO — department may execute autonomously within policy and evidence gates.
- VICTOR_AUTHORIZATION — department may prepare and recommend, but execution requires Victor authorization.
- FOUNDER_ONLY — only the Founder may authorize or perform the action.
- PROHIBITED — action is not permitted under current system policy.

Technical capability never implies organizational authority.

Founder remains the final authority.

### Persistent State / Memory Contract

A department must preserve operational continuity across wake cycles, model/provider changes, retries, and failures.

Persistent state must allow the department to determine at minimum:

- what it was doing;
- what completed;
- what failed;
- what evidence exists;
- what is blocked;
- what the next valid task is;
- which Founder or Victor decisions are locked and operationally binding.

A new AI call must not create a new identity or reset constitutional memory.

### 5.1 Hard Invariant

NO VALID CONSTITUTIONAL BINDING = NO AUTONOMOUS DEPARTMENTAL EXECUTION.

If any mandatory constitutional element is missing, invalid, contradictory, or unverifiable, business/external autonomous execution must fail closed.

Diagnostics, health reporting, evidence collection, and Founder/Victor communication may remain available so the department can explain the failure and support recovery.

### Runtime Enforcement Requirement

The constitutional binding must not exist only as documentation. Runtime must be able to load and validate the required identity, objective, SOUL, authority, and persistent-state binding before autonomous execution is allowed.

A system may not claim Point 5.1 compliance merely because the relevant files exist.

### Drift Rule

Provider changes, code changes, workflows, capabilities, retries, fallback paths, and repairs must not silently modify the constitutional identity.

Any proposed change to identity, locked objective, SOUL, Founder authority, or the constitutional standard itself requires the appropriate higher authority and must be persisted canonically.

### Activation Consequence

A department that does not satisfy Point 5.1 may be classified as present, partial, diagnostic-only, or under construction, but it must not be classified as fully autonomous/live solely because an endpoint, workflow, model, or heartbeat is running.

---

## 5.2 — Runtime Liveness & Adaptive Heartbeat — LOCKED

A department is not considered operationally LIVE merely because a workflow, process, API, model, or timer exists. Liveness must be continuously re-established through a bounded heartbeat/runtime mechanism that can wake the department, refresh truth, validate execution eligibility, record evidence, and either continue safely or remain diagnostic-only.

### Core Runtime Cycle

WAKE
→ load constitutional binding
→ load persistent state
→ inspect control / kill-switch state
→ inspect runtime and provider health
→ run relevant domain validators
→ inspect capability/dependency health
→ revalidate SOUL / authority binding
→ determine execution eligibility
→ execute, recover, or remain diagnostic-only
→ persist evidence and next state
→ schedule the next safe wake.

Heartbeat is a liveness mechanism, not an execution permission grant.

### Default, Minimum, and Approved Cadence Ladder

Default heartbeat interval: 60 minutes.

Minimum heartbeat interval: 2 minutes.

Approved ladder only:

60 → 30 → 15 → 10 → 5 → 3 → 2 minutes.

No AI/model/provider may invent an interval outside this ladder or independently increase monitoring frequency beyond policy limits.

### Adaptive Heartbeat Controller

Heartbeat cadence must be selected automatically from the approved ladder according to current work and runtime state.

The controller must consider at minimum:

- pending-task urgency;
- objective/business impact;
- Founder/Victor explicit priority;
- time urgency/deadline;
- dependency criticality and expected change rate;
- incident/health severity;
- current execution state;
- expected task duration;
- concurrency risk;
- API/provider rate limits;
- cost/resource constraints.

AI may provide evidence/context for classification, but final cadence selection must be policy-bounded and deterministic.

### Priority Score

Each pending task may receive a 0–100 priority score:

- Founder/Victor explicit priority: up to 25;
- locked-objective/business impact: up to 25;
- time urgency/deadline: up to 15;
- dependency criticality: up to 15;
- incident/health severity: up to 15;
- cost/rate-limit/concurrency penalty: subtract up to 15.

Priority Score = Founder/Victor Priority + Objective Impact + Urgency + Dependency Criticality + Incident Severity − Resource/Rate-Limit/Concurrency Penalty.

### Score-to-Cadence Mapping

- 0–20 → 60 minutes
- 21–35 → 30 minutes
- 36–50 → 15 minutes
- 51–65 → 10 minutes
- 66–80 → 5 minutes
- 81–90 → 3 minutes
- 91–100 → 2 minutes

Priority determines how soon the system should re-check its state. Priority does not grant execution authority.

### Runtime-State Overrides

- IDLE → normally 60 minutes;
- PENDING → score-based cadence;
- EXECUTING → normally 5–10 minutes where safe;
- WAITING_DEPENDENCY → expected-change-based cadence, normally slower rather than wasteful polling;
- DEGRADED → normally 5 or 3 minutes;
- RECOVERING → normally 3 or 2 minutes;
- CRITICAL_INCIDENT → 2 minutes where technically safe;
- PAUSED → business execution off while diagnostics/liveness continue.

### Founder / Victor Immediate Wake

An explicit Founder or authorized Victor command must not wait for the scheduled heartbeat.

It must use an immediate event-driven wake path, subject to authentication, authority, policy, and execution gates.

Event-driven wake does not bypass SOUL, authority, evidence, or safety rules.

### Heartbeat vs Business-Action Cadence

Heartbeat frequency and business-action frequency are separate.

Heartbeat = health + truth + control + recovery assessment.

Business action = separately authorized productive execution.

A 5-minute heartbeat does not mean an external action should happen every 5 minutes.

### Concurrency Guard

A faster heartbeat must never create unsafe overlapping execution.

Runtime must track enough state to prevent duplicate or competing execution, including where applicable:

- last_run_started;
- last_run_finished;
- current execution lock;
- expected task duration;
- current task identity;
- next_wake_at.

If a new heartbeat occurs while an exclusive task is still active, duplicate execution must be blocked.

### Staleness and Missed Heartbeats

Recommended default interpretation:

- one missed expected cycle → stale warning / observe;
- two consecutive missed cycles → DEGRADED;
- three consecutive missed cycles → incident / recovery path.

Departments may use stricter thresholds according to mission criticality, but stale evidence must never be silently treated as fresh.

### Transition-Driven Reporting

Heartbeat must persist evidence every run, while Founder-facing alerts should be transition-driven rather than spam-driven.

Examples:

HEALTHY → DEGRADED
DEGRADED → FAILED
FAILED → RECOVERING
RECOVERING → HEALTHY
SOUL_VALID → SOUL_INVALID
CAPABILITY_HEALTHY → CAPABILITY_FAILED
EXECUTION_ALLOWED → EXECUTION_BLOCKED

### Kill-Switch / Pause Semantics

When paused, intended defaults are:

- business execution: OFF;
- external side effects: OFF;
- diagnostics: ON;
- heartbeat/liveness: ON;
- state persistence: ON;
- Founder/Victor communication: ON;
- recovery checks: ON where safe.

### Self-Healing Integration

Heartbeat is also a failure-detection and recovery trigger.

Detect
→ classify
→ safe self-diagnosis
→ authorized local recovery where permitted
→ validate recovery
→ live-verify the relevant capability where required
→ persist incident/recovery evidence
→ back off cadence after verified stability.

If safe local recovery is not possible, escalate through Tony Stark / Victor / Founder according to severity and authority.

Fallback task success must not automatically mark the original failed capability as healed.

### Recovery Acceleration and Backoff

Heartbeat may accelerate toward 2 minutes during justified incident/recovery conditions.

After verified recovery, cadence should back off as stability is demonstrated, for example:

2 → 3 → 5 → 15 → 30 → 60 minutes.

Anti-flapping / hysteresis must prevent constant cadence oscillation from small score changes.

### Next-Wake Contract

Each wake should persist enough evidence to explain the next cadence, including where applicable:

- current_state;
- priority_score;
- selected_interval;
- selection_reason;
- next_task;
- expected_change;
- next_wake_at;
- current_incident;
- execution_lock state.

### 5.2 Hard Invariants

DEFAULT HEARTBEAT = 60 MINUTES.

MINIMUM HEARTBEAT = 2 MINUTES.

ONLY APPROVED CADENCE LADDER = 60 / 30 / 15 / 10 / 5 / 3 / 2 MINUTES.

PRIORITY MAY CHANGE LIVENESS FREQUENCY, BUT NEVER EXECUTION AUTHORITY.

FOUNDER / AUTHORIZED VICTOR DIRECT COMMAND = IMMEDIATE EVENT WAKE, NOT HEARTBEAT WAIT.

NO FRESH VERIFIED LIVENESS STATE = NO ASSUMPTION THAT AUTONOMOUS CAPABILITY IS LIVE.

HEARTBEAT MAY WAKE A DEPARTMENT, BUT ONLY VALID CONSTITUTIONAL, AUTHORITY, HEALTH, AND EVIDENCE STATE MAY AUTHORIZE EXECUTION.

HEARTBEAT MUST ACCELERATE ON JUSTIFIED RISK AND BACK OFF AFTER VERIFIED STABILITY.

---

## 5.3 — AI & Provider Binding — LOCKED

### Core Principle

A department uses AI as replaceable reasoning/intelligence. AI, a model, an API vendor, or a provider is not the department's identity, SOUL, objective, authority, persistent memory, or truth source.

Provider/model changes must not alter constitutional behavior.

### AI Role

AI may:

- interpret current evidence and context;
- reason about alternatives;
- propose or rank tasks;
- recommend capabilities;
- estimate expected outcomes and risk;
- produce structured plans within the allowed action vocabulary.

AI may not independently grant itself permission, expand authority, redefine the objective, alter SOUL, bypass validators, fabricate evidence, or convert technical capability into organizational authority.

The execution chain remains:

AI recommendation
→ deterministic policy
→ authority check
→ capability contract
→ executor
→ validators/evidence
→ persistent result.

### Constitutional AI Context

For autonomous departmental reasoning, the AI binding layer must provide the relevant constitutional and runtime context, including where applicable:

- department identity;
- locked objective/definition;
- SOUL / constitutional rules;
- persistent state / memory;
- current task identity;
- authority boundary;
- relevant policies;
- domain-truth/evidence state;
- runtime/health state;
- allowed capability/action vocabulary.

If required constitutional binding is unavailable or invalid, AI may remain usable for diagnostics where safe, but its output must not become autonomous execution authority.

### Structured Decision Boundary

Free-form AI prose must not be treated as direct executor instructions.

Autonomous execution plans must use a validated structured decision schema containing the required task/action/capability/risk/evidence context.

Planner vocabulary must match the executor's declared capability/action vocabulary.

Unsupported, unknown, or ambiguous operations must fail closed and be rejected/replanned. They must never be silently interpreted as a more powerful operation.

### AI Claims vs Runtime Truth

AI output is a claim/recommendation, not runtime evidence.

If AI claims that a credential, capability, external state, result, health state, or approval exists, deterministic/runtime evidence remains authoritative.

AI confidence can never override failed validators or contradictory verified evidence.

### Provider Chain

Each department may use a qualified provider chain:

PRIMARY
→ FALLBACK 1
→ FALLBACK 2
→ additional qualified fallbacks
→ NO-AI / DIAGNOSTIC MODE if no qualified provider is available.

Fallback selection must check at minimum:

- provider health;
- task/capability compatibility;
- authentication/credential availability;
- protocol/adapter compatibility;
- policy compatibility;
- response/structured-output compatibility where required;
- rate-limit/resource constraints;
- cost authority.

Available does not mean suitable. Healthy does not mean authorized.

### Provider-Agnostic Stable AI Slots

The backend must bind to stable generic AI slots rather than hardcoded provider-company secret names.

Canonical slot naming:

`AI_PROVIDER_1`
`AI_PROVIDER_2`
`AI_PROVIDER_3`
...
`AI_PROVIDER_N`

Corresponding secret references use stable names such as:

`AI_PROVIDER_1_SECRET`
`AI_PROVIDER_2_SECRET`
`AI_PROVIDER_3_SECRET`
...

The slot identity is stable. The provider company, model, role, protocol, endpoint metadata, and adapter binding are configuration.

Conceptual example:

`AI_PROVIDER_1` may currently map to Bedrock/Qwen as PRIMARY. Later the same stable slot may map to another qualified provider/model without requiring backend business logic to be rewritten around a new company-specific secret name.

### Provider Registry

Non-secret provider metadata must live in a canonical provider registry, separate from secret material.

A provider registry entry should contain where applicable:

- stable slot id;
- provider/vendor identifier;
- model identifier or model-selection policy;
- protocol family;
- non-secret endpoint/base URL metadata;
- adapter identifier;
- role such as PRIMARY/FALLBACK;
- enabled/disabled state;
- capability metadata;
- secret reference name;
- qualification status.

Credential material must remain in the appropriate secret store and must not be copied into the registry.

Provider identity/configuration = registry.

Credential material = secret store.

### Future/Unknown Provider Onboarding

Adding `AI_PROVIDER_X_SECRET` alone must never automatically make an unknown AI provider trusted or LIVE.

A newly discovered provider slot must move through an onboarding/qualification lifecycle such as:

DISCOVERED
→ CREDENTIAL_PRESENT
→ CONFIG_PARSED
→ ADAPTER_RESOLVED
→ CONNECTIVITY_VERIFIED
→ MODEL_DISCOVERED / CONFIGURED
→ CAPABILITY_TESTED
→ COST/POLICY_CHECKED
→ QUALIFIED
→ AVAILABLE.

Failure at any required stage results in ONBOARDING_BLOCKED or equivalent non-active state.

### Generic Protocol Auto-Configuration

If a future provider uses an already-supported protocol family, such as a supported OpenAI-compatible interface, the system may automatically bind it to an existing generic adapter using registry configuration and the stable slot credential.

This may allow new providers to be onboarded without backend code changes, subject to all qualification gates.

### New Protocol Handling

If a provider uses a genuinely unsupported protocol, automatic trust/activation is prohibited.

The system may detect that no adapter exists and raise an onboarding requirement. Tony Stark may inspect the non-secret provider specification and implement/adapt the integration within his authorized repair/development boundary.

The new adapter must then be tested and qualified before the provider becomes AVAILABLE.

Tony may not infer provider identity by inspecting secret values, expose credentials, bypass qualification, approve paid inference, or expand constitutional authority.

### Automatic Provider Switching

A provider switch may be automatic for an already-authorized task only when the fallback is qualified and the following remain unchanged:

- task identity;
- department identity;
- locked objective;
- SOUL;
- authority boundary;
- allowed capability set;
- evidence/validator requirements;
- cost policy.

A new AI call does not create a new task.

### AI/Provider Health Separation

The architecture must distinguish where applicable:

- department health;
- runtime health;
- AI-layer health;
- provider health;
- capability health;
- task health;
- business-outcome health.

A failed primary provider does not automatically mean the department is dead if its liveness, state, communication, diagnostics, and/or qualified fallback remain operational.

Likewise, a healthy AI provider does not prove that a department capability is enabled or that a business outcome is healthy.

### No-AI / Degraded Mode

If all qualified AI providers are unavailable, the department may remain alive in a degraded/diagnostic state.

Where constitutionally safe, it may continue:

- heartbeat/liveness;
- deterministic diagnostics;
- state persistence;
- evidence collection;
- Founder/Victor communication;
- incident escalation;
- explicitly pre-authorized deterministic operations.

Autonomous AI planning must remain blocked until a qualified provider becomes available.

### Provider Switching Audit & Flapping

Provider transitions must be auditable. Relevant records should include where applicable:

- task id;
- old provider/slot;
- new provider/slot;
- reason;
- failure/health evidence;
- timestamp;
- authority/cost state;
- result.

Repeated provider switching/flapping must be detectable and may trigger incident/problem-management review by Tony/Victor.

### Cost Authority

Provider availability does not grant spending authority.

No provider/model may cause paid inference or other paid AI usage unless the Founder has explicitly approved the relevant cost authority.

A technically working paid fallback must remain blocked when cost approval is absent.

### 5.3 Hard Invariants

AI IS REPLACEABLE INTELLIGENCE; IT IS NOT THE DEPARTMENT'S IDENTITY, SOUL, OBJECTIVE, AUTHORITY, MEMORY, OR TRUTH SOURCE.

PROVIDER CHANGE MUST NOT CHANGE CONSTITUTIONAL BEHAVIOR.

AI MAY PROPOSE; POLICY AND AUTHORITY DECIDE; EXECUTOR ACTS; EVIDENCE AND VALIDATORS PROVE.

AI CLAIMS ARE NOT RUNTIME EVIDENCE.

NO QUALIFIED PROVIDER = AUTONOMOUS AI PLANNING BLOCKED, NOT AUTOMATIC LOSS OF DEPARTMENT IDENTITY OR DIAGNOSTIC LIVENESS.

FALLBACK MUST PRESERVE TASK IDENTITY AND ALL ORIGINAL AUTHORITY/EVIDENCE CONSTRAINTS.

UNSUPPORTED AI ACTIONS MUST FAIL CLOSED AND BE REPLANNED, NEVER SILENTLY INTERPRETED INTO A MORE POWERFUL ACTION.

BACKEND MUST BIND TO STABLE `AI_PROVIDER_N` SLOTS, NOT PROVIDER-SPECIFIC COMPANY SECRET NAMES.

PROVIDER IDENTITY/CONFIGURATION BELONGS IN THE PROVIDER REGISTRY; CREDENTIAL MATERIAL BELONGS IN THE SECRET STORE.

NEW SECRET PRESENCE ≠ PROVIDER TRUST OR ACTIVATION. QUALIFICATION IS MANDATORY.

SUPPORTED-PROTOCOL PROVIDERS MAY AUTO-CONFIGURE; UNSUPPORTED PROTOCOLS REQUIRE A QUALIFIED ADAPTER BEFORE ACTIVATION.

NO PROVIDER OR MODEL MAY AUTHORIZE PAID INFERENCE WITHOUT FOUNDER APPROVAL.

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
- Point 5.4 onward: NOT YET LOCKED

---

# CANONICAL STORAGE RULE

Every newly locked architecture point or sub-point must be added to this file as the authoritative architecture record.

Implementation-specific files may contain detailed executable logic, schemas, code, state, or specialized policies, but this file remains the top-level Founder/Victor lock register describing what has been approved and what remains unlocked.
