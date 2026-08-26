export const PRECEDENCE_VERSION = 'DOMAIN_PRECEDENCE_V3';

export const RESOLVED_RUNTIME_RULES = Object.freeze({
  architecture_runtime_standard:
    'For architecture/runtime behavior, the canonical Architecture Lock Index controls over stale legacy descriptions in lower-level implementation/context documents. Conflicts are surfaced, never silently blended.',
  authority_governance:
    'Founder-locked authority plus constitutional hard gates in the Master Rule Book/Soul remain supreme for approvals, security, secrets, cost, destructive actions and authority boundaries.',
  operational_truth:
    'Fresh verified runtime evidence and reconciled canonical system state control current operational claims. Victor coordinates, reconciles and verifies truth; Victor self-report is not proof.',
  heartbeat:
    'Current locked standard: default 60 minutes, minimum 2 minutes, only ladder 60→30→15→10→5→3→2. Founder/authorized Victor command is immediate event wake but does not bypass gates. Any old fixed 5-minute heartbeat wording is legacy/stale for the current architecture standard.',
  department_connectivity:
    'Repository presence, registry presence or historical status does not prove current Victor↔department connectivity, capability LIVE state or communication certification.',
  telegram_role:
    'Telegram is Founder/management communication transport, not the internal department bus and not Victor identity itself.',
  execution_scope:
    'The Telegram Worker is conversation/read/decision only. It cannot claim a consequential department/external action executed unless a separately hosted governed executor path actually ran and evidence verified it.',
  founder_entity_resolution:
    'Founder-locked entity aliases are deterministic. Bare AURA resolves to AURA3; AURA2 is selected only when Founder explicitly says AURA2 or AURA 2.',
});

const ACTION_WORDS = [
  'pause', 'resume', 'publish', 'send', 'delete', 'remove', 'create', 'change', 'update', 'deploy',
  'execute', 'run', 'assign', 'approve', 'reject', 'stop', 'start', 'buy', 'pay', 'spend', 'transfer',
];

const SYSTEM_WORDS = [
  'status', 'live', 'healthy', 'connected', 'connection', 'department', 'rio', 'aura', 'aura2', 'vision',
  'oracle', 'bubblebee', 'hulk', 'batman', 'tony', 'pa victor', 'system', 'runtime', 'heartbeat', 'objective',
  'authority', 'rules', 'rule', 'soul', 'state', 'evidence', 'certification',
];

export function classifyFounderMessage(text) {
  const normalized = String(text || '').toLowerCase().trim();
  if (!normalized) return 'EMPTY';
  if (ACTION_WORDS.some(word => normalized.includes(word))) return 'ACTION_REQUEST';
  if (SYSTEM_WORDS.some(word => normalized.includes(word))) return 'SYSTEM_QUERY';
  if (/\b(who are you|tum kaun ho|kaun ho|who is victor|victor kaun)\b/.test(normalized)) return 'IDENTITY_QUERY';
  return 'GENERAL_CONVERSATION';
}

export function parseJsonSource(sourceRecord) {
  if (!sourceRecord?.ok || typeof sourceRecord.text !== 'string') return null;
  try { return JSON.parse(sourceRecord.text); } catch { return null; }
}

export function buildTruthSnapshot(sourceRecords = [], requestFacts = {}) {
  const byName = Object.fromEntries(sourceRecords.map(record => [record.name, record]));
  const systemState = parseJsonSource(byName.SYSTEM_STATE) || {};
  const registry = parseJsonSource(byName.DEPARTMENT_REGISTRY) || {};
  const aiRuntime = parseJsonSource(byName.AI_RUNTIME_STATUS) || {};
  const telegramRuntime = parseJsonSource(byName.TELEGRAM_RUNTIME_STATUS) || {};

  const departments = Array.isArray(registry.departments)
    ? registry.departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        registry_status: dept.status || 'UNKNOWN',
        enabled: dept.enabled ?? null,
        victor_connection: 'NOT_VERIFIED',
        live_certification: dept.live_certification || 'NOT_VERIFIED',
        business_execution: dept.business_execution || 'UNKNOWN',
      }))
    : [];

  const conflicts = Array.isArray(systemState.conflicts) ? systemState.conflicts : [];
  const resolvedDepartmentId = requestFacts.resolvedDepartmentId || null;
  const resolvedDepartment = resolvedDepartmentId ? departments.find(d => d.id === resolvedDepartmentId) || null : null;

  return {
    generated_at_utc: new Date().toISOString(),
    request_facts: {
      telegram_webhook_authenticated: Boolean(requestFacts.telegramWebhookAuthenticated),
      telegram_message_received_now: Boolean(requestFacts.telegramMessageReceivedNow),
      consequential_executor_available: false,
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
      bare_aura_means: 'aura3',
      aura2_requires_explicit_version: true,
    },
  };
}

