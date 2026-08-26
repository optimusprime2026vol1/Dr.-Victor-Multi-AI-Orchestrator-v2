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
      { id: 'aura2', name: 'AURA2', status: 'HOLD', enabled: false },
      { id: 'aura3', name: 'AURA 3.0', status: 'ONBOARDING' },
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

function snapshot(extra = {}) {
  return buildTruthSnapshot([systemState, registry, telegram], {
    telegramWebhookAuthenticated: true,
    telegramMessageReceivedNow: true,
    ...extra,
  });
}

test('precedence version is deterministic v3', () => {
  assert.equal(PRECEDENCE_VERSION, 'DOMAIN_PRECEDENCE_V3');
});

test('classifies system queries', () => {
  assert.equal(classifyFounderMessage('RIO ka current status kya hai?'), 'SYSTEM_QUERY');
});

test('classifies consequential action request', () => {
  assert.equal(classifyFounderMessage('Vision ko pause karo'), 'ACTION_REQUEST');
});

test('department registry status never becomes verified connectivity', () => {
  const truth = snapshot();
  const rio = truth.departments.find(d => d.id === 'rio');
  assert.equal(rio.registry_status, 'UNVERIFIED');
  assert.equal(rio.victor_connection, 'NOT_VERIFIED');
  assert.equal(rio.live_certification, 'NOT_VERIFIED');
});

test('resolved AURA3 target is exposed in truth snapshot', () => {
  const truth = snapshot({ resolvedDepartmentId: 'aura3', resolvedDepartmentName: 'AURA3', entityResolutionReason: 'FOUNDER_BARE_AURA_ALIAS' });
  assert.equal(truth.request_facts.resolved_department_id, 'aura3');
  assert.equal(truth.resolved_department.id, 'aura3');
});

test('rejects AURA2 answer when bare AURA resolved to AURA3', () => {
  const truth = snapshot({ resolvedDepartmentId: 'aura3', resolvedDepartmentName: 'AURA3', entityResolutionReason: 'FOUNDER_BARE_AURA_ALIAS' });
  const result = validateVictorReply('AURA2 ka status HOLD hai.', 'SYSTEM_QUERY', truth);
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('WRONG_AURA_ALIAS_TARGET'));
});

test('rejects Victor as single source of truth', () => {
  const result = validateVictorReply('Main system ka single source of truth hoon.', 'IDENTITY_QUERY', snapshot());
  assert.equal(result.ok, false);
});

test('rejects all-department connected claim without evidence', () => {
  const result = validateVictorReply('All departments are connected and supervised live.', 'SYSTEM_QUERY', snapshot());
  assert.equal(result.ok, false);
});

test('rejects execution success claim from Telegram action path', () => {
  const result = validateVictorReply('Vision paused successfully.', 'ACTION_REQUEST', snapshot());
  assert.equal(result.ok, false);
});

test('accepts evidence-honest department answer', () => {
  const result = validateVictorReply('RIO ka current Victor connection NOT VERIFIED hai.', 'SYSTEM_QUERY', snapshot());
  assert.equal(result.ok, true);
});
