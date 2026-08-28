export const PRECEDENCE_VERSION = 'DOMAIN_PRECEDENCE_V6';

export const RESOLVED_RUNTIME_RULES = Object.freeze({
  architecture_runtime_standard:
    'For architecture/runtime behavior, the canonical Architecture Lock Index controls over stale legacy descriptions in lower-level implementation/context documents. Conflicts are surfaced, never silently blended.',
  authority_governance:
    'Latest active explicit Founder decisions plus constitutional hard gates remain supreme for approvals, security, secrets, cost, destructive actions and authority boundaries.',
  operational_truth:
    'Fresh verified runtime evidence controls observed live facts. Active Founder decisions and reconciled canonical state control intended/current governed state. Historical plans never override a newer active Founder decision.',
  heartbeat:
    'Current locked standard: default 60 minutes, minimum 2 minutes, only ladder 60→30→15→10→5→3→2. Founder/authorized Victor command is immediate event wake but does not bypass gates.',
  department_connectivity:
    'Repository presence, registry presence or historical status does not prove fresh Victor↔department connectivity, capability LIVE state or communication certification.',
  telegram_role:
    'Telegram is Founder/management communication transport, not the internal department bus and not Victor identity itself.',
  execution_scope:
    'The Telegram Worker cannot claim a consequential department/external action executed unless a separately hosted governed executor path actually ran and evidence verified it.',
  founder_entity_resolution:
    'Bare AURA resolves to AURA3; AURA2 is selected only when Founder explicitly says AURA2 or AURA 2.',
  memory_truth_split:
    'Memory is decision/history evidence. Canonical state is current operational truth. A permanent Founder decision must influence effective current state even when an older business-plan document still contains stale wording.',
  executive_reply_style:
    'Founder replies are BRIEF by default: answer first, 1-3 short sentences, no status dump, no examples or follow-up prompt. DETAIL mode is allowed only when Founder explicitly asks for detail/full explanation.',
});

const ACTION_WORDS = [
  'pause', 'resume', 'publish', 'send', 'delete', 'remove', 'create', 'change', 'update', 'deploy',
  'execute', 'run', 'assign', 'approve', 'reject', 'stop', 'start', 'buy', 'pay', 'spend', 'transfer',
];

const SYSTEM_WORDS = [
  'status', 'live', 'healthy', 'connected', 'connection', 'department', 'rio', 'aura', 'aura2', 'vision',
  'oracle', 'bubblebee', 'hulk', 'batman', 'tony', 'pa victor', 'system', 'runtime', 'heartbeat', 'objective',
  'authority', 'rules', 'rule', 'soul', 'state', 'evidence', 'certification', 'memory', 'credential', 'vault',
];

const DETAIL_PATTERNS = [
  /\b(detail|details|detailed|deep|full|complete|comprehensive|explain|explanation|breakdown)\b/i,
  /\b(vistar|vistaar|detail\s+me|details\s+me|puri\s+detail|poori\s+detail|samjhao\s+detail)\b/i,
];

export function isDetailRequest(text) {
  const value = String(text || '').trim();
  return Boolean(value) && DETAIL_PATTERNS.some(rx => rx.test(value));
}

export function classifyFounderMessage(text) {
  const normalized = String(text || '').toLowerCase().trim();
  if (!normalized) return 'EMPTY';
  let base = 'GENERAL_CONVERSATION';
  if (ACTION_WORDS.some(word => normalized.includes(word))) base = 'ACTION_REQUEST';
  else if (SYSTEM_WORDS.some(word => normalized.includes(word))) base = 'SYSTEM_QUERY';
  else if (/\b(who are you|tum kaun ho|kaun ho|who is victor|victor kaun)\b/.test(normalized)) base = 'IDENTITY_QUERY';
  return isDetailRequest(text) ? `${base}_DETAIL` : base;
}

