# Point 5 — Department Activation & Live Qualification Standard

Status: ACTIVE — Points 5.1 and 5.2 LOCKED
Authority: Founder → Victor
Scope: All Victor system departments

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

### 1. Identity

Each department must have an explicit organizational identity stating why it exists, which function it owns, and which responsibility it is accountable for.

Identity is not a list of capabilities. Capabilities may change without changing the department's identity.

### 2. Locked Objective / Definition

Each department must have a Founder-approved or Founder-delegated objective/definition that provides measurable direction for autonomous decision-making.

Task selection must be objective-driven rather than activity-driven.

The governing question is:

Which permitted action, using current verified evidence, most effectively advances the locked objective?

Activity does not equal progress. Output does not equal outcome.

### 3. SOUL

SOUL is the department's constitutional operating kernel. It governs how intelligence is used; it is not the intelligence provider itself.

AI providers are replaceable. A provider change must never change the department's identity, objective, authority, truth standard, evidence requirements, or SOUL.

No model or provider may expand its own authority.

### 4. Authority Boundary

At creation time, each consequential action class must be assigned to one of these authority states:

- AUTO — department may execute autonomously within policy and evidence gates.
- VICTOR_AUTHORIZATION — department may prepare and recommend, but execution requires Victor authorization.
- FOUNDER_ONLY — only the Founder may authorize or perform the action.
- PROHIBITED — action is not permitted under current system policy.

Technical capability never implies organizational authority.

Founder remains the final authority.

### 5. Persistent State / Memory Contract

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
→ schedule the next safe wake

Heartbeat is a liveness mechanism, not an execution permission grant.

### Default, Minimum, and Approved Cadence Ladder

Default heartbeat interval: 60 minutes.

Minimum heartbeat interval: 2 minutes.

The runtime may dynamically choose only from the following approved cadence ladder:

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

AI may provide evidence/context for classification, but the final cadence selection must be policy-bounded and deterministic.

### Priority Score

Each pending task may be assigned a 0–100 priority score using the following bounded factors:

- Founder/Victor explicit priority: up to 25 points;
- locked-objective/business impact: up to 25 points;
- time urgency/deadline: up to 15 points;
- dependency criticality: up to 15 points;
- incident/health severity: up to 15 points;
- cost/rate-limit/concurrency penalty: subtract up to 15 points.

Conceptual formula:

Priority Score =
Founder/Victor Priority
+ Objective Impact
+ Urgency
+ Dependency Criticality
+ Incident Severity
− Resource / Rate-Limit / Concurrency Penalty

### Score-to-Cadence Mapping

0–20 → 60 minutes
21–35 → 30 minutes
36–50 → 15 minutes
51–65 → 10 minutes
66–80 → 5 minutes
81–90 → 3 minutes
91–100 → 2 minutes

Priority determines how soon the system should re-check its state. Priority does not grant execution authority.

### Runtime-State Overrides

The following runtime states may override the normal score mapping while remaining inside the approved cadence ladder:

- IDLE → normally 60 minutes;
- PENDING → score-based cadence;
- EXECUTING → active supervision, normally 5–10 minutes where safe;
- WAITING_DEPENDENCY → cadence based on realistic expected change time, normally slower rather than wasteful polling;
- DEGRADED → normally 5 or 3 minutes;
- RECOVERING → normally 3 or 2 minutes;
- CRITICAL_INCIDENT → 2 minutes where technically safe;
- PAUSED → business execution remains off while diagnostics/liveness continue at an appropriate cadence.

### Founder / Victor Immediate Wake

An explicit Founder or authorized Victor command must not wait for the scheduled heartbeat.

It must use an immediate event-driven wake path, subject to authentication, authority, policy, and execution gates.

Event-driven wake does not bypass SOUL, authority, evidence, or safety rules.

### Heartbeat vs Business-Action Cadence

Heartbeat frequency and business-action frequency are separate concepts.

A 5-minute heartbeat does not imply that an external post, message, publication, transaction, generation task, or other business side effect should occur every 5 minutes.

Heartbeat = health + truth + control + recovery assessment.

Business action = separately authorized productive execution.

### Concurrency Guard

A faster heartbeat must never create unsafe overlapping execution.

Runtime must track sufficient state to prevent duplicate or competing execution, including at minimum where applicable:

- last_run_started;
- last_run_finished;
- current execution lock;
- expected task duration;
- current task identity;
- next_wake_at.

If a new heartbeat occurs while an exclusive task is still active, duplicate execution must be blocked. Safe observation/health checking may continue where the implementation supports it.

### Staleness and Missed Heartbeats

Each department must define a staleness policy relative to its selected heartbeat interval.

A recommended default interpretation is:

- one missed expected cycle → observe / mark stale-warning;
- two consecutive missed cycles → DEGRADED;
- three consecutive missed cycles → incident / recovery path.

Departments may use stricter thresholds when mission criticality requires it, but may not silently treat stale evidence as fresh.

### Transition-Driven Reporting

Heartbeat must persist evidence every run, but Founder-facing alerts should be transition-driven rather than spam-driven.

Meaningful transitions include:

HEALTHY → DEGRADED
DEGRADED → FAILED
FAILED → RECOVERING
RECOVERING → HEALTHY
SOUL_VALID → SOUL_INVALID
CAPABILITY_HEALTHY → CAPABILITY_FAILED
EXECUTION_ALLOWED → EXECUTION_BLOCKED

Repeated healthy runs need not repeatedly alert the Founder.

### Kill-Switch / Pause Semantics

A kill switch or pause must stop unauthorized business/external execution without unnecessarily destroying the department's ability to diagnose and report itself.

When paused, the intended default is:

- business execution: OFF;
- external side effects: OFF;
- diagnostics: ON;
- heartbeat/liveness: ON;
- state persistence: ON;
- Founder/Victor communication: ON;
- recovery checks: ON where safe.

### Self-Healing Integration

Heartbeat is also a failure-detection and recovery trigger.

On detected failure:

detect
→ classify
→ perform safe self-diagnosis
→ attempt authorized local recovery if allowed
→ validate recovery
→ live-verify relevant capability where required
→ persist incident/recovery evidence
→ back off cadence after verified stability

If safe local recovery is not possible, the incident must escalate through the defined repair chain, including Tony Stark / Victor / Founder according to authority and severity.

Fallback task success must not automatically mark the failed original capability as healed.

### Recovery Acceleration and Backoff

Heartbeat may accelerate toward 2 minutes when justified by a real incident or active recovery.

After recovery, cadence must automatically back off as stability is demonstrated, for example:

2 → 3 → 5 → 15 → 30 → 60 minutes.

The controller should use hysteresis/anti-flapping logic so small score changes do not cause constant cadence oscillation.

Urgent escalation may immediately accelerate cadence; slowing cadence should normally require multiple stable/healthy cycles.

### Next-Wake Contract

At the end of each heartbeat/wake cycle, the department should persist enough evidence to explain why its next cadence was chosen, including where applicable:

- current_state;
- priority_score;
- selected_interval;
- selection_reason;
- next_task;
- expected_change;
- next_wake_at;
- current_incident;
- execution_lock state.

This record must be understandable by Victor and by Tony during diagnosis/recovery.

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

Locked by Founder direction for Victor architecture.

Future Point 5 subsections will define AI/provider binding, capability qualification, domain-truth/evidence, guarded execution, external-action gates, audit/memory, self-healing/recovery details, and final live/E2E qualification. These are not yet locked by this file except where explicitly stated above.
