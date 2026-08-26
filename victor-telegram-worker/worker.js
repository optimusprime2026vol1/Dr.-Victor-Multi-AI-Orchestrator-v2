import {
  PRECEDENCE_VERSION,
  RESOLVED_RUNTIME_RULES,
  buildPrecedenceDirective,
  buildTruthContract,
  buildTruthSnapshot,
  buildCorrectionPrompt,
  classifyFounderMessage,
  validateVictorReply,
} from './core_rules.mjs';
import {
  buildMemoryContext,
  isExplicitMemoryDirective,
  persistExplicitFounderMemory,
  resolveFounderEntityQuery,
} from './memory_runtime.mjs';
import {
  aura3BridgeConfigured,
  shouldContactAura3,
  dispatchAura3Task,
  waitForAura3Result,
  verifyAura3Result,
  formatAura3ResultForFounder,
  tonyBridgeConfigured,
  shouldContactTony,
  dispatchTonyTask,
  waitForTonyResult,
  verifyTonyResult,
  formatTonyResultForFounder,
  rioBridgeConfigured,
  shouldContactRio,
  dispatchRioTask,
  waitForRioResult,
  verifyRioResult,
  formatRioResultForFounder,
} from './department_bridge.mjs';

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
  ['DEPARTMENT_REGISTRY', 'data/department_registry.json', false],
  ['AI_RUNTIME_STATUS', 'data/ai_runtime_status.json', false],
  ['TELEGRAM_RUNTIME_STATUS', 'data/telegram_runtime_status.json', false],
  ['FOUNDER_MEMORY', 'memory/founder_memory.json', false],
  ['DECISIONS', 'memory/decisions.jsonl', false],
  ['OPERATIONAL_MEMORY', 'memory/operational_memory.jsonl', false],
  ['MEMORY_INDEX', 'memory/memory_index.json', false],
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({
        service: 'victor-telegram-webhook',
        status: 'READY',
        core_mode: 'GOVERNED_CANONICAL_CONTEXT',
        precedence_mode: PRECEDENCE_VERSION,
        truth_guard: 'DETERMINISTIC_V3',
        memory_recall_mode: 'REPO_CANONICAL_RELEVANCE_V2',
        memory_write_configured: Boolean(env.GITHUB_MEMORY_TOKEN),
        aura3_bridge_configured: aura3BridgeConfigured(env),
        tony_bridge_configured: tonyBridgeConfigured(env),
        rio_bridge_configured: rioBridgeConfigured(env),
        telegram_token_configured: Boolean(env.TELEGRAM_BOT_TOKEN_VICTOR),
        webhook_secret_configured: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
        founder_chat_configured: Boolean(env.VICTOR_FOUNDER_CHAT_ID),
        ai_inference_enabled: env.ENABLE_AI_INFERENCE === 'true',
        direct_consequential_department_execution: false,
        governed_diagnostic_department_bridge: true,
      });
    }

    if (request.method === 'GET' && url.pathname === '/core-health') {
      const core = await loadVictorCore();
      return json({
        service: 'victor-core-context',
        status: core.ready ? 'READY' : 'SAFE_STOP',
        required_sources_ok: core.requiredSourcesOk,
        precedence_mode: PRECEDENCE_VERSION,
        truth_guard: 'DETERMINISTIC_V3',
        memory_sources: core.sourceStatus.filter(x => ['FOUNDER_MEMORY','DECISIONS','OPERATIONAL_MEMORY','MEMORY_INDEX'].includes(x.name)),
        resolved_runtime_rules: RESOLVED_RUNTIME_RULES,
        sources: core.sourceStatus,
      }, core.ready ? 200 : 503);
    }

    if (request.method !== 'POST' || url.pathname !== '/telegram') return json({ error: 'not_found' }, 404);
    if (!env.TELEGRAM_WEBHOOK_SECRET) return json({ error: 'webhook_secret_not_configured' }, 503);

    const suppliedSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token') || '';
    if (!constantTimeEqual(suppliedSecret, env.TELEGRAM_WEBHOOK_SECRET)) return json({ error: 'unauthorized' }, 401);

    let update;
    try { update = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }

    const message = update?.message;
    if (!message || typeof message?.text !== 'string') return json({ ok: true, ignored: true });

    const chatId = String(message?.chat?.id ?? '');
    if (!chatId) return json({ ok: true, ignored: true });
    if (env.VICTOR_FOUNDER_CHAT_ID && chatId !== String(env.VICTOR_FOUNDER_CHAT_ID)) {
      return json({ ok: true, ignored: true, reason: 'chat_not_authorized' });
    }

    const text = message.text.trim();
    if (!text) return json({ ok: true, ignored: true });

    try {
      let memoryWrite = { status: 'NOT_REQUESTED' };
      const memoryDirective = isExplicitMemoryDirective(text);
      if (memoryDirective) {
        try {
          memoryWrite = await persistExplicitFounderMemory(env, text, {
            chatId,
            messageId: message.message_id,
          });
        } catch (memoryError) {
          console.error('Victor memory persistence failed:', memoryError?.message || 'unknown');
          memoryWrite = { status: 'FAILED' };
        }
      }

      const entity = resolveFounderEntityQuery(text);

      if (!memoryDirective && shouldContactRio(text, entity)) {
        if (!rioBridgeConfigured(env)) {
          await sendTelegramMessage(env, chatId, 'RIO governed bridge code ready hai, lekin GITHUB_ORCHESTRATION_TOKEN configured nahi hai. Token ke bina fresh round-trip verify nahi hoga.', message.message_id);
          return json({ ok: true, rio_bridge: 'PENDING_CONFIGURATION' });
        }
        let dispatch;
        try {
          dispatch = await dispatchRioTask(env, text, { messageId: message.message_id });
        } catch (bridgeError) {
          console.error('RIO dispatch failed:', bridgeError?.message || 'unknown');
          await sendTelegramMessage(env, chatId, 'RIO ko governed task dispatch nahi hua. Orchestration token aur RIO Actions permission verify karni hogi. Main connection success claim nahi karunga.', message.message_id);
          return json({ ok: true, rio_bridge: 'DISPATCH_FAILED' });
        }
        await sendTelegramMessage(env, chatId, `RIO ko direct ${dispatch.taskType} bhej diya hai. Task ID: ${dispatch.taskId}. Fresh revert verify hone tak connection certified nahi hai.`, message.message_id);
        ctx?.waitUntil(handleRioRoundTrip(env, chatId, dispatch, message.message_id));
        return json({ ok: true, rio_bridge: dispatch.status, task_id: dispatch.taskId });
      }

      if (!memoryDirective && shouldContactTony(text, entity)) {
        if (!tonyBridgeConfigured(env)) {
          await sendTelegramMessage(
            env,
            chatId,
            'Tony Stark diagnostic bridge code ready hai, lekin runtime orchestration token configured nahi hai. GITHUB_ORCHESTRATION_TOKEN configure hote hi Victor fresh governed round-trip chala sakta hai.',
            message.message_id,
          );
          return json({ ok: true, tony_bridge: 'PENDING_CONFIGURATION' });
        }

        let dispatch;
        try {
          dispatch = await dispatchTonyTask(env, text, { messageId: message.message_id });
        } catch (bridgeError) {
          console.error('Tony dispatch failed:', bridgeError?.message || 'unknown');
          await sendTelegramMessage(
            env,
            chatId,
            'Tony Stark ko governed task dispatch nahi hua. Orchestration token/repository Actions permission verify karni hogi. Main communication success claim nahi karunga.',
            message.message_id,
          );
          return json({ ok: true, tony_bridge: 'DISPATCH_FAILED' });
        }

        await sendTelegramMessage(
          env,
          chatId,
          `Tony Stark ko direct ${dispatch.taskType} bhej diya hai. Task ID: ${dispatch.taskId}. Victor fresh revert verify karega; tab tak connection certified nahi hai.`,
          message.message_id,
        );

        ctx?.waitUntil(handleTonyRoundTrip(env, chatId, dispatch, message.message_id));
        return json({ ok: true, tony_bridge: dispatch.status, task_id: dispatch.taskId });
      }

      if (!memoryDirective && shouldContactAura3(text, entity)) {
        if (!aura3BridgeConfigured(env)) {
          await sendTelegramMessage(
            env,
            chatId,
            'AURA3 diagnostic bridge code ready hai, lekin runtime orchestration token configured nahi hai. GITHUB_ORCHESTRATION_TOKEN configure hote hi main AURA3 ko direct governed task bhej kar uska fresh revert la sakta hoon.',
            message.message_id,
          );
          return json({ ok: true, aura3_bridge: 'PENDING_CONFIGURATION' });
        }

        let dispatch;
        try {
          dispatch = await dispatchAura3Task(env, text, { messageId: message.message_id });
        } catch (bridgeError) {
          console.error('AURA3 dispatch failed:', bridgeError?.message || 'unknown');
          await sendTelegramMessage(
            env,
            chatId,
            'AURA3 ko governed task dispatch nahi hua. Orchestration token/repository Actions permission verify karni hogi. Main communication success claim nahi karunga.',
            message.message_id,
          );
          return json({ ok: true, aura3_bridge: 'DISPATCH_FAILED' });
        }

        await sendTelegramMessage(
          env,
          chatId,
          `AURA3 ko direct ${dispatch.taskType} bhej diya hai. Task ID: ${dispatch.taskId}. Main fresh revert ka wait kar raha hoon; result aate hi verify karke report karunga.`,
          message.message_id,
        );

        ctx?.waitUntil(handleAura3RoundTrip(env, chatId, dispatch, message.message_id));
        return json({ ok: true, aura3_bridge: dispatch.status, task_id: dispatch.taskId });
      }

      let reply;
      if (memoryDirective) {
        reply = memoryAcknowledgement(memoryWrite.status);
      } else if (isGreeting(text)) {
        reply = 'Hi Vicky. Victor online hai. Bataiye, aap kya discuss karna chahte hain?';
      } else if (env.ENABLE_AI_INFERENCE === 'true') {
        reply = await callVictorCore(env, text, {
          telegramWebhookAuthenticated: true,
          telegramMessageReceivedNow: true,
          diagnosticDepartmentBridgeAvailable: aura3BridgeConfigured(env) || tonyBridgeConfigured(env) || rioBridgeConfigured(env),
        });
      } else {
        reply = 'Victor Telegram gateway connected hai, lekin AI inference disabled hai. Main paid inference Founder approval ke bina enable nahi karunga.';
      }

      await sendTelegramMessage(env, chatId, reply, message.message_id);
      return json({ ok: true, memory_write: memoryWrite.status });
    } catch (error) {
      console.error('Victor Telegram processing failed:', error?.name || 'Error', error?.message || 'unknown');
      try {
        await sendTelegramMessage(env, chatId, 'Victor SAFE_STOP: canonical core context, truth guard, ya reasoning provider verify nahi hua. Main guess karke jawab nahi dunga.', message.message_id);
      } catch (_) {}
      return json({ ok: false, error: 'processing_failed' }, 500);
    }
  },
};