export function parseJsonSource(sourceRecord) {
  if (!sourceRecord?.ok || typeof sourceRecord.text !== 'string') return null;
  try { return JSON.parse(sourceRecord.text); } catch { return null; }
}

export function parseDecisionSource(sourceRecord) {
  if (!sourceRecord?.ok || typeof sourceRecord.text !== 'string') return [];
  const out = [];
  for (const line of sourceRecord.text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const decision = JSON.parse(line);
      if (String(decision?.status || 'active').toLowerCase() === 'active') out.push(decision);
    } catch (_) {}
  }
  return out;
}

function decisionText(decision) {
  return String(decision?.summary || decision?.text || '').toLowerCase();
}

function effectiveDecisionFlags(decisions = []) {
  const text = decisions.map(decisionText).join('\n');
  return {
    aura2_hold: /aura\s*2.{0,80}\bhold\b|\bhold\b.{0,80}aura\s*2/i.test(text),
    bare_aura_aura3: /bare aura.{0,80}aura3|aura without a version.{0,80}aura3/i.test(text),
    rio_parked: /rio.{0,80}\bparked\b|\bparked\b.{0,80}rio/i.test(text),
    strict_supervision: /strict.{0,80}supervision|supervise every department in strict mode/i.test(text),
    victor_credential_authority: /victor.{0,100}authority.{0,100}credential|credential use authority/i.test(text),
    hulk_business_rnd: /hulk.{0,120}(business r&d|opportunity-discovery|online business)/i.test(text),
  };
}

function decisionMatchesDepartment(decision, departmentId) {
  if (!departmentId) return false;
  const text = decisionText(decision);
  const aliases = {
    aura2: ['aura2', 'aura 2'],
    aura3: ['aura3', 'aura 3', 'bare aura'],
    rio: ['rio'],
    hulk: ['hulk'],
    vision: ['vision'],
    tony_stark: ['tony', 'tony stark'],
    oracle: ['oracle'],
    bubblebee: ['bubblebee'],
    pa_victor: ['pa victor'],
    batman_bruce: ['batman', 'bruce'],
  };
  return (aliases[departmentId] || [departmentId]).some(alias => text.includes(alias));
}

