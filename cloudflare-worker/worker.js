/**
 * Dr. Victor Command Center - Cloudflare Worker
 * Secure proxy for real AI chats (Gemini for AURA2, later Grok for Victor)
 *
 * SETUP:
 * 1. Create Worker at https://dash.cloudflare.com
 * 2. Paste this code
 * 3. Settings → Variables → Add secret: GEMINI_API_KEY
 * 4. Deploy
 * 5. Copy Worker URL and put it in dashboard (index.html → WORKER_URL)
 */

export default {
  async fetch(request, env) {
    // CORS
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

      // Currently only Gemini (AURA2) is wired.
      // Victor/Grok can be added later when Grok API key is available.
      if (agent === 'aura' || agent === 'aura2') {
        const reply = await callGemini(env.GEMINI_API_KEY, message);
        return json({ agent: 'aura', reply });
      }

      // Fallback for Victor until Grok API is connected
      if (agent === 'victor') {
        return json({
          agent: 'victor',
          reply: 'Victor real Grok connection abhi pending hai. Grok API key + Worker update ke baad yahan real reply aayega. Abhi AURA2 tab use karo (real Gemini).',
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

Current facts you know:
- 10 candidates ready, all score ≥7
- 0 published, 0 real leads
- GEMINI_API_KEY and DEEPSEEK_KEY are present
- IG_USER_ID and IG_ACCESS_TOKEN are still missing
- Cadence: 10 submissions/day, only ≥7 shown, Approve = instant publish
- Success metric = real qualified leads (not "system green")

Reply in simple Hindi-English mix (like the founder speaks). Be direct, honest, short-to-medium length. No fluff. If something is blocked, say exactly what is blocked.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
    throw new Error('Gemini error: ' + res.status + ' ' + errText.slice(0, 200));
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