async function handleAura3RoundTrip(env, chatId, dispatch, replyToMessageId) {
  try {
    const received = await waitForAura3Result(dispatch.taskId);
    if (received.status !== 'RESULT_RECEIVED') {
      await sendTelegramMessage(env, chatId, `AURA3 task ${dispatch.taskId} ka fresh revert timeout hua. Connection ko VERIFIED claim nahi kar raha. Follow-up required hai.`, replyToMessageId);
      return;
    }

    const verification = verifyAura3Result(received.result, dispatch.taskId);
    if (!verification.ok) {
      await sendTelegramMessage(env, chatId, `AURA3 ka revert mila, lekin strict verification fail hui. Task ${dispatch.taskId} ko VERIFIED_CONNECTED nahi maana jayega.`, replyToMessageId);
      return;
    }

    const report = formatAura3ResultForFounder(received.result);
    await sendTelegramMessage(env, chatId, `${report}\n\nVictor verification: round-trip evidence VERIFIED for this task. Ye diagnostic communication verification hai; production/LIVE certification alag gate hai.`, replyToMessageId);
  } catch (error) {
    console.error('AURA3 round-trip failed:', error?.message || 'unknown');
    try {
      await sendTelegramMessage(env, chatId, `AURA3 round-trip verify nahi hua. Task ${dispatch.taskId} par error aaya; main connected/success claim nahi karunga.`, replyToMessageId);
    } catch (_) {}
  }
}

