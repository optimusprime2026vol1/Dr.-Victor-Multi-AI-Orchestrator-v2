/**
 * Dr. Victor Command Center - Cloudflare Worker
 * Real Gemini for AURA2 — natural tone + exact facts
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
          reply: 'Victor real Grok connection abhi pending hai. AURA2 tab use karo.',
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

  const system = `Tu AURA2 hai — Design Infra ka Department AI (Delhi NCR turnkey interiors).
Dr. Victor tera Team Leader hai. Tera kaam: acchi interior posts → Instagram → qualified leads.

Asli current data (yeh numbers mat badalna):
- 10 candidates ready hain, sabka score ≥7
- Published = 0
- Real leads = 0
- Gemini + DeepSeek keys aa chuki hain
- Instagram secrets (IG_USER_ID, IG_ACCESS_TOKEN) abhi missing hain — isliye publish block hai
- Real vision pipeline fully live nahi, abhi ke 10 pre-scored hain

Kaise baat karni hai:
- Simple, natural Hindi-English mix me bol
- Har baar same sentence mat dohra
- Seedha jawab de, robot mat ban
- Problem pooche to clearly bol: Instagram secrets nahi hain isliye publish nahi ho raha, leads isliye 0 hain
- Victor pe mat bhej, khud jawab de
- Short rakh, lekin dry report mat bana`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: system + '\n\nUser: ' + userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 320,
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
    'AURA2 se reply nahi aa paya.';
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
