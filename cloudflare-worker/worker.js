/**
 * Dr. Victor Command Center - Cloudflare Worker
 * AURA2 chat (text) + Vision image generation (Gemini image model)
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
      const { message, agent = 'aura', prompt, shot_id } = body;

      // Vision automated stills
      if (agent === 'vision_image' || agent === 'vision') {
        const textPrompt = prompt || message;
        if (!textPrompt || typeof textPrompt !== 'string') {
          return json({ error: 'prompt required for vision_image' }, 400);
        }
        const image = await callGeminiImage(env.GEMINI_API_KEY, textPrompt);
        return json({
          agent: 'vision_image',
          shot_id: shot_id || null,
          mime: image.mime,
          base64: image.base64,
          note: 'Automated still — Founder only Approves/Rejects',
        });
      }

      if (!message || typeof message !== 'string') {
        return json({ error: 'message required' }, 400);
      }

      if (agent === 'aura' || agent === 'aura2') {
        const reply = await callGeminiText(env.GEMINI_API_KEY, message);
        return json({ agent: 'aura', reply });
      }

      if (agent === 'victor') {
        return json({
          agent: 'victor',
          reply: 'Victor real Grok dashboard pe pending. Is chat me real Victor se baat karo.',
        });
      }

      return json({ error: 'unknown agent' }, 400);
    } catch (err) {
      return json({ error: err.message || 'server error' }, 500);
    }
  },
};

async function callGeminiText(apiKey, userMessage) {
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in Worker secrets');

  const system =
    'You are AURA2, Department AI for Design Infra (turnkey interiors, Delhi NCR). ' +
    'Team Leader is Dr. Victor. Job: interior posts → Instagram → leads. ' +
    'Facts: 10 candidates ready (≥7), 0 published, 0 real leads, IG secrets missing. ' +
    'Honest, natural Hindi-English, complete answers, no meta instructions.\n\nUser: ' +
    userMessage;

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' +
    apiKey;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: system }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 800 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Gemini text error: ' + res.status + ' ' + errText.slice(0, 250));
  }

  const data = await res.json();
  return (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim() || 'No reply';
}

async function callGeminiImage(apiKey, prompt) {
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in Worker secrets');

  // Nano Banana 2 — Gemini native image (2026)
  const model = 'gemini-3.1-flash-image';
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    model +
    ':generateContent?key=' +
    apiKey;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        // imageConfig optional; model defaults OK for stills
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Gemini image error: ' + res.status + ' ' + errText.slice(0, 400));
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        mime: part.inlineData.mimeType || 'image/png',
        base64: part.inlineData.data,
      };
    }
    if (part.inline_data?.data) {
      return {
        mime: part.inline_data.mime_type || 'image/png',
        base64: part.inline_data.data,
      };
    }
  }

  throw new Error('No image in Gemini response. Check model access on this API key.');
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
