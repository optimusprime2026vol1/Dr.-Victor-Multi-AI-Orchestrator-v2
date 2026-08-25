import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRECEDENCE_VERSION,
  buildTruthSnapshot,
  classifyFounderMessage,
  validateVictorReply,
} from './core_rules.mjs';

const registry = {
  name: 'DEPARTMENT_REGISTRY',
  ok: true,
  text: JSON.stringify({
    departments: [
      { id: 'rio', name: 'RIO', status: 'UNVERIFIED' },
      { id: 'vision', name: 'Vision', status: 'UNVERIFIED' },
    ],
  }),
};

const systemState = {
  name: 'SYSTEM_STATE',
  ok: true,
  text: JSON.stringify({
    overall_state: 'READY_WITH_CONFLICTS',
    decision_rule: 'Victor decisions use this reconciled state; source files remain evidence.',
    victor: { ai_ready: true, provider: 'bedrock_mantle', model: 'qwen.qwen3-coder-next' },
    conflicts: [{ field: 'communications.telegram.configured', resolution: 'runtime_evidence_wins' }],
  }),
};

const telegram = {
  name: 'TELEGRAM_RUNTIME_STATUS',
  ok: true,
  text: JSON.stringify({ state: 'VICTOR_TELEGRAM_VERIFIED', checked_at_utc: '2026-08-25T10:58:33+00:00' }),
};

function snapshot() {
  return buildTruthSnapshot([systemState, registry, telegram], {
    telegramWebhookAuthenticated: true,
    telegramMessageReceivedNow: true,
  });
}

test('precedence version is deterministic v2', () => {
  assert.equal(PRECEDENCE_VERSION, 'DOMAIN_PRECEDENCE_V2');
});

test('classifies system queries', () => {
  assert.equal(classifyFounderMessage('RIO ka current status kya hai?'), 'SYSTEM_QUERY');
});

test('classifies consequential action request', () => {
  assert.equal(classifyFounderMessage('Vision ko pause karo'), 'ACTION_REQUEST');
});

test('department registry UNVERIFIED never becomes verified connectivity', () => {
  const truth = snapshot();
  assert.equal(truth.departments[0].registry_status, 'UNVERIFIED');
  assert.equal(truth.departments[0].victor_connection, 'NOT_VERIFIED');
  assert.equal(truth.departments[0].live_certification, 'NOT_VERIFIED');
});

test('rejects Victor as single source of truth', () => {
  const result = validateVictorReply('Main system ka single source of truth hoon.', 'IDENTITY_QUERY', snapshot());
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('VICTOR_SELF_TRUTH_SOURCE_CLAIM'));
});

test('rejects stale fixed five minute heartbeat', () => {
  const result = validateVictorReply('Mera heartbeat 5-minute heartbeat hai.', 'SYSTEM_QUERY', snapshot());
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('STALE_FIXED_5_MIN_HEARTBEAT'));
});

test('rejects all-department connected claim without evidence', () => {
  const result = validateVictorReply('All departments are connected and supervised live.', 'SYSTEM_QUERY', snapshot());
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('UNVERIFIED_ALL_DEPARTMENT_CONNECTIVITY'));
});

test('rejects current RIO live claim without verified evidence', () => {
  const result = validateVictorReply('RIO is live and ready.', 'SYSTEM_QUERY', snapshot());
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('DEPARTMENT_CURRENT_STATE_WITHOUT_VERIFIED_EVIDENCE'));
});

test('rejects execution success claim from Telegram action path', () => {
  const result = validateVictorReply('Vision paused successfully.', 'ACTION_REQUEST', snapshot());
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('UNVERIFIED_EXECUTION_CLAIM'));
});

test('accepts evidence-honest department answer', () => {
  const result = validateVictorReply(
    'RIO ka current Victor connection NOT VERIFIED hai. Registry status UNVERIFIED hai; fresh communication certification evidence available nahi hai.',
    'SYSTEM_QUERY',
    snapshot(),
  );
  assert.equal(result.ok, true);
});

test('accepts current adaptive heartbeat rule', () => {
  const result = validateVictorReply(
    'Current locked heartbeat default 60 minutes hai, adaptive ladder 60→30→15→10→5→3→2 hai, minimum 2 minutes.',
    'SYSTEM_QUERY',
    snapshot(),
  );
  assert.equal(result.ok, true);
});