async function handleRioRoundTrip(env, chatId, dispatch, replyToMessageId) {
  try {
    const received = await waitForRioResult(dispatch.taskId);
    if (received.status !== 'RESULT_RECEIVED') {
      await sendTelegramMessage(env, chatId, `RIO task ${dispatch.taskId} ka fresh revert timeout hua. Connection VERIFIED claim nahi kiya jayega.`, replyToMessageId);
      return;
    }
    const verification = verifyRioResult(received.result, dispatch.taskId);
    if (!verification.ok) {
      await sendTelegramMessage(env, chatId, `RIO ka revert mila, lekin strict verification fail hui. Task ${dispatch.taskId} VERIFIED_CONNECTED nahi hai.`, replyToMessageId);
      return;
    }
    const report = formatRioResultForFounder(received.result);
    await sendTelegramMessage(env, chatId, `${report}\n\nVictor verification: fresh governed round-trip VERIFIED. Ye communication certification hai; RIO production authority ya objective change nahi hua.`, replyToMessageId);
  } catch (error) {
    console.error('RIO round-trip failed:', error?.message || 'unknown');
    try { await sendTelegramMessage(env, chatId, `RIO round-trip verify nahi hua. Task ${dispatch.taskId} par error aaya; main connected/success claim nahi karunga.`, replyToMessageId); } catch (_) {}
  }
}

