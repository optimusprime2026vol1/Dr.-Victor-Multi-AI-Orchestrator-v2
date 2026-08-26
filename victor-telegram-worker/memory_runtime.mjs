const MEMORY_STOP = new Set(['the','a','an','is','are','to','of','and','or','in','on','for','me','my','ka','ki','ke','ko','hai','he','kya','aur','se','ye','vo','main','mujhe','this','that','it']);
const LOCK_PATTERNS = [
  /\b(lock|locked|final|permanent|remember|save|store)\b/i,
  /\b(yaad\s+rakh|yaad\s+rakho|save\s+kar|store\s+kar|lock\s+kar)\b/i,
];

export function memoryTokens(text) {
  return new Set(String(text || '').toLowerCase().match(/[a-z0-9_]+/g)?.filter(x => x.length > 1 && !MEMORY_STOP.has(x)) || []);
}

export function isExplicitMemoryDirective(text) {
  const value = String(text || '').trim();
  return Boolean(value) && LOCK_PATTERNS.some(rx => rx.test(value));
}

export function parseMemorySources(sourceRecords = []) {
  const records = [];
  for (const source of sourceRecords) {
    if (!source?.ok || typeof source.text !== 'string') continue;
    if (source.name === 'FOUNDER_MEMORY') {
      try {
        const data = JSON.parse(source.text);
        records.push({ class: 'founder', priority: 100, data, text: JSON.stringify(data) });
      } catch (_) {}
    }
    if (source.name === 'DECISIONS' || source.name === 'OPERATIONAL_MEMORY') {
      const cls = source.name === 'DECISIONS' ? 'decision' : 'operational';
      const priority = cls === 'decision' ? 90 : 70;
      for (const line of source.text.split(/\r?\n/)) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          records.push({ class: cls, priority, data, text: JSON.stringify(data) });
        } catch (_) {}
      }
    }
  }
  return records;
}

export function recallMemory(query, sourceRecords = [], limit = 5) {
  const q = memoryTokens(query);
  const scored = [];
  for (const record of parseMemorySources(sourceRecords)) {
    const t = memoryTokens(record.text);
    let overlap = 0;
    for (const token of q) if (t.has(token)) overlap += 1;
    if (!overlap) continue;
    scored.push({ score: overlap * 10 + record.priority / 100, record });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, limit)).map(x => x.record.data);
}

export function buildMemoryContext(query, sourceRecords = [], limit = 5) {
  const memories = recallMemory(query, sourceRecords, limit);
  return {
    memories,
    prompt: memories.length
      ? `RELEVANT VICTOR MEMORY (use only when relevant; newer explicit Founder decisions override older conflicting memory):\n${JSON.stringify(memories)}`
      : 'RELEVANT VICTOR MEMORY: none retrieved for this message.',
  };
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64Utf8(value) {
  const binary = atob(value.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function persistExplicitFounderMemory(env, text, metadata = {}) {
  if (!isExplicitMemoryDirective(text)) return { status: 'NOT_REQUESTED' };
  if (!env.GITHUB_MEMORY_TOKEN) return { status: 'PENDING_CONFIGURATION', reason: 'GITHUB_MEMORY_TOKEN_NOT_CONFIGURED' };

  const owner = env.GITHUB_MEMORY_OWNER || 'vickykenin-lang';
  const repo = env.GITHUB_MEMORY_REPO || 'Dr.-Victor-Multi-AI-Orchestrator';
  const branch = env.GITHUB_MEMORY_BRANCH || 'main';
  const path = 'memory/decisions.jsonl';
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_MEMORY_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Dr-Victor-Memory-Runtime/1.0',
  };

  const current = await fetch(api, { headers });
  if (!current.ok) throw new Error(`memory read HTTP ${current.status}`);
  const payload = await current.json();
  const existing = decodeBase64Utf8(payload.content || '');
  const normalized = String(text).trim();

  const duplicate = existing.split(/\r?\n/).some(line => {
    if (!line.trim()) return false;
    try { return String(JSON.parse(line)?.text || '').trim() === normalized; } catch { return false; }
  });
  if (duplicate) return { status: 'ALREADY_PRESENT' };

  const record = {
    schema_version: 1,
    type: 'founder_directive',
    authority: 'FOUNDER',
    source: 'telegram',
    observed_at: new Date().toISOString(),
    text: normalized,
    chat_id: metadata.chatId ? String(metadata.chatId) : null,
    message_id: metadata.messageId ?? null,
  };
  const next = `${existing.trimEnd()}${existing.trim() ? '\n' : ''}${JSON.stringify(record)}\n`;
  const write = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Persist explicit Founder memory from Victor Telegram',
      content: encodeBase64Utf8(next),
      sha: payload.sha,
      branch,
    }),
  });
  if (write.status === 409) return { status: 'CONFLICT_RETRY_REQUIRED' };
  if (!write.ok) throw new Error(`memory write HTTP ${write.status}`);
  return { status: 'PERSISTED' };
}
