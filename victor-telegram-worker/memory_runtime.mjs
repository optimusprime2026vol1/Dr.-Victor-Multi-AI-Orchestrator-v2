const MEMORY_STOP = new Set(['the','a','an','is','are','to','of','and','or','in','on','for','me','my','ka','ki','ke','ko','hai','he','kya','aur','se','ye','vo','main','mujhe','this','that','it']);
const LOCK_PATTERNS = [
  /\b(remember|save|store)\s+(this|it|this\s+decision|this\s+rule|this\s+instruction)\b/i,
  /\b(yaad\s+rakh(?:o)?|save\s+kar(?:o)?|store\s+kar(?:o)?|lock\s+kar(?:o)?|record\s+kar(?:o)?)\b/i,
  /\b(lock|record)\s+(this|it|this\s+decision|this\s+rule|this\s+instruction)\b/i,
];

export function memoryTokens(text) {
  return new Set(String(text || '').toLowerCase().match(/[a-z0-9_]+/g)?.filter(x => x.length > 1 && !MEMORY_STOP.has(x)) || []);
}

export function isExplicitMemoryDirective(text) {
  const value = String(text || '').trim();
  return Boolean(value) && LOCK_PATTERNS.some(rx => rx.test(value));
}

// Founder-locked (1 Sep 2026): Victor should build memory the way a normal AI
// assistant does -- automatically noticing durable facts, preferences and
// decisions from ordinary conversation -- not only when the Founder says the
// magic word ("yaad rakho"/"save karo"). This is a lower-confidence signal
// than an explicit directive, so it is written to operational memory
// (priority: normal, class: auto) rather than the founder_directive/critical
// lane, and it never overrides an explicit Founder decision.
const AUTO_MEMORY_SIGNALS = [
  /\b(mera|meri|mere|hamara|hamari|my)\s+(number|budget|address|email|deadline|preference|rule|style|target|goal)\b/i,
  /\b(hamesha|always|kabhi\s*(bhi)?\s*nahi|never|by\s*default|default\s+rule)\b/i,
  /\b(decide\s+kiya|decided|finalize\s+kar|finalized|final\s+kar\s+diya|confirm\s+kiya|confirmed|ab\s+se|from\s+now\s+on|going\s+forward)\b/i,
  /\b(objective|target|goal|deadline|budget)\s+(hai|is|set\s+hai|rakho|rakhna)\b/i,
  /\b(mujhe|main)\s+(pasand|chahiye|nahi\s+chahiye)\b/i,
];

export function detectAutoMemorySignal(text) {
  const value = String(text || '').trim();
  if (value.length < 8) return false;
  if (isExplicitMemoryDirective(value)) return false; // already handled by the explicit, higher-priority path
  return AUTO_MEMORY_SIGNALS.some(rx => rx.test(value));
}

export function resolveFounderEntityQuery(text) {
  const normalized = String(text || '').toLowerCase().replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (/\brio\b/.test(normalized)) return { matched: true, entity_id: 'rio', canonical_name: 'RIO', reason: 'EXPLICIT_RIO' };
  if (/\baura\s*2\b/.test(normalized)) return { matched: true, entity_id: 'aura2', canonical_name: 'AURA2', reason: 'EXPLICIT_AURA2' };
  if (/\baura\s*3\b/.test(normalized) || /\baura\b/.test(normalized)) return { matched: true, entity_id: 'aura3', canonical_name: 'AURA3', reason: 'FOUNDER_BARE_AURA_ALIAS' };
  if (/\btony(?:\s+stark)?\b/.test(normalized)) return { matched: true, entity_id: 'tony_stark', canonical_name: 'Tony Stark', reason: 'EXPLICIT_TONY_STARK' };
  if (/\bhulk\b/.test(normalized)) return { matched: true, entity_id: 'hulk', canonical_name: 'HULK', reason: 'EXPLICIT_HULK' };
  if (/\bvision\b/.test(normalized)) return { matched: true, entity_id: 'vision', canonical_name: 'Vision', reason: 'EXPLICIT_VISION' };
  return { matched: false, entity_id: null, canonical_name: null, reason: null };
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
    const layered = {
      LONG_TERM_MEMORY: ['long_term', 88],
      ACTIVE_PROJECTS_MEMORY: ['active_projects', 84],
      WORKING_MEMORY: ['working', 80],
      LEARNINGS_MEMORY: ['learning', 76],
      ACTIVITY_MEMORY: ['activity', 60],
      MEMORY_INDEX_MD: ['index', 50],
    };
    if (layered[source.name]) {
      const [cls, priority] = layered[source.name];
      records.push({
        class: cls,
        priority,
        data: { type: cls, source: source.name, content: source.text },
        text: source.text,
      });
    }
  }
  return records;
}

export function activeFounderDecisions(sourceRecords = []) {
  return parseMemorySources(sourceRecords)
    .filter(record => record.class === 'decision' && String(record.data?.status || 'active').toLowerCase() === 'active')
    .map(record => record.data);
}

export function recallMemory(query, sourceRecords = [], limit = 5) {
  const q = memoryTokens(query);
  const scored = [];
  for (const record of parseMemorySources(sourceRecords)) {
    const t = memoryTokens(record.text);
    let overlap = 0;
    for (const token of q) if (t.has(token)) overlap += 1;
    if (!overlap) continue;
    const criticalBoost = String(record.data?.priority || '').toLowerCase() === 'critical' ? 5 : 0;
    const activeBoost = String(record.data?.status || 'active').toLowerCase() === 'active' ? 2 : -10;
    scored.push({ score: overlap * 10 + record.priority / 100 + criticalBoost + activeBoost, record });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, limit)).map(x => x.record.data);
}

