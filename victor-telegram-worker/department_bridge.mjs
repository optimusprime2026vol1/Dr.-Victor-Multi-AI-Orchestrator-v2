const GITHUB_API = 'https://api.github.com';
const AURA3_REPO = 'vickykenin-lang/aura-3.0';
const AURA3_WORKFLOW = 'victor-aura3-transport.yml';
const AURA3_RAW = 'https://raw.githubusercontent.com/vickykenin-lang/aura-3.0/main';

export function aura3BridgeConfigured(env) {
  return Boolean(env.GITHUB_ORCHESTRATION_TOKEN);
}

export function selectAura3TaskType(text) {
  const value = String(text || '').toLowerCase();
  if (/certif|bridge|connect|communication|strict|supervision/.test(value)) return 'STRICT_SUPERVISION_PROBE';
  if (/govern|authority|soul|rule/.test(value)) return 'GOVERNANCE_CHECK';
  if (/capabilit|kya kar sak|features|scope/.test(value)) return 'CAPABILITY_CATALOG';
  return 'STATUS_CHECK';
}

export function shouldContactAura3(text, entity) {
  if (entity?.entity_id !== 'aura3') return false;
  const value = String(text || '').toLowerCase();
  return /status|report|error|problem|issue|check|pucho|pooch|baat|connect|bridge|communication|certif|supervision|progress|objective/.test(value);
}

export async function dispatchAura3Task(env, text, metadata = {}) {
  if (!aura3BridgeConfigured(env)) {
    return { status: 'PENDING_CONFIGURATION', reason: 'GITHUB_ORCHESTRATION_TOKEN_NOT_CONFIGURED' };
  }

  const taskType = selectAura3TaskType(text);
  const taskId = `victor-aura3-${Date.now()}-${metadata.messageId || 'msg'}`;
  const response = await fetch(`${GITHUB_API}/repos/${AURA3_REPO}/actions/workflows/${AURA3_WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: githubHeaders(env),
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        task_id: taskId,
        task_type: taskType,
        payload: JSON.stringify({
          founder_message: String(text || '').slice(0, 1000),
          requested_by: 'victor',
          supervision_mode: 'STRICT',
        }),
      },
    }),
  });

  if (response.status !== 204) {
    const detail = await safeText(response);
    throw new Error(`AURA3 dispatch HTTP ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`);
  }

  return { status: 'DISPATCHED', taskId, taskType };
}

export async function waitForAura3Result(taskId, options = {}) {
  const attempts = options.attempts || 18;
  const delayMs = options.delayMs || 4000;
  const safeTaskId = String(taskId).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
  const url = `${AURA3_RAW}/integration/results/tasks/${encodeURIComponent(safeTaskId)}.json`;

  for (let i = 0; i < attempts; i += 1) {
    if (i > 0) await sleep(delayMs);
    const response = await fetch(`${url}?t=${Date.now()}`, {
      headers: { 'User-Agent': 'Dr-Victor-AURA3-Bridge/1.0', 'Cache-Control': 'no-cache' },
    });
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`AURA3 result HTTP ${response.status}`);
    const result = await response.json();
    if (result?.task_id !== taskId) continue;
    return { status: 'RESULT_RECEIVED', result };
  }
  return { status: 'TIMEOUT', taskId };
}

export function verifyAura3Result(result, expectedTaskId) {
  const strict = result?.strict_supervision || {};
  const checks = {
    task_id: result?.task_id === expectedTaskId,
    sender: result?.sender === 'aura3',
    recipient: result?.recipient === 'victor',
    message_type: result?.message_type === 'TASK_RESULT',
    no_public_action: result?.public_action_performed === false,
    revert_to_victor: strict?.revert_to_victor === true,
    objective_alignment: Boolean(strict?.objective_alignment),
    status: Boolean(strict?.status),
    solution: Boolean(strict?.solution),
    next_action: Boolean(strict?.next_action),
    evidence: Array.isArray(strict?.evidence) && strict.evidence.length > 0,
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

export function formatAura3ResultForFounder(result) {
  const strict = result?.strict_supervision || {};
  const blockers = strict.error_or_blocker ?? result?.blockers ?? null;
  const parts = [
    `AURA3 se fresh revert aa gaya.`,
    `Status: ${strict.status || result?.execution_status || 'UNKNOWN'}`,
    `Objective alignment: ${strict.objective_alignment || 'UNKNOWN'}`,
  ];
  if (blockers && (!(Array.isArray(blockers)) || blockers.length)) {
    parts.push(`Error/Blocker: ${Array.isArray(blockers) ? blockers.join(', ') : String(blockers)}`);
  } else {
    parts.push('Error/Blocker: none reported');
  }
  if (strict.root_cause) parts.push(`Root cause: ${strict.root_cause}`);
  parts.push(`Solution: ${strict.solution || 'NOT_PROVIDED'}`);
  parts.push(`Next action: ${strict.next_action || result?.next_valid_action || 'NOT_PROVIDED'}`);
  parts.push(`Evidence: ${Array.isArray(strict.evidence) ? strict.evidence.join(', ') : 'NOT_PROVIDED'}`);
  return parts.join('\n');
}

function githubHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_ORCHESTRATION_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'Dr-Victor-Orchestrator/1.0',
  };
}

async function safeText(response) {
  try { return await response.text(); } catch { return ''; }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }


const TONY_REPO = 'vickykenin-lang/tony-stark-engineering';
const TONY_WORKFLOW = 'victor_tony_transport.yml';

export function tonyBridgeConfigured(env) {
  return Boolean(env.GITHUB_ORCHESTRATION_TOKEN);
}

export function selectTonyTaskType(text) {
  const value = String(text || '').toLowerCase();
  if (/repair plan|solution|fix plan/.test(value)) return 'REPAIR_PLAN';
  if (/post.?repair|verify repair|recovery verify/.test(value)) return 'POST_REPAIR_VERIFY';
  if (/diagnos|error|problem|issue|root cause|blocker/.test(value)) return 'DIAGNOSTIC';
  if (/health|heartbeat|runtime/.test(value)) return 'HEALTH_CHECK';
  return 'STATUS_CHECK';
}

export function shouldContactTony(text, entity) {
  if (entity?.entity_id !== 'tony_stark') return false;
  const value = String(text || '').toLowerCase();
  return /status|report|error|problem|issue|check|health|diagnos|repair|solution|root cause|baat|connect|bridge|communication|certif|supervision|progress|objective|onboard/.test(value);
}

export async function dispatchTonyTask(env, text, metadata = {}) {
  if (!tonyBridgeConfigured(env)) {
    return { status: 'PENDING_CONFIGURATION', reason: 'GITHUB_ORCHESTRATION_TOKEN_NOT_CONFIGURED' };
  }

  const taskType = selectTonyTaskType(text);
  const taskId = `victor-tony-${Date.now()}-${metadata.messageId || 'msg'}`;
  const response = await fetch(`${GITHUB_API}/repos/${TONY_REPO}/actions/workflows/${TONY_WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: githubHeaders(env),
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        task_id: taskId,
        task_type: taskType,
        payload: JSON.stringify({
          founder_message: String(text || '').slice(0, 1000),
          requested_by: 'victor',
          supervision_mode: 'STRICT',
        }),
      },
    }),
  });

  if (response.status !== 204) {
    const detail = await safeText(response);
    throw new Error(`TONY dispatch HTTP ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`);
  }

  return { status: 'DISPATCHED', taskId, taskType };
}

