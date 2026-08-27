import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTONOMY_CRONS,
  autonomyConfigured,
  buildAutonomyEvidence,
  classifyAutonomyResult,
  selectAutonomyTarget,
} from './autonomy_runtime.mjs';

test('autonomy rotates departments deterministically', () => {
  assert.equal(selectAutonomyTarget(0), 'tony_stark');
  assert.equal(selectAutonomyTarget(2 * 60 * 60 * 1000), 'rio');
  assert.equal(selectAutonomyTarget(4 * 60 * 60 * 1000), 'aura3');
});

test('verified live cycle creates persistent certification evidence', () => {
  const state = buildAutonomyEvidence(
    { last_verified_cycle: null },
    { status: 'CYCLE_VERIFIED', target: 'rio', result: { taskId: 'task-1', evidenceReceived: true } },
    { cron: '0 */2 * * *' },
    '2026-08-27T18:00:00.000Z',
  );
  assert.equal(state.runtime_status, 'AUTONOMOUS_CYCLE_VERIFIED');
  assert.equal(state.last_verified_cycle.task_id, 'task-1');
  assert.equal(state.last_cycle_attempt.status, 'CYCLE_VERIFIED');
});

test('autonomy requires all existing bindings', () => {
  assert.equal(autonomyConfigured({}), false);
  assert.equal(autonomyConfigured({
    GITHUB_ORCHESTRATION_TOKEN: 'present',
    TELEGRAM_BOT_TOKEN_VICTOR: 'present',
    VICTOR_FOUNDER_CHAT_ID: 'present',
  }), true);
});

test('founder-only gate is escalated', () => {
  const assessment = classifyAutonomyResult({
    strict_supervision: {
      status: 'BLOCKED',
      error_or_blocker: 'FOUNDER_APPROVAL_REQUIRED',
      next_action: 'FOUNDER_REVIEW',
      evidence: ['audit.json'],
      requires_follow_up: true,
    },
  });
  assert.equal(assessment.founderGate, true);
  assert.equal(assessment.verifiedSuccess, false);
  assert.equal(assessment.hasBlocker, true);
});

test('verified completion is a success signal', () => {
  const assessment = classifyAutonomyResult({
    strict_supervision: {
      status: 'OBJECTIVE_MET_VERIFIED',
      error_or_blocker: null,
      next_action: 'CLOSE',
      evidence: ['result.json'],
      requires_follow_up: false,
    },
  });
  assert.equal(assessment.verifiedSuccess, true);
  assert.equal(assessment.founderGate, false);
});

test('cron expressions remain locked to supervision and 10 PM IST report', () => {
  assert.deepEqual(AUTONOMY_CRONS, {
    SUPERVISION_CRON: '0 */2 * * *',
    DAILY_REPORT_CRON: '30 16 * * *',
  });
});
