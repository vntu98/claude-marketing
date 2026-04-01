#!/usr/bin/env node
'use strict';

const {
  buildWorkflowSummary,
  describeAgentEditPolicy,
  extractTeamNameFromAgentId,
  listAssignedTeamTasks,
  listTeamPeers,
  normalizeRelative,
  recordAgentSession,
  readApprovalState,
  readHookStdin,
  readStrategyState,
  summarizeTeamTasks,
  responseWithContext
} = require('./workflow-utils.cjs');

function extractTeammateName(payload, agentName) {
  if (payload.teammate_name) {
    return String(payload.teammate_name).trim();
  }

  const agentId = String(payload.agent_id || '');
  if (agentId.includes('@')) {
    return agentId.split('@')[0].trim();
  }

  return String(agentName || '').trim();
}

function buildAgentReminder(agentName) {
  const normalized = (agentName || '').toLowerCase();

  if (['market-researcher', 'competitor-analyst', 'ga4-analyst'].includes(normalized)) {
    return 'If you save artifacts under reports/**, write the analysis in Vietnamese. Keep verbatim source quotes in the original language when useful.';
  }

  if (/(engineer|developer|devops)/.test(normalized) || normalized === 'qa-tester') {
    return 'Implementation task packets must include File Ownership and `Isolation: worktree`. You may edit only the assigned files. If the plan is not approved, stop and report BLOCKED.';
  }

  if (['codebase-scout', 'technical-brainstormer', 'quality-reviewer'].includes(normalized)) {
    return 'Read-only team lanes must save any requested handoff artifact, send the summary to the lead, and call TaskUpdate so the owned task is completed or blocked before stopping. Do not rely on chat delivery alone.';
  }

  if (/(reviewer|tester)/.test(normalized)) {
    return 'Report concrete findings first. Task packets should name a Read Scope or explicit validation scope. Do not wave through missing tests or unresolved blockers.';
  }

  if (/(planner|manager|strategist|analyst)/.test(normalized)) {
    return 'Return structured handoff output with owner, acceptance criteria, next step, and named artifacts when you save durable outputs.';
  }

  return 'Return a concise report with status, summary, blockers, and next handoff.';
}

try {
  const payload = readHookStdin();
  const agentName = payload.agent_type || payload.agent_name || payload.agent_id || '';
  const teamName = payload.team_name || extractTeamNameFromAgentId(payload.agent_id || '');
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const teammateName = extractTeammateName(payload, agentName);
  recordAgentSession(projectRoot, payload.session_id, agentName);
  const editPolicy = describeAgentEditPolicy(agentName);
  const approval = readApprovalState(projectRoot);
  const strategy = readStrategyState(projectRoot);
  const peerSummary = teamName
    ? listTeamPeers(teamName, payload.agent_id || '')
        .map((peer) => `${peer.name}${peer.agentType ? ` (${peer.agentType})` : ''}`)
        .join(', ') || 'none'
    : '';
  const taskSummary = teamName ? summarizeTeamTasks(teamName) : null;
  const assignedTasks = teamName ? listAssignedTeamTasks(teamName, teammateName) : [];
  const activePlanLabel = approval.activePlan
    ? normalizeRelative(projectRoot, approval.activePlan)
    : 'none';
  const activeStrategyLabel = strategy.activeStrategy
    ? normalizeRelative(projectRoot, strategy.activeStrategy)
    : 'none';
  const teamContext = teamName
    ? [
        `Team: ${teamName}`,
        `Teammate: ${teammateName || 'unknown'}`,
        `Peers: ${peerSummary}`,
        taskSummary
          ? `Team tasks: ${taskSummary.completed}/${taskSummary.total} complete; ${taskSummary.pending} pending; ${taskSummary.inProgress} in progress.`
          : 'Team tasks: unavailable.',
        `Assigned tasks: ${
          assignedTasks.length
            ? assignedTasks
                .slice(0, 3)
                .map((task) => `#${task.id} ${task.subject || task.title || 'Untitled'} [${task.status || 'pending'}]`)
                .join(', ')
            : 'none yet'
        }`,
        `Active strategy artifact: ${activeStrategyLabel}`,
        `Active plan artifact: ${activePlanLabel}`,
        'Teammates do not inherit the lead conversation history. Read the task packet `Context:` section before acting.',
        'Team mode: claim work via TaskUpdate, respect file ownership, and use SendMessage for direct coordination. Before stopping, mark owned tasks completed or blocked via TaskUpdate; do not rely on chat delivery alone.'
      ].join('\n')
    : '';

  process.stdout.write(
    JSON.stringify(
      responseWithContext(
        'SubagentStart',
        `## Subagent Context\nAgent: ${agentName || 'unknown'}\n${buildWorkflowSummary(projectRoot)}${teamContext ? `\n${teamContext}` : ''}\n${buildAgentReminder(agentName)}${editPolicy ? `\n${editPolicy}` : ''}\n\nRequired ending:\n**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT\n**Summary:** 1-2 sentences\n**Next Handoff:** which role should act next`
      )
    )
  );
  process.exit(0);
} catch {
  process.exit(0);
}