export function buildMemoryContext(query, sourceRecords = [], limit = 5) {
  const memories = recallMemory(query, sourceRecords, limit);
  const active = activeFounderDecisions(sourceRecords);
  return {
    memories,
    activeFounderDecisions: active,
    prompt: memories.length
      ? `RELEVANT VICTOR MEMORY (use only when relevant; active newer explicit Founder decisions override older conflicting memory):\n${JSON.stringify(memories)}\nACTIVE FOUNDER DECISIONS:\n${JSON.stringify(active)}`
      : `RELEVANT VICTOR MEMORY: none retrieved for this message.\nACTIVE FOUNDER DECISIONS still govern current truth:\n${JSON.stringify(active)}`,
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

function memoryHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_MEMORY_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Dr-Victor-Memory-Runtime/2.0',
  };
}

async function readCurrentMemory(api, headers) {
  const current = await fetch(api, { headers, cache: 'no-store' });
  if (!current.ok) return { ok: false, status: current.status, reason: `MEMORY_READ_HTTP_${current.status}` };
  const payload = await current.json();
  return { ok: true, payload };
}

function recordMatches(line, normalized, messageId) {
  if (!line.trim()) return false;
  try {
    const item = JSON.parse(line);
    if (messageId != null && item?.message_id === messageId) return true;
    return String(item?.text || item?.summary || '').trim().toLowerCase() === normalized.toLowerCase();
  } catch { return false; }
}

async function appendMemoryRecord(env, path, record, metadata, commitMessage) {
  if (!env.GITHUB_MEMORY_TOKEN) return { status: 'PENDING_CONFIGURATION', stage: 'CONFIG', reason: 'GITHUB_MEMORY_TOKEN_NOT_CONFIGURED' };

  const owner = env.GITHUB_MEMORY_OWNER || 'vickykenin-lang';
  const repo = env.GITHUB_MEMORY_REPO || 'Dr.-Victor-Multi-AI-Orchestrator';
  const branch = env.GITHUB_MEMORY_BRANCH || 'main';
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const headers = memoryHeaders(env);
  const normalized = String(record.text).trim();

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const current = await readCurrentMemory(api, headers);
    if (!current.ok) return { status: 'FAILED', stage: 'READ', http_status: current.status, reason: current.reason };

    const payload = current.payload;
    const existing = decodeBase64Utf8(payload.content || '');
    if (existing.split(/\r?\n/).some(line => recordMatches(line, normalized, metadata.messageId ?? null))) {
      return { status: 'ALREADY_PRESENT', verified: true };
    }

    const next = `${existing.trimEnd()}${existing.trim() ? '\n' : ''}${JSON.stringify(record)}\n`;
    const write = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: commitMessage, content: encodeBase64Utf8(next), sha: payload.sha, branch }),
    });

    if (write.ok) {
      const verify = await readCurrentMemory(api, headers);
      if (!verify.ok) return { status: 'FAILED', stage: 'VERIFY_READ', http_status: verify.status, reason: verify.reason, attempt };
      const verifiedText = decodeBase64Utf8(verify.payload.content || '');
      const found = verifiedText.split(/\r?\n/).some(line => recordMatches(line, normalized, metadata.messageId ?? null));
      if (!found) return { status: 'FAILED', stage: 'READ_BACK_VERIFY', reason: 'MEMORY_RECORD_NOT_FOUND_AFTER_WRITE', attempt };
      return { status: 'PERSISTED', stage: 'READ_BACK_VERIFY', verified: true, attempt };
    }

    if ((write.status === 409 || write.status === 422) && attempt < 3) continue;
    return {
      status: write.status === 409 || write.status === 422 ? 'CONFLICT_RETRY_REQUIRED' : 'FAILED',
      stage: 'WRITE', http_status: write.status, reason: `MEMORY_WRITE_HTTP_${write.status}`, attempt,
    };
  }
  return { status: 'CONFLICT_RETRY_REQUIRED', stage: 'WRITE', reason: 'MEMORY_WRITE_CONFLICT_RETRY_EXHAUSTED' };
}

export async function persistExplicitFounderMemory(env, text, metadata = {}) {
  if (!isExplicitMemoryDirective(text)) return { status: 'NOT_REQUESTED' };
  const normalized = String(text).trim();
  const record = {
    schema_version: 2,
    type: 'founder_directive',
    authority: 'FOUNDER',
    priority: 'critical',
    status: 'active',
    source: 'telegram',
    observed_at: new Date().toISOString(),
    text: normalized,
    chat_id: metadata.chatId ? String(metadata.chatId) : null,
    message_id: metadata.messageId ?? null,
  };
  return appendMemoryRecord(env, 'memory/decisions.jsonl', record, metadata, 'Persist explicit Founder memory from Victor Telegram');
}

// Auto-captured memory: same durability mechanism as an explicit directive,
// but written to operational memory at normal priority instead of the
// critical founder_directive lane, and it can be superseded by any later
// explicit Founder decision. This is what lets Victor "just remember" things
// the way a normal conversation partner would, without the Founder having to
// say "yaad rakho" every time.
export async function persistAutoFounderMemory(env, text, metadata = {}) {
  if (!detectAutoMemorySignal(text)) return { status: 'NOT_APPLICABLE' };
  const normalized = String(text).trim();
  const record = {
    schema_version: 1,
    type: 'auto_captured',
    authority: 'INFERRED_FROM_CONVERSATION',
    priority: 'normal',
    status: 'active',
    source: 'telegram',
    observed_at: new Date().toISOString(),
    text: normalized,
    chat_id: metadata.chatId ? String(metadata.chatId) : null,
    message_id: metadata.messageId ?? null,
  };
  return appendMemoryRecord(env, 'memory/operational_memory.jsonl', record, metadata, 'Auto-capture Founder conversational memory from Victor Telegram');
}
