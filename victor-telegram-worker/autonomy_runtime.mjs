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
const SUPERVISION_CRON = '*/15 * * * *';
const DAILY_REPORT_CRON = '30 16 * * *';
const VICTOR_REPO = 'vickykenin-lang/Dr.-Victor-Multi-AI-Orchestrator';
const AUTONOMY_STATE_PATH = 'data/autonomy_state.json';

export function selectAutonomyTarget(scheduledTime) {
  const supervisionBucket = Math.floor(Number(scheduledTime) / (15 * 60 * 1000));
  return ['tony_stark', 'rio', 'aura3'][supervisionBucket % 3];
}

export function classifyAutonomyResult(result) {
  const strict = result?.strict_supervision || {};
  const status = String(strict.status || result?.execution_status || 'UNKNOWN').toUpperCase();
  const blocker = strict.error_or_blocker ?? result?.blockers ?? null;
  const hasBlocker = Boolean(
    (Array.isArray(blocker) && blocker.length) ||
    (!Array.isArray(blocker) && blocker && !/^none|no blocker|null$/i.test(String(blocker)))
  );
  const authorityText = [status, strict.next_action, blocker].flat().filter(Boolean).join(' ').toUpperCase();
  const founderGate = /(?:ADD|CREATE|PROVISION|REPLACE|ROTATE|REVOKE|EXPAND).{0,24}(?:CREDENTIAL|SECRET|ACCOUNT IDENTITY)|(?:CREDENTIAL|SECRET).{0,24}(?:ADD|CREATE|PROVISION|REPLACE|ROTATE|REVOKE|EXPAND)|MISSING (?:CREDENTIAL|SECRET)/.test(authorityText);
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
    finalOutcome: result?.final_outcome || strict?.final_outcome || null,
  };
}

export function buildVictorReportCard(checks) {
  const departments = (Array.isArray(checks) ? checks : []).map(check => {
    const finalOutcome = check?.assessment?.finalOutcome;
    const evidence = Array.isArray(finalOutcome?.evidence) ? finalOutcome.evidence : [];
    const verified = check?.verified === true && finalOutcome?.verified === true && evidence.length > 0;
    let score = 1;
    if (verified) {
      const declared = Number(finalOutcome?.score);
      score = Number.isFinite(declared) ? Math.max(1, Math.min(10, Math.round(declared))) : 1;
      if (score === 10 && finalOutcome?.objective_met !== true) score = 9;
    }
    return {
      department: check?.target || 'unknown',
      score,
      final_outcome_verified: verified,
      objective_met: finalOutcome?.objective_met === true,
      evidence,
    };
  });
  const score = departments.length
    ? Math.round((departments.reduce((sum, item) => sum + item.score, 0) / departments.length) * 10) / 10
    : 1;
  return {
    score,
    target: 10,
    basis: 'VERIFIED_DEPARTMENT_FINAL_OUTCOMES_ONLY',
    system_health_points: 0,
    activity_points: 0,
    departments,
  };
}

export function autonomyConfigured(env) {
  return Boolean(
    env.GITHUB_ORCHESTRATION_TOKEN &&
    env.TELEGRAM_BOT_TOKEN_VICTOR &&
    env.VICTOR_FOUNDER_CHAT_ID
  );
}

export function buildAutonomyEvidence(previous, result, controller, checkedAt = new Date().toISOString()) {
  const verified = result?.status === 'CYCLE_VERIFIED' || result?.status === 'DAILY_REPORT_SENT';
  return {
    ...previous,
    runtime_status: verified ? 'AUTONOMOUS_CYCLE_VERIFIED' : 'AUTONOMOUS_CYCLE_SAFE_STOP',
    last_verified_cycle: verified ? {
      checked_at_utc: checkedAt,
      cron: controller.cron,
      status: result.status,
      target: result.target || 'all',
      task_id: result.result?.taskId || null,
      evidence_received: result.result?.evidenceReceived ?? true,
    } : (previous?.last_verified_cycle || null),
    last_cycle_attempt: {
      checked_at_utc: checkedAt,
      cron: controller.cron,
      status: result?.status || 'UNKNOWN',
      target: result?.target || null,
    },
    report_card: result?.reportCard || previous?.report_card || null,
  };
}

