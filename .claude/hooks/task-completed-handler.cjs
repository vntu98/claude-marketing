#!/usr/bin/env node
'use strict';

const {
  readHookStdin,
  responseWithContext,
  summarizeTeamTasks,
  writeTeamRuntimeState
} = require('./workflow-utils.cjs');

function getPhase(payload) {
  return (
    payload?.task_metadata?.phase ||
    payload?.metadata?.phase ||
    payload?.task_phase ||
    'team-execution'
  );
}

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const teamName = payload.team_name || '';

  if (!teamName) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const progress = summarizeTeamTasks(teamName);
  const phase = getPhase(payload);
  writeTeamRuntimeState(projectRoot, {
    activeTeam: teamName,
    phase,
    progress,
    idleTeammate: null,
    lastEvent: 'TaskCompleted',
    lastTask: {
      id: payload.task_id || null,
      subject: payload.task_subject || null,
      teammate: payload.teammate_name || null
    }
  });

  const remaining = (progress.pending || 0) + (progress.inProgress || 0);
  const lines = [
    '## Task Completed',
    `Team: ${teamName}`,
    `Task: #${payload.task_id || '?'} ${payload.task_subject || 'Untitled task'}`,
    `Owner: ${payload.teammate_name || 'unknown'}`,
    `Progress: ${progress.completed || 0}/${progress.total || 0} complete; ${progress.pending || 0} pending; ${progress.inProgress || 0} in progress.`,
    `Phase: ${phase}`
  ];

  if (remaining === 0 && progress.total > 0) {
    lines.push('All tracked tasks are complete. Synthesize artifacts, shut down idle teammates, and move to the next workflow gate.');
  }

  process.stdout.write(
    JSON.stringify(responseWithContext('TaskCompleted', lines.join('\n')))
  );
  process.exit(0);
} catch {
  process.exit(0);
}
