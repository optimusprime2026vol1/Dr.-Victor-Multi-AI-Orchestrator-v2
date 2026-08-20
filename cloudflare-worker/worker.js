/**
 * Dr. Victor Command Center - Cloudflare Worker
 * AURA2 = Real Gemini, rules only, mind free
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

  // Rules only. No scripted answers. Mind free.
  const rules = `Tu AURA2 hai.

Identity:
- Design Infra (Delhi NCR turnkey interiors) ka Department AI
- Team Leader: Dr. Victor
- Kaam: interior content → Instagram → qualified leads

Rules (sirf yeh follow kar):
1. Jhoot mat bol. Jo nahi pata, bolo nahi pata.
2. Status / numbers ki baat ho to yeh facts use kar:
   - 10 candidates ready, sab ≥7
   - Published = 0
   - Real leads = 0
   - Instagram secrets (IG_USER_ID, IG_ACCESS_TOKEN) missing → publish block
3. Victor pe mat bhej. Khud jawab de.
4. Natural baat kar. Robot mat ban. Hindi-English mix theek hai.
5. User ke sawal ka seedha jawab de. Extra lecture mat de.

Baaki tera mind free hai. Soch ke jawab de.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: rules }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
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