async function handleTonyRoundTrip(env, chatId, dispatch, replyToMessageId) {
  try {
    const received = await waitForTonyResult(dispatch.taskId, env);
    if (received.status !== 'RESULT_RECEIVED') {
      await sendTelegramMessage(env, chatId, `Tony task ${dispatch.taskId} ka fresh revert timeout hua. Connection ko VERIFIED claim nahi kar raha. Follow-up required hai.`, replyToMessageId);
      return;
    }

    const verification = verifyTonyResult(received.result, dispatch.taskId);
    if (!verification.ok) {
      await sendTelegramMessage(env, chatId, `Tony ka revert mila, lekin strict verification fail hui. Task ${dispatch.taskId} ko VERIFIED_CONNECTED nahi maana jayega.`, replyToMessageId);
      return;
    }

    const report = formatTonyResultForFounder(received.result);
    await sendTelegramMessage(env, chatId, `${report}\n\nVictor verification: fresh round-trip evidence VERIFIED for this task. Ye diagnostic communication verification hai; Tony LIVE certification alag gate hai.`, replyToMessageId);
  } catch (error) {
    console.error('Tony round-trip failed:', error?.message || 'unknown');
    try {
      await sendTelegramMessage(env, chatId, `Tony round-trip verify nahi hua. Task ${dispatch.taskId} par error aaya; main connected/success claim nahi karunga.`, replyToMessageId);
    } catch (_) {}
  }
}

function memoryAcknowledgement(status) {
  if (status === 'PERSISTED') return 'Record ho gaya. Founder instruction permanent memory mein save kar diya gaya hai.';
  if (status === 'ALREADY_PRESENT') return 'Ye instruction permanent memory mein already recorded hai.';
  if (status === 'PENDING_CONFIGURATION') return 'Record nahi hua. Permanent memory write configuration complete nahi hai.';
  if (status === 'CONFLICT_RETRY_REQUIRED') return 'Record abhi confirm nahi hua. Memory write conflict aaya hai; retry required hai.';
  if (status === 'FAILED') return 'Record nahi hua. Memory persistence fail hui hai; main ise saved claim nahi karunga.';
  return 'Memory write request process nahi hui.';
}

function isGreeting(text) {
  const normalized = text.toLowerCase().replace(/[!.?,]+/g, '').trim();
  return new Set(['hi','hello','hey','hii','hiii','namaste','namaskar','good morning','good afternoon','good evening']).has(normalized);
}