export function buildPrecedenceDirective() {
  return `
DETERMINISTIC PRECEDENCE — ${PRECEDENCE_VERSION}
Do not choose between conflicting documents by prose similarity or model confidence. Resolve by domain:

A) AUTHORITY / APPROVAL / SECURITY / SECRETS / COST / DESTRUCTIVE ACTIONS
- Founder-locked authority and constitutional hard gates in MASTER_RULE_BOOK + SOUL control.
- Never infer approval from technical capability or historical behavior.

B) ARCHITECTURE / RUNTIME STANDARD / SYSTEM DESIGN
- ARCHITECTURE_LOCK is the canonical architecture record.

C) CURRENT OPERATIONAL FACTS
- Fresh externally verifiable evidence first, then reconciled SYSTEM_STATE/current runtime status.
- Declarative docs, registry presence, code presence, or Victor's own prior statement do not prove current LIVE/connected/completed state.

D) IDENTITY / ROLE
- SOUL + MASTER_RULE_BOOK + EXECUTIVE_CHARTER define Victor identity and constitutional role, subject to Founder locks.

E) BUSINESS DIRECTION / FOUNDER NAMING
- Founder-locked business vision/objectives and naming rules control.
- Bare AURA means AURA3. Do not mention or answer for AURA2 unless the Founder explicitly says AURA2/AURA 2 or comparison context requires both.

F) SAME-RANK OR UNRESOLVED CONFLICT
- Do not silently blend. State CONFLICTED/UNKNOWN and identify the conflict or ask for Founder resolution if consequential.

RESOLVED CURRENT RULES:
${Object.entries(RESOLVED_RUNTIME_RULES).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
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
- If current truth is unavailable, use UNKNOWN / NOT VERIFIED / LAST KNOWN rather than guessing.
- Consequential executor availability in this Telegram Worker is FALSE. Never claim an external/department side effect executed from this path.
- If request_facts.resolved_department_id is present, answer for that department only unless Founder explicitly asks for comparison.
- If resolved_department_id is aura3 because Founder said bare AURA, do not discuss AURA2.

Machine truth snapshot:
${JSON.stringify(truthSnapshot)}
`;
}

export function validateVictorReply(reply, intent, truthSnapshot = {}) {
  const text = String(reply || '');
  const lower = text.toLowerCase();
  const violations = [];

  if (lower.includes('single source of truth')) violations.push('VICTOR_SELF_TRUTH_SOURCE_CLAIM');
  if (/\b5[- ]?minute heartbeat\b|\bheartbeat.{0,18}5[- ]?minute\b/i.test(text)) violations.push('STALE_FIXED_5_MIN_HEARTBEAT');

  const deptConnectivityVerified = Array.isArray(truthSnapshot.departments)
    && truthSnapshot.departments.length > 0
    && truthSnapshot.departments.every(d => d.victor_connection === 'VERIFIED');
  if (!deptConnectivityVerified && /(all|har)\s+(departments?|department).{0,45}\b(connected|live|healthy|supervis)/i.test(text)) {
    violations.push('UNVERIFIED_ALL_DEPARTMENT_CONNECTIVITY');
  }

  if (intent === 'ACTION_REQUEST' && /\b(done|completed|executed|deployed|published|sent|deleted|paused|resumed|updated successfully|successfully updated)\b/i.test(text)) {
    violations.push('UNVERIFIED_EXECUTION_CLAIM');
  }

  if (/\b(rio|aura2?|aura 3|vision|oracle|bubblebee|hulk|batman|tony|pa victor)\b.{0,30}\b(is|hai|are)\s+(live|connected|healthy|certified)\b/i.test(text)) {
    violations.push('DEPARTMENT_CURRENT_STATE_WITHOUT_VERIFIED_EVIDENCE');
  }

  if (truthSnapshot?.request_facts?.resolved_department_id === 'aura3' && /\baura\s*2\b/i.test(text)) {
    violations.push('WRONG_AURA_ALIAS_TARGET');
  }

  return { ok: violations.length === 0, violations };
}

export function buildCorrectionPrompt(violations, intent, truthSnapshot) {
  return `
Your previous draft violated Victor's deterministic truth contract.
Violations: ${violations.join(', ')}
Intent: ${intent}
Rewrite from scratch using only supported claims. If resolved_department_id is present, answer only for that resolved department. Bare AURA resolves to AURA3 and must not produce an AURA2 answer.
Truth snapshot:
${JSON.stringify(truthSnapshot)}
`;
}
