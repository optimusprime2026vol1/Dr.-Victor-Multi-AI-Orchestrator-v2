import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMemoryContext,
  isExplicitMemoryDirective,
  recallMemory,
  resolveFounderEntityQuery,
} from './memory_runtime.mjs';

const sources = [
  {
    name: 'FOUNDER_MEMORY', ok: true,
    text: JSON.stringify({ communication: { telegram: { formatting: 'simple', bold: false, emphasis: 'inverted_commas' } } }),
  },
  {
    name: 'DECISIONS', ok: true,
    text: [
      JSON.stringify({ type: 'founder_directive', text: 'Telegram formatting simple rakho, bold mat karo.' }),
      JSON.stringify({ type: 'founder_locked_decision', priority: 'critical', summary: 'Bare AURA means AURA3; only explicit AURA2 means AURA2.' }),
    ].join('\n'),
  },
  {
    name: 'OPERATIONAL_MEMORY', ok: true,
    text: JSON.stringify({ event: 'drive_sync', status: 'PASS' }),
  },
];

test('detects explicit Founder memory directives including record karo', () => {
  assert.equal(isExplicitMemoryDirective('Filhal k liye lock karo'), true);
  assert.equal(isExplicitMemoryDirective('Isko yaad rakho'), true);
  assert.equal(isExplicitMemoryDirective('record karo- aura 2 hold me rakho'), true);
  assert.equal(isExplicitMemoryDirective('Status batao'), false);
});

test('bare AURA deterministically resolves to AURA3', () => {
  assert.deepEqual(resolveFounderEntityQuery('aura ka status kya hai').entity_id, 'aura3');
});

test('explicit AURA2 resolves to AURA2', () => {
  assert.deepEqual(resolveFounderEntityQuery('aura 2 ka status batao').entity_id, 'aura2');
});

test('recalls relevant communication memory', () => {
  const result = recallMemory('Telegram formatting bold kaise karna hai?', sources, 3);
  assert.ok(result.length >= 1);
  assert.match(JSON.stringify(result), /telegram|bold|format/i);
});

test('memory context does not invent unrelated records', () => {
  const result = buildMemoryContext('weather in Delhi', sources, 3);
  assert.equal(result.memories.length, 0);
  assert.match(result.prompt, /none retrieved/i);
});
