#!/usr/bin/env python3
import json, os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'data' / 'tony_results'
OUT_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED = {'STATUS_CHECK','HEALTH_CHECK','DIAGNOSTIC','REPAIR_PLAN','POST_REPAIR_VERIFY'}

def main():
    task_id = os.getenv('TONY_TASK_ID','').strip()
    task_type = os.getenv('TONY_TASK_TYPE','').strip().upper()
    raw = os.getenv('TONY_TASK_PAYLOAD','{}')
    if not task_id or task_type not in ALLOWED:
        raise SystemExit('INVALID_OR_UNAUTHORIZED_TONY_TASK')
    try:
        payload = json.loads(raw)
    except Exception:
        raise SystemExit('INVALID_TONY_TASK_PAYLOAD_JSON')

    result = {
        'schema_version': 1,
        'message_type': 'TASK_RESULT',
        'sender': 'tony_stark',
        'recipient': 'victor',
        'task_id': task_id,
        'task_type': task_type,
        'observed_at': datetime.now(timezone.utc).isoformat(),
        'execution_status': 'COMPLETED_DIAGNOSTIC',
        'repair_executed': False,
        'destructive_action_performed': False,
        'paid_action_performed': False,
        'strict_supervision': {
            'status': 'ONBOARDING_STRICT',
            'objective_alignment': 'CHECKED_AGAINST_TONY_RELIABILITY_OBJECTIVE',
            'error_or_blocker': None,
            'root_cause': None,
            'solution': 'No repair is executed unless task evidence and authority permit it.',
            'next_action': 'VICTOR_REVIEW_AND_PUSH_NEXT_ACTION',
            'evidence': [],
            'revert_to_victor': True,
            'requires_follow_up': True
        },
        'payload': payload
    }

    if task_type in {'STATUS_CHECK','HEALTH_CHECK'}:
        result['strict_supervision']['solution'] = 'Return current Tony onboarding/runtime status and wait for Victor next action.'
    elif task_type == 'DIAGNOSTIC':
        result['strict_supervision']['error_or_blocker'] = payload.get('error_or_blocker') or 'DIAGNOSTIC_INPUT_REQUIRED'
        result['strict_supervision']['root_cause'] = 'PENDING_EVIDENCE_BASED_ROOT_CAUSE_ANALYSIS'
        result['strict_supervision']['solution'] = 'Collect logs/config/runtime evidence, isolate root cause, then propose least-risk repair.'
    elif task_type == 'REPAIR_PLAN':
        result['strict_supervision']['solution'] = 'Produce governed repair plan only; execution authority must be evaluated separately.'
        result['execution_status'] = 'REPAIR_PLAN_READY'
    elif task_type == 'POST_REPAIR_VERIFY':
        result['strict_supervision']['solution'] = 'Run tests and evidence checks; do not mark closed without verified recovery evidence.'
        result['execution_status'] = 'VERIFICATION_PENDING_EVIDENCE'

    out = OUT_DIR / f'{task_id}.json'
    result['strict_supervision']['evidence'] = [str(out.relative_to(ROOT))]
    out.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