export async function persistAutonomyEvidence(env, controller, result) {
  const token = env.GITHUB_MEMORY_TOKEN || env.GITHUB_ORCHESTRATION_TOKEN;
  if (!token) throw new Error('AUTONOMY_EVIDENCE_TOKEN_NOT_CONFIGURED');
  const api = `https://api.github.com/repos/${VICTOR_REPO}/contents/${AUTONOMY_STATE_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'Dr-Victor-Autonomy-Evidence/1.0',
  };
  const currentResponse = await fetch(`${api}?ref=main`, { headers });
  if (!currentResponse.ok) throw new Error(`AUTONOMY_EVIDENCE_READ_HTTP_${currentResponse.status}`);
  const currentFile = await currentResponse.json();
  const previous = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(String(currentFile.content).replace(/\n/g, '')), c => c.charCodeAt(0))));
  const next = buildAutonomyEvidence(previous, result, controller);
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(next, null, 2) + '\n')));
  const updateResponse = await fetch(api, {
    method: 'PUT', headers,
    body: JSON.stringify({
      message: `Record Victor autonomous cycle: ${result.status}`,
      content: encoded,
      sha: currentFile.sha,
      branch: 'main',
    }),
  });
  if (!updateResponse.ok) throw new Error(`AUTONOMY_EVIDENCE_WRITE_HTTP_${updateResponse.status}`);
  return next;
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
    const reportCard = buildVictorReportCard(checks);
    const lines = [
      'Victor daily autonomous report',
      `Organization supervision: ${checks.filter(x => x.verified).length}/3 fresh reverts verified`,
      `Verified success signals: ${successes.length}`,
      `Founder escalations: ${escalations.length}`,
      `Victor report card: ${reportCard.score}/10 (target 10; verified department final outcomes only)`,
    ];
    if (escalations.length) {
      lines.push('Action required: ' + escalations.map(x => `${x.target}: ${x.assessment.status}`).join(', '));
    } else {
      lines.push('Aapko abhi koi action nahi lena.');
    }
    await sendFounder(env, lines.join('\n'));
    return { status: 'DAILY_REPORT_SENT', checks, reportCard };
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

async function superviseTarget(target, env, phase = 'CHECK') {
  let dispatch;
  let received;
  let verification;

  if (target === 'tony_stark') {
    if (!tonyBridgeConfigured(env)) throw new Error('TONY_BRIDGE_NOT_CONFIGURED');
    dispatch = await dispatchTonyTask(
      env,
      phase === 'FOLLOW_UP'
        ? 'Tony Stark autonomous DIAGNOSTIC follow-up in GOVERNED_SELF_MODE. Diagnose and execute the highest-value validated recovery within existing credential scope; return evidence. Credential administration remains Founder-only.'
        : 'Tony Stark autonomous STATUS_CHECK in GOVERNED_SELF_MODE. Continue validated recovery/execution without approval waits. Credential administration remains Founder-only.',
      { messageId: 'auto' }
    );
    received = await waitForTonyResult(dispatch.taskId, env, { attempts: 30, delayMs: 5000 });
    verification = received.status === 'RESULT_RECEIVED'
      ? verifyTonyResult(received.result, dispatch.taskId)
      : { ok: false };
  } else if (target === 'rio') {
    if (!rioBridgeConfigured(env)) throw new Error('RIO_BRIDGE_NOT_CONFIGURED');
    dispatch = await dispatchRioTask(
      env,
      phase === 'FOLLOW_UP'
        ? 'RIO autonomous PRIORITY_CHECK follow-up in ACTIVE_GOVERNED SELF_MODE. Execute the highest-value objective-aligned revenue action through validators and return evidence. Credential administration remains Founder-only.'
        : 'RIO autonomous GOVERNANCE_CHECK in ACTIVE_GOVERNED SELF_MODE. Continue production/revenue work without approval waits; preserve validators, evidence and credential isolation.',
      { messageId: 'auto' }
    );
    received = await waitForRioResult(dispatch.taskId, { attempts: 30, delayMs: 5000 });
    verification = received.status === 'RESULT_RECEIVED'
      ? verifyRioResult(received.result, dispatch.taskId)
      : { ok: false };
  } else {
    if (!aura3BridgeConfigured(env)) throw new Error('AURA3_BRIDGE_NOT_CONFIGURED');
    dispatch = await dispatchAura3Task(
      env,
      phase === 'FOLLOW_UP'
        ? 'AURA3 autonomous GOVERNANCE_CHECK follow-up in GOVERNED_SELF_MODE. Resolve and execute objective-aligned work through validators; return evidence. Credential administration remains Founder-only.'
        : 'AURA3 autonomous STATUS_CHECK under strict supervision and GOVERNED_SELF_MODE. Continue validated work without approval waits. Credential administration remains Founder-only.',
      { messageId: 'auto' }
    );
    received = await waitForAura3Result(dispatch.taskId, { attempts: 30, delayMs: 5000 });
    verification = received.status === 'RESULT_RECEIVED'
      ? verifyAura3Result(received.result, dispatch.taskId)
      : { ok: false };
  }

  const result = received.result || {};
  const outcome = {
    target,
    phase,
    taskId: dispatch.taskId,
    taskType: dispatch.taskType,
    verified: verification.ok === true,
    assessment: classifyAutonomyResult(result),
    evidenceReceived: received.status === 'RESULT_RECEIVED',
  };

  if (
    phase === 'CHECK' &&
    outcome.verified &&
    outcome.assessment.requiresFollowUp &&
    !outcome.assessment.founderGate
  ) {
    const followUp = await superviseTarget(target, env, 'FOLLOW_UP');
    return { ...followUp, previousTaskId: outcome.taskId, automaticFollowUp: true };
  }
  return outcome;
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
