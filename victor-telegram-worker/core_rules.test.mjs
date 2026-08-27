import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRECEDENCE_VERSION,
  buildTruthSnapshot,
  classifyFounderMessage,
  validateVictorReply,
} from './core_rules.mjs';

const registry = {
  name: 'DEPARTMENT_REGISTRY', ok: true,
  text: JSON.stringify({ departments: [
    { id: 'aura2', name: 'AURA2', status: 'ACTIVE', enabled: true },
    { id: 'aura3', name: 'AURA 3.0', status: 'ONBOARDING' },
    { id: 'rio', name: 'RIO', status: 'UNVERIFIED' },
    { id: 'vision', name: 'Vision', status: 'UNVERIFIED' },
    { id: 'hulk', name: 'Hulk', status: 'ONBOARDING_RND' },
  ] }),
};

const systemState = {
  name: 'SYSTEM_STATE', ok: true,
  text: JSON.stringify({
    overall_state: 'READY_WITH_CONFLICTS',
    decision_rule: 'Reconciled state.',
    victor: { ai_ready: true, provider: 'bedrock_mantle', model: 'qwen.qwen3-coder-next' },
    conflicts: [{ field: 'communications.telegram.configured', resolution: 'runtime_evidence_wins' }],
  }),
};

const telegram = {
  name: 'TELEGRAM_RUNTIME_STATUS', ok: true,
  text: JSON.stringify({ state: 'VICTOR_TELEGRAM_VERIFIED', checked_at_utc: '2026-08-25T10:58:33+00:00' }),
};

const decisions = {
  name: 'DECISIONS', ok: true,
  text: [
    JSON.stringify({ id: 'aura2-hold', status: 'active', priority: 'critical', summary: 'AURA2 is in HOLD category until Founder changes it.' }),
    JSON.stringify({ id: 'rio-parked', status: 'active', priority: 'critical', summary: 'RIO remains PARKED until Founder activation.' }),
    JSON.stringify({ id: 'hulk-rnd', status: 'active', priority: 'critical', summary: 'HULK is the online business R&D department; first seed topic is automated Instagram motivational quote image posting.' }),
    JSON.stringify({ id: 'old-aura2', status: 'superseded', summary: 'AURA2 is active.' }),
  ].join('\n'),
};

function snapshot(extra = {}) {
  return buildTruthSnapshot([systemState, registry, telegram, decisions], {
    telegramWebhookAuthenticated: true,
    telegramMessageReceivedNow: true,
    ...extra,
  });
}

test('precedence version is deterministic v5', () => {
  assert.equal(PRECEDENCE_VERSION, 'DOMAIN_PRECEDENCE_V5');
});

test('classifies system queries', () => {
  assert.equal(classifyFounderMessage('RIO ka current status kya hai?'), 'SYSTEM_QUERY');
});

test('classifies consequential action request', () => {
  assert.equal(classifyFounderMessage('Vision ko pause karo'), 'ACTION_REQUEST');
});

test('active Founder decision overrides stale registry state', () => {
  const truth = snapshot();
  const aura2 = truth.departments.find(d => d.id === 'aura2');
  const rio = truth.departments.find(d => d.id === 'rio');
  assert.equal(aura2.registry_status, 'HOLD');
  assert.equal(aura2.enabled, false);
  assert.equal(rio.registry_status, 'PARKED');
  assert.equal(aura2.effective_state_source, 'ACTIVE_FOUNDER_DECISION');
});

test('department registry presence does not invent verified connectivity', () => {
  const truth = snapshot();
  const rio = truth.departments.find(d => d.id === 'rio');
  assert.equal(rio.victor_connection, 'NOT_VERIFIED');
  assert.equal(rio.live_certification, 'NOT_VERIFIED');
});

test('resolved department gets only relevant Founder decisions', () => {
  const truth = snapshot({ resolvedDepartmentId: 'hulk', resolvedDepartmentName: 'HULK', entityResolutionReason: 'EXPLICIT_HULK' });
  assert.equal(truth.resolved_department.id, 'hulk');
  assert.equal(truth.resolved_department_decisions.length, 1);
  assert.match(JSON.stringify(truth.resolved_department_decisions), /motivational quote/i);
  assert.doesNotMatch(JSON.stringify(truth.resolved_department_decisions), /AURA2|RIO remains PARKED/i);
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

test('rejects stale AURA2 active claim', () => {
  const result = validateVictorReply('AURA2 is active primary production department.', 'SYSTEM_QUERY', snapshot());
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('AURA2_HOLD_VIOLATION'));
});

test('rejects stale RIO active claim while parked', () => {
  const result = validateVictorReply('RIO is active production system.', 'SYSTEM_QUERY', snapshot());
  assert.equal(result.ok, false);
  assert.ok(result.violations.includes('RIO_PARKED_VIOLATION'));
});

test('rejects Victor as single source of truth', () => {
  assert.equal(validateVictorReply('Main system ka single source of truth hoon.', 'IDENTITY_QUERY', snapshot()).ok, false);
});

test('rejects all-department connected claim without evidence', () => {
  assert.equal(validateVictorReply('All departments are connected and supervised live.', 'SYSTEM_QUERY', snapshot()).ok, false);
});

test('rejects execution success claim from non-executor action path', () => {
  assert.equal(validateVictorReply('Vision paused successfully.', 'ACTION_REQUEST', snapshot()).ok, false);
});

test('accepts evidence-honest department answer', () => {
  assert.equal(validateVictorReply('RIO ka current Victor connection NOT VERIFIED hai.', 'SYSTEM_QUERY', snapshot()).ok, true);
});