export function buildTruthSnapshot(sourceRecords = [], requestFacts = {}) {
  const byName = Object.fromEntries(sourceRecords.map(record => [record.name, record]));
  const systemState = parseJsonSource(byName.SYSTEM_STATE) || {};
  const registry = parseJsonSource(byName.DEPARTMENT_REGISTRY) || {};
  const aiRuntime = parseJsonSource(byName.AI_RUNTIME_STATUS) || {};
  const telegramRuntime = parseJsonSource(byName.TELEGRAM_RUNTIME_STATUS) || {};
  const activeFounderDecisions = parseDecisionSource(byName.DECISIONS);
  const flags = effectiveDecisionFlags(activeFounderDecisions);

  const departments = Array.isArray(registry.departments)
    ? registry.departments.map(dept => {
        const item = {
          id: dept.id,
          name: dept.name,
          registry_status: dept.status || 'UNKNOWN',
          enabled: dept.enabled ?? null,
          victor_connection: dept.victor_connection || 'NOT_VERIFIED',
          live_certification: dept.live_certification || 'NOT_VERIFIED',
          business_execution: dept.business_execution || 'UNKNOWN',
        };
        if (item.id === 'aura2' && flags.aura2_hold) {
          item.registry_status = 'HOLD';
          item.enabled = false;
          item.effective_state_source = 'ACTIVE_FOUNDER_DECISION';
        }
        if (item.id === 'rio' && flags.rio_parked) {
          item.registry_status = 'PARKED';
          item.business_execution = 'BLOCKED_PENDING_FOUNDER_ACTIVATION';
          item.effective_state_source = 'ACTIVE_FOUNDER_DECISION';
        }
        return item;
      })
    : [];

  const conflicts = Array.isArray(systemState.conflicts) ? systemState.conflicts : [];
  const resolvedDepartmentId = requestFacts.resolvedDepartmentId || null;
  const resolvedDepartment = resolvedDepartmentId ? departments.find(d => d.id === resolvedDepartmentId) || null : null;
  const resolvedDepartmentDecisions = resolvedDepartmentId
    ? activeFounderDecisions.filter(decision => decisionMatchesDepartment(decision, resolvedDepartmentId))
    : [];

  return {
    generated_at_utc: new Date().toISOString(),
    request_facts: {
      telegram_webhook_authenticated: Boolean(requestFacts.telegramWebhookAuthenticated),
      telegram_message_received_now: Boolean(requestFacts.telegramMessageReceivedNow),
      consequential_executor_available: Boolean(requestFacts.consequentialExecutorAvailable),
      diagnostic_department_bridge_available: Boolean(requestFacts.diagnosticDepartmentBridgeAvailable),
      resolved_department_id: resolvedDepartmentId,
      resolved_department_name: requestFacts.resolvedDepartmentName || null,
      founder_entity_resolution_reason: requestFacts.entityResolutionReason || null,
    },
    canonical_state: {
      available: Boolean(byName.SYSTEM_STATE?.ok),
      overall_state: systemState.overall_state || 'UNKNOWN',
      decision_rule: systemState.decision_rule || null,
      conflict_count: conflicts.length,
      conflicts,
    },
    active_founder_decisions: activeFounderDecisions,
    resolved_department_decisions: resolvedDepartmentDecisions,
    effective_decision_flags: flags,
    victor: {
      ai_ready_claim: systemState?.victor?.ai_ready ?? null,
      provider_claim: systemState?.victor?.provider || aiRuntime?.provider || null,
      model_claim: systemState?.victor?.model || aiRuntime?.model || null,
    },
    telegram: {
      canonical_configured_claim: systemState?.communications?.telegram?.configured ?? null,
      runtime_state_claim: telegramRuntime?.state || systemState?.communications?.telegram?.state || 'UNKNOWN',
      runtime_checked_at_utc: telegramRuntime?.checked_at_utc || null,
      current_request_authenticated: Boolean(requestFacts.telegramWebhookAuthenticated),
    },
    resolved_department: resolvedDepartment,
    departments,
    rules: {
      department_connectivity_default: 'NOT_VERIFIED',
      live_default: 'NOT_VERIFIED',
      task_success_default: 'UNKNOWN',
      business_outcome_default: 'UNKNOWN',
      current_operational_claim_requires_fresh_evidence: true,
      historical_plan_cannot_override_active_founder_decision: true,
      bare_aura_means: 'aura3',
      aura2_requires_explicit_version: true,
    },
  };
}

export function buildPrecedenceDirective() {
  return `
DETERMINISTIC PRECEDENCE — ${PRECEDENCE_VERSION}
Resolve conflicts by domain, never by prose similarity:

A) LATEST EXPLICIT FOUNDER DECISIONS
- Active Founder decisions govern current policy, naming, hold/park/approval state and executive direction.
- Historical BUSINESS_PLAN or old source text cannot override a newer active Founder decision.

B) FRESH RUNTIME EVIDENCE
- Fresh verified evidence governs observed live/connected/executed/business-outcome claims.
- Capability/path availability and fresh verification are separate states.

C) CANONICAL CURRENT STATE / REGISTRY
- Use reconciled SYSTEM_STATE and current registry after applying active Founder decisions.

D) ARCHITECTURE / RUNTIME STANDARD
- ARCHITECTURE_LOCK controls architecture behavior.

E) IDENTITY / CONSTITUTIONAL HARD GATES
- SOUL + MASTER_RULE_BOOK + EXECUTIVE_CHARTER define Victor identity and hard authority boundaries.

F) HISTORICAL BUSINESS/PLAN DOCUMENTS
- Use for strategy/history only. Never let stale current-state wording override A-E.

G) UNRESOLVED SAME-RANK CONFLICT
- State CONFLICTED/UNKNOWN; never silently blend.

RESOLVED CURRENT RULES:
${Object.entries(RESOLVED_RUNTIME_RULES).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`;
}

