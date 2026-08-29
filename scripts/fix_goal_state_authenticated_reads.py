from pathlib import Path

p = Path('victor-telegram-worker/autonomy_runtime.mjs')
s = p.read_text()

needle = "async function updateRepoJson(env, path, next, message) {"
helper = r'''async function readRepoJson(env, path, fallback = {}) {
  const tokens = [...new Set([env.GITHUB_ORCHESTRATION_TOKEN, env.GITHUB_MEMORY_TOKEN].filter(Boolean))];
  const api = `https://api.github.com/repos/${VICTOR_REPO}/contents/${path}?ref=main&t=${Date.now()}`;
  let lastError = 'NO_TOKEN';
  for (const token of tokens) {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Dr-Victor-Goal-Runtime/2.1',
    };
    try {
      const response = await fetch(api, { headers, cache: 'no-store' });
      if (!response.ok) {
        lastError = `HTTP_${response.status}`;
        if ([401, 403].includes(response.status)) continue;
        continue;
      }
      return await response.json();
    } catch (error) {
      lastError = error?.message || 'READ_FAILED';
    }
  }
  // Public raw is retained only as a compatibility fallback; canonical runtime
  // reads must prefer authenticated GitHub API access so a transient raw/CDN
  // failure cannot silently turn an active goal registry into an empty registry.
  const rawMap = {
    'data/goal_registry.json': GOAL_REGISTRY_RAW,
    'data/goal_runtime_state.json': GOAL_RUNTIME_STATE_RAW,
    'data/revenue_outcomes.json': REVENUE_OUTCOMES_RAW,
    [AUTONOMY_STATE_PATH]: `${RAW_BASE}/${AUTONOMY_STATE_PATH}`,
  };
  if (rawMap[path]) {
    const publicRecord = await readRepoJsonRaw(rawMap[path], null);
    if (publicRecord) return publicRecord;
  }
  throw new Error(`CANONICAL_STATE_READ_FAILED_${path.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase()}_${lastError}`);
}

'''
if helper.strip() not in s:
    if needle not in s:
        raise SystemExit('updateRepoJson anchor not found')
    s = s.replace(needle, helper + needle, 1)

s = s.replace("const previous = await readRepoJsonRaw(`${RAW_BASE}/${AUTONOMY_STATE_PATH}`, {});", "const previous = await readRepoJson(env, AUTONOMY_STATE_PATH, {});")
s = s.replace("async function loadGoalRegistry() {\n  const record = await readRepoJsonRaw(GOAL_REGISTRY_RAW, { goals: [] });\n  return Array.isArray(record?.goals) ? record : { goals: [] };\n}", "async function loadGoalRegistry(env) {\n  const record = await readRepoJson(env, 'data/goal_registry.json', { goals: [] });\n  if (!Array.isArray(record?.goals) || record.goals.length === 0) throw new Error('GOAL_REGISTRY_EMPTY_OR_INVALID');\n  return record;\n}")
s = s.replace("async function loadGoalRuntimeState() {\n  return await readRepoJsonRaw(GOAL_RUNTIME_STATE_RAW, { schema_version: 1, goals: {} });\n}", "async function loadGoalRuntimeState(env) {\n  const state = await readRepoJson(env, GOAL_RUNTIME_STATE_PATH, { schema_version: 1, goals: {} });\n  if (!state?.goals || typeof state.goals !== 'object') throw new Error('GOAL_RUNTIME_STATE_INVALID');\n  return state;\n}")
s = s.replace("const registry = await loadGoalRegistry();", "const registry = await loadGoalRegistry(env);")
s = s.replace("const state = await loadGoalRuntimeState();", "const state = await loadGoalRuntimeState(env);")
s = s.replace("let state = await loadGoalRuntimeState();", "let state = await loadGoalRuntimeState(env);")
s = s.replace("async function loadCanonicalRevenue() {\n  const record = await readRepoJsonRaw(REVENUE_OUTCOMES_RAW, {});", "async function loadCanonicalRevenue(env) {\n  const record = await readRepoJson(env, 'data/revenue_outcomes.json', {});")
s = s.replace("const revenue = await loadCanonicalRevenue();", "const revenue = await loadCanonicalRevenue(env);")

# Fail loudly instead of silently reporting NO_ACTIONABLE_GOAL when the registry
# is present but routing prerequisites are unexpectedly absent.
old = "  if (!selection) {\n    return { status: 'SAFE_STOP', goalId: null, target: null, error_code: 'NO_ACTIONABLE_GOAL_OR_QUALIFIED_ROUTE' };\n  }"
new = "  if (!selection) {\n    const available = availableDepartments(env);\n    const activeGoalIds = (registry.goals || []).filter(goal => normalizedState(goal.status) === 'ACTIVE').map(goal => goal.goal_id);\n    return { status: 'SAFE_STOP', goalId: state.active_goal_id || activeGoalIds[0] || null, target: null, error_code: 'NO_ACTIONABLE_GOAL_OR_QUALIFIED_ROUTE', diagnostics: { active_goal_ids: activeGoalIds, available_departments: available, runtime_active_goal_id: state.active_goal_id || null } };\n  }"
if old in s:
    s = s.replace(old, new, 1)

p.write_text(s)
print('patched', p)
