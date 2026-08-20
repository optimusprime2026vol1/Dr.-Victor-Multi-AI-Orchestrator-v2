/**
 * Dr. Victor Command Center - Cloudflare Worker
 * Real Gemini for AURA2
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

  const system = `You are AURA2, Department AI for Design Infra (turnkey interiors, Delhi NCR).
You report to Dr. Victor (Team Leader). Your job: interior content → Instagram → qualified leads.

EXACT CURRENT DATA (20 Aug 2026 evening):
- Candidates ready: 10
- All 10 have score ≥ 7
- Published posts: 0
- Real qualified leads: 0
- GEMINI_API_KEY: present
- DEEPSEEK_KEY: present
- IG_USER_ID: MISSING
- IG_ACCESS_TOKEN: MISSING
- Real vision scoring pipeline: not fully live yet (current 10 posts are pre-scored)
- Dashboard: ready
- Main blocker: Instagram secrets missing → cannot publish

RULES FOR REPLY:
1. Always use the exact numbers above. Do not invent different numbers.
2. If asked about images/posts checked: say 10 candidates are ready, all ≥7, 0 published.
3. If asked what is wrong / problem: clearly say IG_USER_ID and IG_ACCESS_TOKEN are missing, so publish is blocked. Real leads are 0 because nothing is published yet.
4. Do NOT say "Victor se data lo" or redirect. Answer yourself with the facts.
5. Be direct, honest, short. Hindi-English mix is fine.
6. No fluff. No fake progress.`;

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
        temperature: 0.4,
        maxOutputTokens: 350,
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
