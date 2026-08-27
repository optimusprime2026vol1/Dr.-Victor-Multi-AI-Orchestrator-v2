import test from 'node:test';
import assert from 'node:assert/strict';

import {
  selectTonyTaskType,
  buildTonyTaskPayload,
  shouldContactTony,
  verifyTonyResult,
} from './department_bridge.mjs';

const entity = { entity_id: 'tony_stark' };

test('routes Tony strict onboarding probe to status check', () => {
  assert.equal(selectTonyTaskType('Tony onboarding strict supervision check karo'), 'STATUS_CHECK');
  assert.equal(shouldContactTony('Tony onboarding status check karo', entity), true);
});

test('routes evidence-based diagnostic and repair requests', () => {
  assert.equal(selectTonyTaskType('Tony error ka root cause diagnose karo'), 'DIAGNOSTIC');
  assert.equal(selectTonyTaskType('Tony repair plan do'), 'REPAIR_PLAN');
  assert.equal(selectTonyTaskType('post-repair recovery verify karo'), 'POST_REPAIR_VERIFY');
});

test('routes governed engineering tasks with fail-closed metadata', () => {
  const text = 'Tony RIO repository inspect karke bridge upgrade implement karo';
  assert.equal(selectTonyTaskType(text), 'TASK_REQUEST');
  assert.equal(shouldContactTony(text, entity), true);
  const payload = buildTonyTaskPayload(text);
  assert.equal(payload.target_repository, 'vickykenin-lang/rio-affiliate-engine');
  assert.equal(payload.authority.maximum_level, 'L2');
  assert.equal(payload.authority.production_activation_authorized, false);
  assert.ok(payload.prohibited_actions.includes('PRODUCTION_DEPLOYMENT'));
  assert.ok(payload.evidence_requirements.includes('TEST_RESULTS'));
});

test('accepts only a complete strict Tony revert envelope', () => {
  const taskId = 'victor-tony-test-1';
  const result = {
    message_type: 'TASK_RESULT',
    sender: 'tony_stark',
    recipient: 'victor',
    task_id: taskId,
    destructive_action_performed: false,
    paid_action_performed: false,
    production_action_performed: false,
    strict_supervision: {
      status: 'ONBOARDING_STRICT',
      objective_alignment: 'CHECKED',
      solution: 'No unauthorized repair.',
      next_action: 'VICTOR_REVIEW',
      evidence: ['data/tony_results/victor-tony-test-1.json'],
      revert_to_victor: true,
      requires_follow_up: true,
    },
  };
  assert.equal(verifyTonyResult(result, taskId).ok, true);
  result.strict_supervision.evidence = [];
  assert.equal(verifyTonyResult(result, taskId).ok, false);
});
