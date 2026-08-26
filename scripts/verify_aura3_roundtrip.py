#!/usr/bin/env python3
import json, sys
from datetime import datetime, timezone
from pathlib import Path

def main():
    if len(sys.argv) != 2:
        raise SystemExit('usage: verify_aura3_roundtrip.py <aura3-result.json>')
    src=Path(sys.argv[1]); result=json.loads(src.read_text())
    strict=result.get('strict_supervision') or {}
    required_strict=['status','objective_alignment','solution','next_action','evidence','revert_to_victor','requires_follow_up']
    checks={
      'message_type': result.get('message_type')=='TASK_RESULT',
      'sender': result.get('sender')=='aura3',
      'recipient': result.get('recipient')=='victor',
      'task_id': bool(result.get('task_id')),
      'diagnostic_completed': result.get('execution_status') in ('COMPLETED_DIAGNOSTIC','PARTIAL_DIAGNOSTIC','CERTIFICATION_READY'),
      'no_public_action': result.get('public_action_performed') is False,
      'strict_envelope_present': all(k in strict for k in required_strict),
      'objective_alignment_present': bool(strict.get('objective_alignment')),
      'solution_present': bool(strict.get('solution')),
      'next_action_present': bool(strict.get('next_action')),
      'revert_to_victor': strict.get('revert_to_victor') is True,
      'follow_up_declared': strict.get('requires_follow_up') is True,
    }
    ok=all(checks.values())
    ack={
      'schema_version':2,
      'message_type':'EVIDENCE_VERIFIED' if ok else 'EVIDENCE_REJECTED',
      'sender':'victor','recipient':'aura3','task_id':result.get('task_id'),
      'observed_at':datetime.now(timezone.utc).isoformat(),
      'round_trip_verified':ok,
      'supervision_mode':'STRICT',
      'checks':checks,
      'next_action':'VICTOR_REVIEW_AND_PUSH_NEXT_ACTION' if ok else 'REJECT_AND_REQUEST_CORRECTED_REVERT',
      'authority_note':'Victor verification does not bypass Founder-only gates.'
    }
    out=Path('data/aura3_roundtrip_ack.json'); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(ack,indent=2)+'\n')
    print(json.dumps(ack,indent=2)); raise SystemExit(0 if ok else 2)
if __name__=='__main__':main()
