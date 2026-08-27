const BEDROCK_BASE = 'https://bedrock-mantle.us-east-1.api.aws/v1';
const MAX_BODY_BYTES = 32 * 1024;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const DEPARTMENTS = new Set(['tony_stark', 'hulk']);
const ACTIONS = new Set(['ai.reason', 'github.repository.read', 'github.workflow_runs.read']);

const REPOSITORY_ALLOWLIST = {
  tony_stark: new Set([
    'vickykenin-lang/Dr.-Victor-Multi-AI-Orchestrator',
    'vickykenin-lang/tony-stark-engineering',
    'vickykenin-lang/rio-affiliate-engine',
    'vickykenin-lang/aura-3.0',
  ]),
  hulk: new Set([
    'vickykenin-lang/Dr.-Victor-Multi-AI-Orchestrator',
  ]),
};

export function brokerConfigured(env) {
  return Boolean(
    env.BROKER_AUTH_TONY_STARK &&
    env.BROKER_AUTH_HULK &&
    env.API_VICTOR &&
    env.GITHUB_ORCHESTRATION_TOKEN
  );
}

export function brokerCapabilities(env) {
  return {
    configured: brokerConfigured(env),
    departments: {
      tony_stark: Boolean(env.BROKER_AUTH_TONY_STARK),
      hulk: Boolean(env.BROKER_AUTH_HULK),
    },
    actions: [...ACTIONS],
    raw_secret_access: false,
    arbitrary_url_fetch: false,
    write_actions: false,
    paid_production_destructive_actions: false,
    audit_mode: 'CLOUDFLARE_STRUCTURED_LOG_AND_SIGNED_RECEIPT',
  };
}

export async function handleCredentialBroker(request, env, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const nowMs = options.nowMs ?? Date.now();
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return response({ error: 'request_too_large' }, 413);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return response({ error: 'request_too_large' }, 413);

  let payload;
  try { payload = JSON.parse(rawBody); } catch { return response({ error: 'invalid_json' }, 400); }

  const department = String(payload?.department || '').toLowerCase();
  if (!DEPARTMENTS.has(department)) return response({ error: 'department_not_allowed' }, 403);
  const authSecret = department === 'tony_stark' ? env.BROKER_AUTH_TONY_STARK : env.BROKER_AUTH_HULK;
  if (!authSecret) return response({ error: 'department_auth_not_configured' }, 503);

  const timestamp = request.headers.get('X-Victor-Timestamp') || '';
  const signature = request.headers.get('X-Victor-Signature') || '';
  const auth = await verifyBrokerSignature(authSecret, timestamp, rawBody, signature, nowMs);
  if (!auth.ok) return response({ error: auth.error }, 401);

  const requestId = String(payload?.request_id || '');
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{7,119}$/.test(requestId)) return response({ error: 'invalid_request_id' }, 400);
  const action = String(payload?.action || '');
  if (!ACTIONS.has(action)) return response({ error: 'action_not_allowed' }, 403);
  const purpose = String(payload?.purpose || '').trim();
  if (purpose.length < 10 || purpose.length > 500) return response({ error: 'invalid_purpose' }, 400);
  if (payload?.paid_action === true || payload?.production_action === true || payload?.destructive_action === true) {
    return response({ error: 'consequential_action_denied' }, 403);
  }

  let result;
  let credentialAlias;
  try {
    if (action === 'ai.reason') {
      credentialAlias = 'victor_ai_runtime';
      result = await executeAiReason(payload, env, fetchFn, department);
    } else {
      credentialAlias = 'github_orchestration';
      result = await executeGithubRead(payload, env, fetchFn, department, action);
    }
  } catch (error) {
    const receipt = await buildReceipt({ requestId, department, action, status: 'SAFE_STOP', at: new Date(nowMs).toISOString() });
    logAudit({ requestId, department, action, status: 'SAFE_STOP', receipt });
    return response({ request_id: requestId, status: 'SAFE_STOP', error: error?.message || 'broker_execution_failed', receipt, secret_exposed: false }, 502);
  }

  const receipt = await buildReceipt({ requestId, department, action, status: 'EXECUTED_VERIFIED', at: new Date(nowMs).toISOString() });
  logAudit({ requestId, department, action, status: 'EXECUTED_VERIFIED', receipt });
  return response({
    request_id: requestId,
    department,
    status: 'EXECUTED_VERIFIED',
    action,
    credential_alias: credentialAlias,
    result,
    receipt,
    raw_secret_returned: false,
    secret_exposed: false,
  });
}

export async function verifyBrokerSignature(secret, timestamp, rawBody, suppliedHex, nowMs = Date.now()) {
  const parsed = Number(timestamp);
  if (!Number.isFinite(parsed) || Math.abs(nowMs - parsed) > MAX_CLOCK_SKEW_MS) return { ok: false, error: 'stale_or_invalid_timestamp' };
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return { ok: false, error: 'invalid_signature' };
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expected = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(expected, suppliedHex.toLowerCase()) ? { ok: true } : { ok: false, error: 'invalid_signature' };
}

async function executeAiReason(payload, env, fetchFn, department) {
  const prompt = String(payload?.parameters?.prompt || '').trim();
  if (!prompt || prompt.length > 4000) throw new Error('AI_PROMPT_INVALID');
  const responseValue = await fetchFn(`${BEDROCK_BASE}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.API_VICTOR}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.VICTOR_MODEL || 'qwen.qwen3-coder-next',
      temperature: 0.1,
      max_tokens: 900,
      messages: [
        { role: 'system', content: `You are a bounded reasoning service for ${department}. Never reveal credentials or claim external execution. Return analysis only.` },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!responseValue.ok) throw new Error(`AI_UPSTREAM_HTTP_${responseValue.status}`);
  const json = await responseValue.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('AI_EMPTY_RESULT');
  return { type: 'reasoning_result', content: content.trim().slice(0, 12000), external_action_performed: false };
}

async function executeGithubRead(payload, env, fetchFn, department, action) {
  const repository = String(payload?.resource?.repository || '');
  if (!REPOSITORY_ALLOWLIST[department].has(repository)) throw new Error('REPOSITORY_NOT_ALLOWED');
  const base = `https://api.github.com/repos/${repository}`;
  const url = action === 'github.workflow_runs.read' ? `${base}/actions/runs?per_page=10` : base;
  const responseValue = await fetchFn(url, { headers: {
    Authorization: `Bearer ${env.GITHUB_ORCHESTRATION_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Dr-Victor-Credential-Broker/1.0',
  } });
  if (!responseValue.ok) throw new Error(`GITHUB_UPSTREAM_HTTP_${responseValue.status}`);
  const json = await responseValue.json();
  if (action === 'github.workflow_runs.read') {
    return { repository, workflow_runs: (json.workflow_runs || []).map(run => ({ id: run.id, name: run.name, status: run.status, conclusion: run.conclusion, created_at: run.created_at, html_url: run.html_url })) };
  }
  return { repository: json.full_name, private: json.private, default_branch: json.default_branch, pushed_at: json.pushed_at, archived: json.archived, html_url: json.html_url };
}

async function buildReceipt(record) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(record)));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function logAudit(record) {
  console.log(JSON.stringify({ event: 'VICTOR_CREDENTIAL_BROKER_AUDIT', ...record, secret_exposed: false }));
}

function timingSafeEqual(leftValue, rightValue) {
  const left = new TextEncoder().encode(String(leftValue));
  const right = new TextEncoder().encode(String(rightValue));
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) diff |= (left[index] || 0) ^ (right[index] || 0);
  return diff === 0;
}

function response(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
