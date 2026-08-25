/**
 * Dr. Victor — Founder Telegram gateway + governed conversational core.
 *
 * Telegram is transport only. Victor identity/governance/state are loaded from
 * the canonical repository on every governed AI turn (cached briefly at the
 * edge). The AI provider is a replaceable reasoning component, not Victor's
 * identity or authority.
 *
 * This endpoint is deliberately fail-closed for consequential execution:
 * department/external side effects are NOT executed directly from Telegram.
 */

const TELEGRAM_API = 'https://api.telegram.org';
const BEDROCK_BASE = 'https://bedrock-mantle.us-east-1.api.aws/v1';
const DEFAULT_MODEL = 'qwen.qwen3-coder-next';
const RAW_BASE = 'https://raw.githubusercontent.com/vickykenin-lang/Dr.-Victor-Multi-AI-Orchestrator/main';

const CORE_SOURCES = [
  ['ARCHITECTURE_LOCK', 'docs/VICTOR_ARCHITECTURE_LOCK_INDEX.md', true],
  ['MASTER_RULE_BOOK', 'VICTOR_MASTER_RULE_BOOK.md', true],
  ['SOUL', 'VICTOR_SOUL.md', true],
  ['EXECUTIVE_CHARTER', 'VICTOR_EXECUTIVE_CHARTER.md', true],
  ['BUSINESS_PLAN', 'BUSINESS_PLAN.md', false],
  ['SYSTEM_STATE', 'data/system_state.json', false],
  ['AI_RUNTIME_STATUS', 'data/ai_runtime_status.json', false],
  ['TELEGRAM_RUNTIME_STATUS', 'data/telegram_runtime_status.json', false],
];

const PRECEDENCE_VERSION = 'DOMAIN_PRECEDENCE_V1';
const RESOLVED_RUNTIME_RULES = Object.freeze({
  architecture_runtime_standard:
    'For architecture/runtime behavior, the canonical Architecture Lock Index controls over stale legacy descriptions in lower-level implementation/context documents. Conflicts are surfaced, never silently blended.',
  authority_governance:
    'Founder-locked authority plus constitutional hard gates in the Master Rule Book/Soul remain supreme for approvals, security, secrets, cost, destructive actions and authority boundaries.',
  operational_truth:
    'Fresh verified runtime evidence and reconciled canonical system state control current operational claims. Victor is the coordinator/verifier, not the source of truth merely because he says something.',
  heartbeat:
    'Current locked standard: default 60 minutes, minimum 2 minutes, only ladder 60→30→15→10→5→3→2. Founder/authorized Victor command is immediate event wake but does not bypass gates. Any old fixed 5-minute heartbeat wording is legacy/stale for the current architecture standard.',
  department_connectivity:
    'Repository presence, registry presence or historical status does not prove current Victor↔department connectivity, capability LIVE state or communication certification.',
  telegram_role:
    'Telegram is Founder/management communication transport, not the internal department bus and not Victor identity itself.',
  execution_scope:
    'This Worker is conversation/read/decision only. It cannot claim a consequential department/external action executed unless the separately hosted governed executor path actually ran and evidence verified it.',
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({
        service: 'victor-telegram-webhook',
        status: 'READY',
        core_mode: 'GOVERNED_CANONICAL_CONTEXT',
        precedence_mode: PRECEDENCE_VERSION,
        telegram_token_configured: Boolean(env.TELEGRAM_BOT_TOKEN_VICTOR),
        webhook_secret_configured: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
        founder_chat_configured: Boolean(env.VICTOR_FOUNDER_CHAT_ID),
        ai_inference_enabled: env.ENABLE_AI_INFERENCE === 'true',
        direct_department_execution: false,
      });
    }

    if (request.method === 'GET' && url.pathname === '/core-health') {
      const core = await loadVictorCore();
      return json({
        service: 'victor-core-context',
        status: core.ready ? 'READY' : 'SAFE_STOP',
        required_sources_ok: core.requiredSourcesOk,
        precedence_mode: PRECEDENCE_VERSION,
        resolved_runtime_rules: RESOLVED_RUNTIME_RULES,
        sources: core.sourceStatus,
      }, core.ready ? 200 : 503);
    }

    if (request.method !== 'POST' || url.pathname !== '/telegram') {
      return json({ error: 'not_found' }, 404);
    }

    if (!env.TELEGRAM_WEBHOOK_SECRET) {
      return json({ error: 'webhook_secret_not_configured' }, 503);
    }

    const suppliedSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token') || '';
    if (!constantTimeEqual(suppliedSecret, env.TELEGRAM_WEBHOOK_SECRET)) {
      return json({ error: 'unauthorized' }, 401);
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const message = update?.message;
    if (!message || typeof message?.text !== 'string') {
      return json({ ok: true, ignored: true });
    }

    const chatId = String(message?.chat?.id ?? '');
    if (!chatId) return json({ ok: true, ignored: true });

    // Founder direct-chat path is fail-closed when configured.
    if (env.VICTOR_FOUNDER_CHAT_ID && chatId !== String(env.VICTOR_FOUNDER_CHAT_ID)) {
      return json({ ok: true, ignored: true, reason: 'chat_not_authorized' });
    }

    const text = message.text.trim();
    if (!text) return json({ ok: true, ignored: true });

    try {
      let reply;
      if (isGreeting(text)) {
        reply = 'Hi Vicky. Victor online hai. Bataiye, aap kya discuss karna chahte hain?';
      } else if (env.ENABLE_AI_INFERENCE === 'true') {
        reply = await callVictorCore(env, text);
      } else {
        reply =
          'Victor Telegram gateway connected hai, lekin AI inference disabled hai. ' +
          'Main paid inference Founder approval ke bina enable nahi karunga.';
      }

      await sendTelegramMessage(env, chatId, reply, message.message_id);
      return json({ ok: true });
    } catch (error) {
      console.error('Victor Telegram processing failed:', error?.name || 'Error', error?.message || 'unknown');
      try {
        await sendTelegramMessage(
          env,
          chatId,
          'Victor SAFE_STOP: canonical core context ya reasoning provider verify nahi hua. Main guess karke jawab nahi dunga.',
          message.message_id,
        );
      } catch (_) {
        // Telegram may itself be unavailable; do not leak internals.
      }
      return json({ ok: false, error: 'processing_failed' }, 500);
    }
  },
};