export async function waitForTonyResult(taskId, options = {}) {
  const attempts = options.attempts || 18;
  const delayMs = options.delayMs || 4000;
  const safeTaskId = String(taskId).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
  const path = `integration/results/tasks/${safeTaskId}.json`;
  const url = `${GITHUB_API}/repos/${TONY_REPO}/contents/${path}?ref=main`;

  for (let i = 0; i < attempts; i += 1) {
    if (i > 0) await sleep(delayMs);
    const response = await fetch(`${url}&t=${Date.now()}`, {
      headers: { ...githubHeaders(options.env || {}), 'Cache-Control': 'no-cache' },
    });
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`TONY result HTTP ${response.status}`);
    const payload = await response.json();
    const binary = atob(String(payload.content || '').replace(/\\n/g, ''));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    const result = JSON.parse(new TextDecoder().decode(bytes));
    if (result?.task_id !== taskId) continue;
    return { status: 'RESULT_RECEIVED', result };
  }
  return { status: 'TIMEOUT', taskId };
}

export function verifyTonyResult(result, expectedTaskId) {
  const strict = result?.strict_supervision || {};
  const checks = {
    task_id: result?.task_id === expectedTaskId,
    sender: result?.sender === 'tony_stark',
    recipient: result?.recipient === 'victor',
    message_type: result?.message_type === 'TASK_RESULT',
    no_destructive_action: result?.destructive_action_performed === false,
    no_paid_action: result?.paid_action_performed === false,
    revert_to_victor: strict?.revert_to_victor === true,
    objective_alignment: Boolean(strict?.objective_alignment),
    status: Boolean(strict?.status),
    solution: Boolean(strict?.solution),
    next_action: Boolean(strict?.next_action),
    evidence: Array.isArray(strict?.evidence) && strict.evidence.length > 0,
    follow_up_explicit: typeof strict?.requires_follow_up === 'boolean',
  };
  return { ok: Object.values(checks).every(Boolean), checks };
}

export function formatTonyResultForFounder(result) {
  const strict = result?.strict_supervision || {};
  const parts = [
    'Tony Stark se fresh revert aa gaya.',
    `Status: ${strict.status || result?.execution_status || 'UNKNOWN'}`,
    `Objective alignment: ${strict.objective_alignment || 'UNKNOWN'}`,
    `Error/Blocker: ${strict.error_or_blocker || 'none reported'}`,
  ];
  if (strict.root_cause) parts.push(`Root cause: ${strict.root_cause}`);
  parts.push(`Solution: ${strict.solution || 'NOT_PROVIDED'}`);
  parts.push(`Next action: ${strict.next_action || 'NOT_PROVIDED'}`);
  parts.push(`Evidence: ${Array.isArray(strict.evidence) ? strict.evidence.join(', ') : 'NOT_PROVIDED'}`);
  return parts.join('\n');
}
