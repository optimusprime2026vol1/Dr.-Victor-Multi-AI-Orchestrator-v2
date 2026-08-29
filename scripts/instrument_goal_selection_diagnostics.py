from pathlib import Path

p = Path('victor-telegram-worker/autonomy_runtime.mjs')
s = p.read_text()

old = """    last_cycle_attempt: {
      checked_at_utc: checkedAt,
      cron: controller.cron,
      status: result?.status || 'UNKNOWN',
      goal_id: result?.goalId || null,
      target: result?.target || null,
    },"""
new = """    last_cycle_attempt: {
      checked_at_utc: checkedAt,
      cron: controller.cron,
      status: result?.status || 'UNKNOWN',
      goal_id: result?.goalId || null,
      target: result?.target || null,
      error_code: result?.error_code || null,
      diagnostics: result?.diagnostics || null,
    },"""
if old not in s:
    raise SystemExit('buildAutonomyEvidence anchor not found')
s = s.replace(old, new, 1)

old2 = """  if (!selection) {
    const available = availableDepartments(env);
    const activeGoalIds = (registry.goals || []).filter(goal => normalizedState(goal.status) === 'ACTIVE').map(goal => goal.goal_id);
    return { status: 'SAFE_STOP', goalId: state.active_goal_id || activeGoalIds[0] || null, target: null, error_code: 'NO_ACTIONABLE_GOAL_OR_QUALIFIED_ROUTE', diagnostics: { active_goal_ids: activeGoalIds, available_departments: available, runtime_active_goal_id: state.active_goal_id || null } };
  }"""
new2 = """  if (!selection) {
    const available = availableDepartments(env);
    const activeGoals = (registry.goals || []).filter(goal => normalizedState(goal.status) === 'ACTIVE');
    const activeGoalIds = activeGoals.map(goal => goal.goal_id);
    const candidate_diagnostics = (registry.goals || []).map(goal => {
      const runtimeGoal = state?.goals?.[goal.goal_id] || {};
      const departmentOrder = goalDepartmentOrder(goal, runtimeGoal);
      const target = chooseGoalDepartment(goal, runtimeGoal, available);
      const score = target ? scoreGoal(goal, runtimeGoal, controller.scheduledTime) : Number.NEGATIVE_INFINITY;
      return {
        goal_id: goal.goal_id || null,
        goal_status: normalizedState(goal.status, 'ACTIVE'),
        runtime_state: normalizedState(runtimeGoal.state, 'READY'),
        department_order: departmentOrder,
        chosen_target: target,
        finite_score: Number.isFinite(score),
        score: Number.isFinite(score) ? score : null,
      };
    });
    return {
      status: 'SAFE_STOP',
      goalId: state.active_goal_id || activeGoalIds[0] || null,
      target: null,
      error_code: 'NO_ACTIONABLE_GOAL_OR_QUALIFIED_ROUTE',
      diagnostics: {
        registry_goal_count: Array.isArray(registry.goals) ? registry.goals.length : 0,
        active_goal_ids: activeGoalIds,
        available_departments: available,
        runtime_active_goal_id: state.active_goal_id || null,
        bridge_configured: {
          rio: rioBridgeConfigured(env),
          tony_stark: tonyBridgeConfigured(env),
          aura3: aura3BridgeConfigured(env),
        },
        candidates: candidate_diagnostics,
      },
    };
  }"""
if old2 not in s:
    raise SystemExit('SAFE_STOP diagnostics anchor not found')
s = s.replace(old2, new2, 1)

p.write_text(s)
print('instrumented', p)