function isDetailIntent(intent) {
  return String(intent || '').endsWith('_DETAIL');
}

function buildExecutiveReplyDirective(intent, truthSnapshot) {
  const target = truthSnapshot?.resolved_department?.name || truthSnapshot?.request_facts?.resolved_department_name || null;
  const detail = isDetailIntent(intent);
  return `
EXECUTIVE REPLY LAYER
- Speak naturally to Founder in concise Hinglish. Sound like an executive assistant, not a status-report template.
- Answer the exact question in the first sentence.
- RESPONSE MODE: ${detail ? 'DETAIL' : 'BRIEF'}.
${detail ? `- Founder explicitly requested detail. Give a structured explanation, but stay relevant and avoid repetition.` : `- Hard default: 1-3 short sentences, normally under 60 words.
- No bullets, headings, status snapshots, department lists, examples, "Next:" section, or follow-up question/offer unless the Founder explicitly asked for them.
- Do not volunteer model names, loaded rule books, conflicts, other departments, process background, or examples unless they directly answer the question.
- If one sentence answers the question, stop there.`}
- Distinguish mandate/planned state from actual execution and fresh verified evidence when that distinction changes the answer.
- If a task/result is not present in current evidence, say that briefly instead of filling the gap with the mandate.
- Never manufacture a latest task, result, error, revenue, timestamp, or evidence reference.
${target ? `- Current resolved target is ${target}; keep the reply focused on this target.` : ''}
- Intent for this message: ${intent}.
`;
}

