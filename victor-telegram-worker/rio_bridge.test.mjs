import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRioTaskType, shouldContactRio, verifyRioResult } from './department_bridge.mjs';

const entity = { entity_id: 'rio' };
test('routes RIO governed requests', () => {
  assert.equal(selectRioTaskType('RIO bridge strict round-trip check karo'), 'STRICT_SUPERVISION_PROBE');
  assert.equal(selectRioTaskType('RIO objective governance check karo'), 'GOVERNANCE_CHECK');
  assert.equal(selectRioTaskType('RIO next priority batao'), 'PRIORITY_CHECK');
  assert.equal(shouldContactRio('RIO status check karo', entity), true);
});
test('accepts only complete safe RIO revert', () => {
  const taskId = 'victor-rio-test-1';
  const result = { message_type: 'TASK_RESULT', sender: 'rio', recipient: 'victor', task_id: taskId, public_action_performed: false, objective_changed: false, credential_transfer_performed: false, strict_supervision: { status: 'REPORTING_CONNECTED', objective_alignment: 'CHECKED', solution: 'Report only', next_action: 'VICTOR_REVIEW', evidence: ['data/status.json'], revert_to_victor: true, requires_follow_up: false } };
  assert.equal(verifyRioResult(result, taskId).ok, true);
  result.objective_changed = true;
  assert.equal(verifyRioResult(result, taskId).ok, false);
});