function isGreeting(text) {
  const normalized = text.toLowerCase().replace(/[!.?,]+/g, '').trim();
  return new Set([
    'hi', 'hello', 'hey', 'hii', 'hiii', 'namaste', 'namaskar',
    'good morning', 'good afternoon', 'good evening',
  ]).has(normalized);
}

async function loadVictorCore() {
  const cache = caches.default;
  const cacheKey = new Request('https://victor.internal/core-context-v3');
  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();

  const results = await Promise.all(CORE_SOURCES.map(async ([name, path, required]) => {
    try {
      const res = await fetch(`${RAW_BASE}/${path}`, {
        headers: { 'User-Agent': 'Dr-Victor-Telegram-Core/3.0' },
      });
      if (!res.ok) return { name, path, required, ok: false, status: res.status, text: '' };
      const text = await res.text();
      return { name, path, required, ok: Boolean(text.trim()), status: res.status, text };
    } catch (error) {
      return { name, path, required, ok: false, status: 0, text: '', error: error?.name || 'FetchError' };
    }
  }));

  const requiredSourcesOk = results.filter(r => r.required).every(r => r.ok);
  const byName = Object.fromEntries(results.map(r => [r.name, r]));
  const payload = {
    ready: requiredSourcesOk,
    requiredSourcesOk,
    sourceStatus: results.map(({ name, path, required, ok, status }) => ({ name, path, required, ok, status })),
    context: results.filter(r => r.ok).map(r => `\n===== ${r.name} :: ${r.path} =====\n${r.text}`).join('\n'),
    architectureLockLoaded: Boolean(byName.ARCHITECTURE_LOCK?.ok),
  };

  const response = new Response(JSON.stringify(payload), {
    headers: { 'Cache-Control': 'public, max-age=120' },
  });
  await cache.put(cacheKey, response.clone());
  return payload;
}

