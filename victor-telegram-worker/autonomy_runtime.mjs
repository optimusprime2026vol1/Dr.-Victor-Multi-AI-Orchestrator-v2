import {
  aura3BridgeConfigured,
  dispatchAura3Task,
  waitForAura3Result,
  verifyAura3Result,
  tonyBridgeConfigured,
  dispatchTonyTask,
  waitForTonyResult,
  verifyTonyResult,
  rioBridgeConfigured,
  dispatchRioTask,
  waitForRioResult,
  verifyRioResult,
} from './department_bridge.mjs';

const TELEGRAM_API = 'https://api.telegram.org';
const SUPERVISION_CRON = '0 */2 * * *';
const DAILY_REPORT_CRON = '30 16 * * *';

export function selectAutonomyTarget(scheduledTime) {
  const twoHourBucket = Math.floor(Number(scheduledTime) / (2 * 60 * 60 * 1000));
  return ['tony_stark', 'rio', 'aura3'][twoHourBucket % 3];
}

export function classifyAutonomyResult(result) {
  const strict = result?.strict_supervision || {};
  const status = String(strict.status || result?.execution_status || 'UNKNOWN').toUpperCase();
  const blocker = strict.error_or_blocker ?? result?.blockers ?? null;
  const hasBlocker = Boolean(
    (Array.isArray(blocker) && blocker.length) ||
    (!Array.isArray(blocker) && blocker && !/^none|no blocker|null$/i.test(String(blocker)))
  );
  const founderGate = /FOUNDER|APPROVAL|CREDENTIAL|PAID|PRODUCTION|PUBLIC|LEGAL|SECURITY/.test(
    [status, strict.next_action, blocker].flat().filter(Boolean).join(' ').toUpperCase()
  );
  const verifiedSuccess = /OBJECTIVE_MET|COMPLETED|VERIFIED|PASS|HEALTHY|READY/.test(status)
    && !/PENDING|NOT_VERIFIED|SAFE_STOP|BLOCKED|FAILED/.test(status);
  return {
    status,
    hasBlocker,
    founderGate,
    verifiedSuccess,
    requiresFollowUp: strict.requires_follow_up === true,
    nextAction: strict.next_action || 'NOT_PROVIDED',
    evidence: Array.isArray(strict.evidence) ? strict.evidence : [],
  };
}

export function autonomyConfigured(env) {
  return Boolean(
    env.GITHUB_ORCHESTRATION_TOKEN &&
    env.TELEGRAM_BOT_TOKEN_VICTOR &&
    env.VICTOR_FOUNDER_CHAT_ID
  );
}

export async function runAutonomousCycle(controller, env) {
  if (!autonomyConfigured(env)) {
    throw new Error('AUTONOMY_REQUIRED_BINDINGS_NOT_CONFIGURED');
  }

  if (controller.cron === DAILY_REPORT_CRON) {
    const checks = await Promise.all([
      superviseTarget('tony_stark', env),
      superviseTarget('rio', env),
      superviseTarget('aura3', env),
    ]);
    const escalations = checks.filter(x => !x.verified || x.assessment.founderGate);
    const successes = checks.filter(x => x.verified && x.assessment.verifiedSuccess);
    const lines = [
      'Victor daily autonomous report',
      `Organization supervision: ${checks.filter(x => x.verified).length}/3 fresh reverts verified`,
      `Verified success signals: ${successes.length}`,
      `Founder escalations: ${escalations.length}`,
    ];
    if (escalations.length) {
      lines.push('Action required: ' + escalations.map(x => `${x.target}: ${x.assessment.status}`).join(', '));
    } else {
      lines.push('Aapko abhi koi action nahi lena.');
    }
    await sendFounder(env, lines.join('\n'));
    return { status: 'DAILY_REPORT_SENT', checks };
  }

  if (controller.cron !== SUPERVISION_CRON) {
    return { status: 'IGNORED_UNKNOWN_CRON', cron: controller.cron };
  }

  const target = selectAutonomyTarget(controller.scheduledTime);
  const result = await superviseTarget(target, env);
  if (!result.verified || result.assessment.founderGate) {
    await sendFounder(
      env,
      [
        'Victor escalation',
        `Department: ${target}`,
        `Status: ${result.assessment.status}`,
        `Required: ${result.assessment.nextAction}`,
        'Evidence verify hue bina success claim nahi kiya gaya.',
      ].join('\n')
    );
  }
  return { status: result.verified ? 'CYCLE_VERIFIED' : 'SAFE_STOP', target, result };
}

async function superviseTarget(target, env) {
  let dispatch;
  let received;
  let verification;

  if (target === 'tony_stark') {
    if (!tonyBridgeConfigured(env)) throw new Error('TONY_BRIDGE_NOT_CONFIGURED');
    dispatch = await dispatchTonyTask(env, 'Tony Stark autonomous STATUS_CHECK. No production, paid, destructive, credential or external action.', { messageId: 'auto' });
    received = await waitForTonyResult(dispatch.taskId, env, { attempts: 30, delayMs: 5000 });
    verification = received.status === 'RESULT_RECEIVED'
      ? verifyTonyResult(received.result, dispatch.taskId)
      : { ok: false };
  } else if (target === 'rio') {
    if (!rioBridgeConfigured(env)) throw new Error('RIO_BRIDGE_NOT_CONFIGURED');
    dispatch = await dispatchRioTask(env, 'RIO autonomous GOVERNANCE_CHECK. RIO remains PARKED. No production, posting, credential, objective or external action.', { messageId: 'auto' });
    received = await waitForRioResult(dispatch.taskId, { attempts: 30, delayMs: 5000 });
    verification = received.status === 'RESULT_RECEIVED'
      ? verifyRioResult(received.result, dispatch.taskId)
      : { ok: false };
  } else {
    if (!aura3BridgeConfigured(env)) throw new Error('AURA3_BRIDGE_NOT_CONFIGURED');
    dispatch = await dispatchAura3Task(env, 'AURA3 autonomous STATUS_CHECK under strict supervision. No production, paid, publishing, credential or external action.', { messageId: 'auto' });
    received = await waitForAura3Result(dispatch.taskId, { attempts: 30, delayMs: 5000 });
    verification = received.status === 'RESULT_RECEIVED'
      ? verifyAura3Result(received.result, dispatch.taskId)
      : { ok: false };
  }

  const result = received.result || {};
  return {
    target,
    taskId: dispatch.taskId,
    taskType: dispatch.taskType,
    verified: verification.ok === true,
    assessment: classifyAutonomyResult(result),
    evidenceReceived: received.status === 'RESULT_RECEIVED',
  };
}

async function sendFounder(env, text) {
  const response = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN_VICTOR}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: String(env.VICTOR_FOUNDER_CHAT_ID),
      text: String(text).slice(0, 4096),
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) throw new Error(`AUTONOMY_TELEGRAM_HTTP_${response.status}`);
}

export const AUTONOMY_CRONS = { SUPERVISION_CRON, DAILY_REPORT_CRON };
