#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  extractTeamNameFromAgentId,
  listAssignedTeamTasks,
  readHookStdin
} = require('./workflow-utils.cjs');

const STATUS_PATTERN = /\*\*Status:\*\*\s*(DONE|DONE_WITH_CONCERNS|BLOCKED|NEEDS_CONTEXT)\b/;
const SUMMARY_PATTERN = /\*\*Summary:\*\*\s*\S+/;
const HANDOFF_PATTERN = /\*\*Next Handoff:\*\*\s*\S+/;
const ACTIVE_TASK_STATUSES = new Set(['pending', 'in_progress', 'running', 'claimed']);

function isProjectAgent(projectRoot, agentName) {
  if (!agentName) {
    return false;
  }

  return fs.existsSync(
    path.join(projectRoot, '.claude', 'agents', `${String(agentName).trim().toLowerCase()}.md`)
  );
}

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

function isActiveTask(task) {
  const normalized = String(task?.status || 'pending').trim().toLowerCase();
  return ACTIVE_TASK_STATUSES.has(normalized) || !normalized;
}

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const agentName = payload.agent_type || payload.agent_name || '';
  const message = payload.last_assistant_message || '';
  const teamName = payload.team_name || extractTeamNameFromAgentId(payload.agent_id || '');
  const teammateName = extractTeammateName(payload, agentName);

  if (payload.stop_hook_active || !isProjectAgent(projectRoot, agentName)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  if (teamName && teammateName) {
    const activeAssignedTasks = listAssignedTeamTasks(teamName, teammateName)
      .filter((task) => isActiveTask(task));

    if (activeAssignedTasks.length) {
      const taskList = activeAssignedTasks
        .slice(0, 3)
        .map((task) => `#${task.id} ${task.subject || task.title || 'Untitled task'}`)
        .join(', ');

      process.stdout.write(
        JSON.stringify({
          decision: 'block',
          reason:
            `Before stopping, ${agentName || teammateName} must close owned team tasks via TaskUpdate. ` +
            `Still active: ${taskList}. Mark them completed or blocked before stopping; do not rely on the final chat message alone.`
        })
      );
      process.exit(0);
    }
  }

  if (
    STATUS_PATTERN.test(message) &&
    SUMMARY_PATTERN.test(message) &&
    HANDOFF_PATTERN.test(message)
  ) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason:
        `Before stopping, ${agentName || 'this project agent'} must end with ` +
        '`**Status:** ...`, `**Summary:** ...`, and `**Next Handoff:** ...`.'
    })
  );
  process.exit(0);
} catch {
  process.exit(0);
}