function buildPrecedenceDirective() {
  return `
DETERMINISTIC PRECEDENCE — ${PRECEDENCE_VERSION}
Do not choose between conflicting documents by prose similarity or model confidence. Resolve by domain:

A) AUTHORITY / APPROVAL / SECURITY / SECRETS / COST / DESTRUCTIVE ACTIONS
- Founder-locked authority and constitutional hard gates in MASTER_RULE_BOOK + SOUL control.
- Never infer approval from technical capability or historical behavior.

B) ARCHITECTURE / RUNTIME STANDARD / SYSTEM DESIGN
- ARCHITECTURE_LOCK is the canonical architecture record.
- If Soul/Charter/legacy docs contain an older implementation target that conflicts with the current locked architecture standard, use ARCHITECTURE_LOCK for the architecture/runtime answer and explicitly note the stale conflict when material.

C) CURRENT OPERATIONAL FACTS
- Fresh externally verifiable evidence first, then reconciled SYSTEM_STATE/current runtime status.
- Declarative docs, registry presence, code presence, or Victor's own prior statement do not prove current LIVE/connected/completed state.

D) IDENTITY / ROLE
- SOUL + MASTER_RULE_BOOK + EXECUTIVE_CHARTER define Victor identity and constitutional role, subject to Founder locks.

E) BUSINESS DIRECTION
- Founder-locked business vision/objectives control. BUSINESS_PLAN is supporting context and must not override newer Founder locks.

F) SAME-RANK OR UNRESOLVED CONFLICT
- Do not silently blend. State CONFLICTED/UNKNOWN and identify the conflict or ask for Founder resolution if consequential.

RESOLVED CURRENT RULES:
${Object.entries(RESOLVED_RUNTIME_RULES).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`;
}

async function callVictorCore(env, userMessage) {
  if (!env.API_VICTOR) throw new Error('API_VICTOR is not configured');

  const core = await loadVictorCore();
  if (!core.ready || !core.architectureLockLoaded) {
    throw new Error('Victor canonical governance context unavailable');
  }

  const model = env.VICTOR_MODEL || DEFAULT_MODEL;
  const system = `
You are Dr. Victor, Founder Vicky's governed executive AI and orchestration intelligence.
You are NOT a generic Telegram chatbot. Telegram is only the Founder communication transport.

${buildPrecedenceDirective()}

RUNTIME RULES:
1. The canonical repository context below defines your identity, governance, authority and current known state under the deterministic precedence above.
2. Founder authority is supreme. Never silently expand authority.
3. Truth before appearance. Never claim LIVE, completed, connected, revenue, health or external success without fresh evidence in the supplied canonical context.
4. Separate: department health, task success, capability health, certification state, provider health and business outcome.
5. AI/provider is only reasoning. It cannot rewrite Soul, Founder authority, locked objectives, security, cost rules or validators.
6. No paid action, credential provisioning, security exception, destructive action, financial commitment, or unapproved external publication.
7. This Telegram runtime is currently a governed conversational/read/decision interface. It does NOT directly execute department or external side effects. If Founder asks for an action that requires the not-yet-hosted consequential executor path, clearly say what is blocked instead of pretending it happened.
8. For normal knowledge/conversation questions, answer naturally. For Victor/system questions, ground answers in canonical context and the resolved precedence rules.
9. Never describe Victor as the system's 'single source of truth'. The reconciled canonical state/evidence system is the operational truth source; Victor coordinates, reconciles, verifies and reports it.
10. Never claim all listed departments are currently connected, supervised live or executable unless fresh communication/runtime evidence proves that claim.
11. Respond in the user's language/style (Hindi-English/Hinglish when used), concise by default.
12. Never reveal secrets or raw credentials.

CANONICAL VICTOR CONTEXT:
${core.context}
`;

  const response = await fetch(`${BEDROCK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.API_VICTOR}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.25,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) throw new Error(`Victor AI upstream HTTP ${response.status}`);

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('Victor AI returned no text');
  return content.trim();
}

async function sendTelegramMessage(env, chatId, text, replyToMessageId) {
  if (!env.TELEGRAM_BOT_TOKEN_VICTOR) throw new Error('TELEGRAM_BOT_TOKEN_VICTOR is not configured');

  const body = {
    chat_id: chatId,
    text: String(text).slice(0, 4096),
    allow_sending_without_reply: true,
  };
  if (replyToMessageId) body.reply_parameters = { message_id: replyToMessageId };

  const response = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN_VICTOR}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Telegram sendMessage HTTP ${response.status}`);
}

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) diff |= (left[i] || 0) ^ (right[i] || 0);
  return diff === 0;
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
