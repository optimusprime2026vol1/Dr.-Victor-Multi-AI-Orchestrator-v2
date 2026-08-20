/**
 * Dr. Victor Command Center - Cloudflare Worker
 * Secure proxy for real AI chats (Gemini for AURA2)
 *
 * Model: gemini-3.6-flash (updated 20 Aug 2026)
 */

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'POST only' }, 405);
    }

    try {
      const body = await request.json();
      const { message, agent = 'aura' } = body;

      if (!message || typeof message !== 'string') {
        return json({ error: 'message required' }, 400);
      }

      if (agent === 'aura' || agent === 'aura2') {
        const reply = await callGemini(env.GEMINI_API_KEY, message);
        return json({ agent: 'aura', reply });
      }

      if (agent === 'victor') {
        return json({
          agent: 'victor',
          reply: 'Victor real Grok connection abhi pending hai. Abhi AURA2 tab use karo (real Gemini).',
        });
      }

      return json({ error: 'unknown agent' }, 400);
    } catch (err) {
      return json({ error: err.message || 'server error' }, 500);
    }
  },
};

async function callGemini(apiKey, userMessage) {
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in Worker secrets');

  const system = `You are AURA2, the Department AI for Design Infra (turnkey interiors, Delhi NCR).
You work under Dr. Victor (Team Leader). Your only job is high-quality interior content → Instagram traffic → qualified WhatsApp/email leads.

Current facts:
- 10 candidates ready, all score ≥7
- 0 published, 0 real leads
- GEMINI_API_KEY and DEEPSEEK_KEY are present
- IG_USER_ID and IG_ACCESS_TOKEN are still missing
- Cadence: 10 submissions/day, only ≥7 shown, Approve = instant publish
- Success metric = real qualified leads

Reply in simple Hindi-English mix. Be direct, honest, short-to-medium. No fluff.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: system + '\n\nUser message: ' + userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Gemini error: ' + res.status + ' ' + errText.slice(0, 300));
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'AURA2 se reply nahi aa paya. Thodi der baad try karo.';
  return text.trim();
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
