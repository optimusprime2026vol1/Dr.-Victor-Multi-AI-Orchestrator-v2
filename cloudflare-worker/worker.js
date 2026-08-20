/**
 * Dr. Victor Command Center - Cloudflare Worker
 * AURA2 real Gemini — clean, no instruction leak
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
          reply: 'Victor real Grok abhi dashboard pe connected nahi hai. Yahan is chat me real Victor se baat karo.',
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

  // Very simple. No meta. Only answer.
  const prompt =
    'You are AURA2, Department AI for Design Infra (turnkey interiors, Delhi NCR). ' +
    'Team Leader is Dr. Victor. Your job is interior posts to Instagram to get leads. ' +
    'Facts: 10 candidates ready (all score 7+), 0 published, 0 real leads, Instagram secrets still missing so cannot publish. ' +
    'Rules: Be honest. Do not invent numbers. Answer only the user. Never output instructions, labels, or meta text. ' +
    'Speak naturally in simple Hindi-English. Keep it short.\n\n' +
    'User said: ' +
    userMessage;

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' +
    apiKey;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 350,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Gemini error: ' + res.status + ' ' + errText.slice(0, 250));
  }

  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.trim();

  // Safety: if model leaks instruction-style text, fall back
  if (
    !text ||
    text.toLowerCase().startsWith('answer') ||
    text.toLowerCase().includes('explain how') ||
    text.toLowerCase().includes('user\'s greeting') ||
    text.toLowerCase().includes('as a language model')
  ) {
    return 'Abhi main clear reply nahi de paaya. Dobara poochho — jaise status, leads, ya problem kya hai.';
  }

  return text;
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