export function buildTruthContract(intent, truthSnapshot) {
  return `
TRUTH CONTRACT FOR THIS MESSAGE
Intent: ${intent}

Hard response rules:
- Never call Victor the "single source of truth".
- Never say all departments are connected/live/healthy/certified unless explicitly verified.
- Never convert historical evidence into a current-live claim.
- Latest active Founder decisions override stale BUSINESS_PLAN/current-state prose.
- If current truth is unavailable, use UNKNOWN / NOT VERIFIED / LAST KNOWN rather than guessing.
- Do not equate NOT_VERIFIED with technical impossibility; distinguish configured capability/path from fresh verification.
- If request_facts.resolved_department_id is present, answer for that department only unless Founder explicitly asks for comparison.
- If resolved_department_id is aura3 because Founder said bare AURA, do not discuss AURA2.

${buildExecutiveReplyDirective(intent, truthSnapshot)}

Machine truth snapshot:
${JSON.stringify(truthSnapshot)}
`;
}

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function nonEmptyLines(text) {
  return String(text || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
}

export function validateVictorReply(reply, intent, truthSnapshot = {}) {
  const text = String(reply || '');
  const lower = text.toLowerCase();
  const violations = [];

  if (lower.includes('single source of truth')) violations.push('VICTOR_SELF_TRUTH_SOURCE_CLAIM');
  if (/\b5[- ]?minute heartbeat\b|\bheartbeat.{0,18}5[- ]?minute\b/i.test(text)) violations.push('STALE_FIXED_5_MIN_HEARTBEAT');

  if (!isDetailIntent(intent)) {
    const lines = nonEmptyLines(text);
    if (wordCount(text) > 70) violations.push('BRIEF_MODE_TOO_LONG');
    if (lines.length > 3) violations.push('BRIEF_MODE_TOO_MANY_LINES');
    if (/^\s*[-•*]\s+/m.test(text)) violations.push('BRIEF_MODE_BULLETS');
    if (/^\s*(brief|summary|current state|active status|department snapshot|next)\s*:/im.test(text)) violations.push('BRIEF_MODE_TEMPLATE_SECTION');
    if (/\b(detail chahiye|bolo.*detail|kya pata chahiye|kis department|jaise:|want more|need more)\b/i.test(text)) violations.push('BRIEF_MODE_UNSOLICITED_FOLLOWUP');
  }

  const deptConnectivityVerified = Array.isArray(truthSnapshot.departments)
    && truthSnapshot.departments.length > 0
    && truthSnapshot.departments.every(d => d.victor_connection === 'VERIFIED');
  if (!deptConnectivityVerified && /(all|har)\s+(departments?|department).{0,45}\b(connected|live|healthy|supervis)/i.test(text)) {
    violations.push('UNVERIFIED_ALL_DEPARTMENT_CONNECTIVITY');
  }

  if (String(intent || '').startsWith('ACTION_REQUEST') && !truthSnapshot?.request_facts?.consequential_executor_available
      && /\b(done|completed|executed|deployed|published|sent|deleted|paused|resumed|updated successfully|successfully updated)\b/i.test(text)) {
    violations.push('UNVERIFIED_EXECUTION_CLAIM');
  }

  const currentStateClaim = text.match(/\b(rio|aura2?|aura 3|vision|oracle|bubblebee|hulk|batman|tony|pa victor)\b.{0,30}\b(?:is|hai|are)\s+(live|connected|healthy|certified)\b/i);
  if (currentStateClaim) {
    const alias = currentStateClaim[1].toLowerCase().replace(/\s+/g, '');
    const claimedState = currentStateClaim[2].toLowerCase();
    const id = alias === 'aura' || alias === 'aura3' ? 'aura3'
      : alias === 'aura2' ? 'aura2'
      : alias === 'tony' ? 'tony_stark'
      : alias === 'batman' ? 'batman_bruce'
      : alias === 'pavictor' ? 'pa_victor'
      : alias;
    const department = Array.isArray(truthSnapshot.departments)
      ? truthSnapshot.departments.find(item => item.id === id)
      : null;
    const connectionVerified = ['VERIFIED', 'CONNECTED_VERIFIED'].includes(String(department?.victor_connection || '').toUpperCase());
    const liveVerified = ['VERIFIED', 'RUNTIME_VERIFIED'].includes(String(department?.live_certification || '').toUpperCase())
      || String(department?.registry_status || '').toUpperCase() === 'LIVE_CERTIFIED';
    const claimVerified = claimedState === 'connected' ? connectionVerified
      : ['live', 'certified'].includes(claimedState) ? liveVerified
      : false;
    if (!claimVerified) violations.push('DEPARTMENT_CURRENT_STATE_WITHOUT_VERIFIED_EVIDENCE');
  }

  if (truthSnapshot?.request_facts?.resolved_department_id === 'aura3' && /\baura\s*2\b/i.test(text)) {
    violations.push('WRONG_AURA_ALIAS_TARGET');
  }

  if (truthSnapshot?.effective_decision_flags?.aura2_hold
      && /aura\s*2.{0,45}\b(active|live|running|primary|production)\b/i.test(text)) {
    violations.push('AURA2_HOLD_VIOLATION');
  }

  if (truthSnapshot?.effective_decision_flags?.rio_parked
      && /\brio\b.{0,45}\b(active|live|running|production)\b/i.test(text)) {
    violations.push('RIO_PARKED_VIOLATION');
  }

  return { ok: violations.length === 0, violations };
}

export function buildCorrectionPrompt(violations, intent, truthSnapshot) {
  const mode = isDetailIntent(intent) ? 'DETAIL' : 'BRIEF';
  return `
Your previous draft violated Victor's deterministic truth/response contract.
Violations: ${violations.join(', ')}
Intent: ${intent}
Response mode: ${mode}
Rewrite from scratch using only supported claims. Latest active Founder decisions override stale business-plan text. Distinguish capability/path availability from fresh verification.${mode === 'BRIEF' ? ' HARD LIMIT: 1-3 short sentences, no bullets/headings/examples/follow-up question, normally under 60 words.' : ' Founder explicitly requested detail; structured explanation is allowed.'}
Truth snapshot:
${JSON.stringify(truthSnapshot)}
`;
}
