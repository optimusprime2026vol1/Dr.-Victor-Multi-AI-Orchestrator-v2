from pathlib import Path
import json

p = Path('victor-telegram-worker/autonomy_runtime.mjs')
s = p.read_text()
start = s.index('async function updateRepoJson(')
end = s.index('\nexport async function persistAutonomyEvidence', start)
new = r'''async function updateRepoJson(env, path, next, message) {
  const tokens = [...new Set([env.GITHUB_ORCHESTRATION_TOKEN, env.GITHUB_MEMORY_TOKEN].filter(Boolean))];
  if (!tokens.length) throw new Error('GOAL_STATE_TOKEN_NOT_CONFIGURED');
  const api = `https://api.github.com/repos/${VICTOR_REPO}/contents/${path}`;
  let lastError = 'UNKNOWN';
  for (const token of tokens) {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', 'User-Agent': 'Dr-Victor-Goal-Runtime/2.0' };
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const currentResponse = await fetch(`${api}?ref=main&t=${Date.now()}`, { headers, cache: 'no-store' });
      if (!currentResponse.ok) { lastError = `READ_HTTP_${currentResponse.status}`; if ([401, 403].includes(currentResponse.status)) break; continue; }
      const currentFile = await currentResponse.json();
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(next, null, 2) + '\n')));
      const updateResponse = await fetch(api, { method: 'PUT', headers, body: JSON.stringify({ message, content: encoded, sha: currentFile.sha, branch: 'main' }) });
      if (updateResponse.ok) return next;
      lastError = `WRITE_HTTP_${updateResponse.status}`;
      if ([401, 403].includes(updateResponse.status)) break;
      if ([409, 422].includes(updateResponse.status)) { await new Promise(resolve => setTimeout(resolve, attempt * 750)); continue; }
      break;
    }
  }
  throw new Error(`GOAL_STATE_PERSIST_FAILED_${lastError}`);
}
'''
s = s[:start] + new + s[end:]
start = s.index('export async function persistAutonomyEvidence(')
end = s.index('\nfunction availableDepartments', start)
new = r'''export async function persistAutonomyEvidence(env, controller, result) {
  const previous = await readRepoJsonRaw(`${RAW_BASE}/${AUTONOMY_STATE_PATH}`, {});
  const next = buildAutonomyEvidence(previous, result, controller);
  return updateRepoJson(env, AUTONOMY_STATE_PATH, next, `Record Victor goal-driven cycle: ${result.status}`);
}
'''
s = s[:start] + new + s[end:]
needle = "    'Operating rule: the target is fixed; HOW is delegated. Choose the highest-impact valid next action yourself, execute it inside existing authority, and change the plan if the previous route is weak or blocked.',"
commercial = "    'Commercial priority rule: when verified revenue is zero and executable offers/actions exist, prioritize the closest policy-valid revenue/conversion action. Planning, readiness documents, or pillar rotation must not displace an executable higher-impact commercial action unless they remove a verified blocker.',"
if commercial not in s:
    s = s.replace(needle, needle + '\n' + commercial)
p.write_text(s)

p = Path('victor-telegram-worker/department_bridge.mjs')
s = p.read_text()
needle = "  const value = String(text || '').toLowerCase();\n  if (/activat|start|resume|kaam par|self.?mode/.test(value)) return 'PRIORITY_CHECK';"
replacement = "  const value = String(text || '').toLowerCase();\n  if (/victor goal contract|goal id:|org-revenue-001|replan_execute/.test(value)) return 'GOAL_EXECUTE';\n  if (/activat|start|resume|kaam par|self.?mode/.test(value)) return 'PRIORITY_CHECK';"
if "return 'GOAL_EXECUTE'" not in s:
    s = s.replace(needle, replacement, 1)
s = s.replace("external_action_authorized: false", "external_action_authorized: taskType === 'GOAL_EXECUTE'", 1)
p.write_text(s)

p = Path('data/department_registry.json')
d = json.loads(p.read_text())
d['schema_version'] = max(10, int(d.get('schema_version', 0)))
d['telegram'] = {
    'mode': 'founder_private_victor',
    'leader': 'Dr. Victor',
    'management_group': 'RETIRED',
    'management_group_publishing_allowed': False,
    'private_chat_id_secret_name': 'TELEGRAM_CHAT_ID_VICTOR',
    'bot_token_secret_name': 'TELEGRAM_BOT_TOKEN_VICTOR',
    'configured': True,
    'department_communication': 'INTERNAL_MACHINE_TO_MACHINE_WITH_EVIDENCE',
    'founder_reporting_owner': 'Dr. Victor',
    'note': 'Founder-facing communication is private Victor chat. Raw department task/evidence traffic is internal unless Founder explicitly requests inspection.'
}
p.write_text(json.dumps(d, indent=2) + '\n')