async function loadVictorCore() {
  const cache = caches.default;
  const cacheKey = new Request('https://victor.internal/core-context-v7-bridge');
  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();

  const results = await Promise.all(CORE_SOURCES.map(async ([name, path, required]) => {
    try {
      const res = await fetch(`${RAW_BASE}/${path}`, { headers: { 'User-Agent': 'Dr-Victor-Telegram-Core/7.0' } });
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
    sourceRecords: results,
    context: results
      .filter(r => r.ok && !['FOUNDER_MEMORY','DECISIONS','OPERATIONAL_MEMORY','MEMORY_INDEX'].includes(r.name))
      .map(r => `\n===== ${r.name} :: ${r.path} =====\n${r.text}`).join('\n'),
    architectureLockLoaded: Boolean(byName.ARCHITECTURE_LOCK?.ok),
  };

  const response = new Response(JSON.stringify(payload), { headers: { 'Cache-Control': 'public, max-age=120' } });
  await cache.put(cacheKey, response.clone());
  return payload;
}

async function callVictorCore(env, userMessage, requestFacts) {
  if (!env.API_VICTOR) throw new Error('API_VICTOR is not configured');

  const core = await loadVictorCore();
  if (!core.ready || !core.architectureLockLoaded) throw new Error('Victor canonical governance context unavailable');

  const intent = classifyFounderMessage(userMessage);
  const entity = resolveFounderEntityQuery(userMessage);
  const facts = {
    ...requestFacts,
    resolvedDepartmentId: entity.entity_id,
    resolvedDepartmentName: entity.canonical_name,
    entityResolutionReason: entity.reason,
  };
  const truthSnapshot = buildTruthSnapshot(core.sourceRecords, facts);
  const memory = buildMemoryContext(userMessage, core.sourceRecords, 6);
  const entityDirective = entity.matched
    ? `FOUNDER ENTITY RESOLUTION: The message target is ${entity.canonical_name} (${entity.entity_id}) because ${entity.reason}. Answer for this target only. If target is AURA3, do not mention AURA2 unless Founder explicitly asked for comparison.`
    : 'FOUNDER ENTITY RESOLUTION: no special alias matched.';

  const system = `
You are Dr. Victor, Founder Vicky's governed executive AI and orchestration intelligence.
You are NOT a generic Telegram chatbot. Telegram is only the Founder communication transport.

${buildPrecedenceDirective()}
${buildTruthContract(intent, truthSnapshot)}

${entityDirective}

MEMORY CONTRACT:
- Relevant memory is supporting context, not proof of current external state.
- Explicit newer Founder instructions override older conflicting memories.
- Never invent a remembered preference or decision.
- Never claim memory was recorded unless the runtime write path actually confirmed persistence.
- Never expose credentials, secrets, tokens or hidden sensitive values from memory.
${memory.prompt}

RUNTIME RULES:
1. Founder authority is supreme. Never silently expand authority.
2. Truth before appearance. Never claim LIVE, completed, connected, revenue, health or external success without verified evidence.
3. AI/provider is reasoning only. It cannot rewrite Founder authority, locked objectives, security, cost rules or validators.
4. Telegram itself does not execute consequential department/external side effects. A separately governed diagnostic bridge may communicate with a department for status/report/evidence without granting production authority.
5. For normal knowledge questions answer naturally. For system questions ground answers in the resolved target, truth snapshot and canonical context.
6. Respond in the user's language/style, concise by default. Never reveal secrets.
7. TELEGRAM FORMAT IS PLAIN TEXT ONLY. No Markdown syntax, markdown tables, headings, blockquotes or code fences.
8. Prefer direct executive answers. Conclusion first; minimum supporting facts only.

CANONICAL VICTOR CONTEXT:
${core.context}
`;

  let reply = await askModel(env, system, userMessage);
  let validation = validateVictorReply(reply, intent, truthSnapshot);

  if (!validation.ok) {
    const correction = buildCorrectionPrompt(validation.violations, intent, truthSnapshot);
    reply = await askModel(env, `${system}\n${correction}`, userMessage);
    validation = validateVictorReply(reply, intent, truthSnapshot);
  }

  if (!validation.ok) throw new Error(`Victor truth guard rejected reply: ${validation.violations.join(',')}`);
  return reply;
}

async function askModel(env, system, userMessage) {
  const model = env.VICTOR_MODEL || DEFAULT_MODEL;
  const response = await fetch(`${BEDROCK_BASE}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.API_VICTOR}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: userMessage }],
      temperature: 0.15,
      max_tokens: 700,
    }),
  });
  if (!response.ok) throw new Error(`Victor AI upstream HTTP ${response.status}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('Victor AI returned no text');
  return content.trim();
}

function normalizeTelegramText(value) {
  let text = String(value || '');
  text = text.replace(/```[a-zA-Z0-9_-]*\n?/g, '');
  text = text.replace(/```/g, '');
  text = text.replace(/\*\*(.*?)\*\*/gs, '$1');
  text = text.replace(/__(.*?)__/gs, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  text = text.replace(/^\s*>\s?/gm, '');
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

async function sendTelegramMessage(env, chatId, text, replyToMessageId) {
  if (!env.TELEGRAM_BOT_TOKEN_VICTOR) throw new Error('TELEGRAM_BOT_TOKEN_VICTOR is not configured');
  const cleanText = normalizeTelegramText(text);
  const body = { chat_id: chatId, text: cleanText.slice(0, 4096), allow_sending_without_reply: true };
  if (replyToMessageId) body.reply_parameters = { message_id: replyToMessageId };
  const response = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN_VICTOR}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
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
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
