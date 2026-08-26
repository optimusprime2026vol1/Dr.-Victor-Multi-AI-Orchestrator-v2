import test from 'node:test';
import assert from 'node:assert/strict';

import {
  selectTonyTaskType,
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

test('accepts only a complete strict Tony revert envelope', () => {
  const taskId = 'victor-tony-test-1';
  const result = {
    message_type: 'TASK_RESULT',
    sender: 'tony_stark',
    recipient: 'victor',
    task_id: taskId,
    destructive_action_performed: false,
    paid_action_performed: false,
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
