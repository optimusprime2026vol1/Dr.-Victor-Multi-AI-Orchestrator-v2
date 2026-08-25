/**
 * Dr. Victor — dedicated Telegram webhook runtime.
 *
 * Security / governance:
 * - Victor Telegram secrets are isolated from department secrets.
 * - Incoming Telegram webhook secret is verified before processing.
 * - Founder private chat is allow-listed when VICTOR_FOUNDER_CHAT_ID is set.
 * - Paid AI inference is OFF by default and requires ENABLE_AI_INFERENCE=true.
 * - No department capability or external business action is executed here.
 */

const TELEGRAM_API = 'https://api.telegram.org';
const BEDROCK_BASE = 'https://bedrock-mantle.us-east-1.api.aws/v1';
const DEFAULT_MODEL = 'qwen.qwen3-coder-next';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({
        service: 'victor-telegram-webhook',
        status: 'READY',
        telegram_token_configured: Boolean(env.TELEGRAM_BOT_TOKEN_VICTOR),
        webhook_secret_configured: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
        founder_chat_configured: Boolean(env.VICTOR_FOUNDER_CHAT_ID),
        ai_inference_enabled: env.ENABLE_AI_INFERENCE === 'true',
      });
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

    // Telegram retries non-2xx deliveries. Unsupported update types are acknowledged.
    const message = update?.message;
    if (!message || typeof message?.text !== 'string') {
      return json({ ok: true, ignored: true });
    }

    const chatId = String(message?.chat?.id ?? '');
    if (!chatId) {
      return json({ ok: true, ignored: true });
    }

    // Founder direct-chat path is fail-closed when configured.
    if (env.VICTOR_FOUNDER_CHAT_ID && chatId !== String(env.VICTOR_FOUNDER_CHAT_ID)) {
      return json({ ok: true, ignored: true, reason: 'chat_not_authorized' });
    }

    const text = message.text.trim();
    if (!text) {
      return json({ ok: true, ignored: true });
    }

    let reply;
    try {
      if (isGreeting(text)) {
        reply = 'Hi Vicky. Main Victor hoon. Bataiye, aap kya discuss karna chahte hain?';
      } else if (env.ENABLE_AI_INFERENCE === 'true') {
        reply = await callVictorAI(env, text);
      } else {
        reply =
          'Main Telegram par connected hoon. General AI inference abhi disabled hai, isliye main is message ka AI-generated answer nahi de raha. ' +
          'Paid inference Founder approval ke bina enable nahi ki jayegi.';
      }

      await sendTelegramMessage(env, chatId, reply, message.message_id);
    } catch (error) {
      // Do not leak secret-bearing upstream bodies or environment values.
      console.error('Victor Telegram processing failed:', error?.name || 'Error', error?.message || 'unknown');
      return json({ ok: false, error: 'processing_failed' }, 500);
    }

    return json({ ok: true });
  },
};

function isGreeting(text) {
  const normalized = text.toLowerCase().replace(/[!.?,]+/g, '').trim();
  return new Set([
    'hi',
    'hello',
    'hey',
    'hii',
    'hiii',
    'namaste',
    'namaskar',
    'good morning',
    'good afternoon',
    'good evening',
  ]).has(normalized);
}

async function callVictorAI(env, userMessage) {
  if (!env.API_VICTOR) throw new Error('API_VICTOR is not configured');

  const model = env.VICTOR_MODEL || DEFAULT_MODEL;
  const response = await fetch(`${BEDROCK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.API_VICTOR}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are Dr. Victor, Founder-facing executive AI. Answer naturally and concisely in the user language. ' +
            'Never invent live system state. For system facts, say when fresh verified evidence is unavailable. ' +
            'Do not execute external, financial, destructive, security, credential, or department actions from this conversational endpoint.',
        },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`Victor AI upstream HTTP ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Victor AI returned no text');
  }
  return content.trim();
}

async function sendTelegramMessage(env, chatId, text, replyToMessageId) {
  if (!env.TELEGRAM_BOT_TOKEN_VICTOR) {
    throw new Error('TELEGRAM_BOT_TOKEN_VICTOR is not configured');
  }

  const body = {
    chat_id: chatId,
    text: String(text).slice(0, 4096),
    allow_sending_without_reply: true,
  };
  if (replyToMessageId) body.reply_parameters = { message_id: replyToMessageId };

  const response = await fetch(
    `${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN_VICTOR}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(`Telegram sendMessage HTTP ${response.status}`);
  }
}

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] || 0) ^ (right[i] || 0);
  }
  return diff === 0;
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
