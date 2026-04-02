#!/usr/bin/env node
'use strict';

const {
  collectTaskQualityGateFailures,
  readHookStdin,
  readTeamTasks,
  responseWithContext,
  summarizeTeamTasks,
  writeTeamRuntimeState
} = require('./workflow-utils.cjs');
const READ_ONLY_OWNER_ROLES = new Set([
  'codebase-scout',
  'technical-brainstormer',
  'quality-reviewer'
]);

function parseOwnerRole(task) {
  const direct = task?.ownerRole || task?.metadata?.ownerRole;
  if (direct) {
    return String(direct).trim().toLowerCase();
  }

  const description = String(
    task?.taskDescription ||
    task?.task_description ||
    task?.description ||
    ''
  );
  const match = description.match(/(^|\n)Owner Role:\s*([a-z0-9-]+)/i);
  return match ? match[2].trim().toLowerCase() : '';
}

function normalizeTeammateName(value) {
  return String(value || '').trim().toLowerCase();
}

function isActiveTask(task) {
  const status = String(task?.status || 'pending').trim().toLowerCase();
  return !status || status === 'pending' || status === 'in_progress' || status === 'running' || status === 'claimed';
}

function collectOwnedReadOnlyTasks(tasks, teammateName) {
  const normalizedTeammate = normalizeTeammateName(teammateName);
  return tasks.filter((task) => {
    const owner = normalizeTeammateName(task.owner || task.assignee || task?.metadata?.owner);
    if (owner !== normalizedTeammate) {
      return false;
    }

    if (!isActiveTask(task)) {
      return false;
    }

    return READ_ONLY_OWNER_ROLES.has(parseOwnerRole(task));
  });
}

function collectIdleGuards(projectRoot, tasks, teammateName) {
  const failures = [];
  const normalizedTeammate = normalizeTeammateName(teammateName);

  for (const task of tasks) {
    const owner = normalizeTeammateName(task.owner || task.assignee || task?.metadata?.owner);
    if (owner !== normalizedTeammate) {
      continue;
    }

    failures.push(
      ...collectTaskQualityGateFailures(projectRoot, task, {
        artifactFlags: ['enforceArtifactsOnIdle'],
        validationFlags: ['enforceValidationOnIdle']
      })
    );
  }

  return failures;
}

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const teamName = payload.team_name || '';
  const teammateName = payload.teammate_name || 'unknown';

  if (!teamName) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const tasks = readTeamTasks(teamName);
  const idleFailures = collectIdleGuards(projectRoot, tasks, teammateName);
  if (idleFailures.length) {
    process.stderr.write(`${idleFailures.join('\n')}\n`);
    process.exit(2);
  }

  const progress = summarizeTeamTasks(teamName);
  const ownedReadOnlyTasks = collectOwnedReadOnlyTasks(tasks, teammateName);
  writeTeamRuntimeState(projectRoot, {
    activeTeam: teamName,
    idleTeammate: teammateName,
    progress,
    lastEvent: 'TeammateIdle'
  });

  const unblocked = progress.unblocked || [];
  const lines = [
    '## Teammate Idle',
    `Team: ${teamName}`,
    `Teammate: ${teammateName}`,
    `Progress: ${progress.completed || 0}/${progress.total || 0} complete; ${progress.pending || 0} pending; ${progress.inProgress || 0} in progress.`
  ];

  if (unblocked.length) {
    const taskLabels = unblocked
      .slice(0, 3)
      .map((task) => `#${task.id} ${task.subject}`)
      .join(', ');
    lines.push(`Unblocked tasks: ${taskLabels}`);
    lines.push(`Assign work or message ${teammateName} to resume with the next available task.`);
  } else if ((progress.pending || 0) + (progress.inProgress || 0) === 0) {
    lines.push(`No remaining tasks. ${teammateName} can be shut down after result synthesis.`);
  } else if (ownedReadOnlyTasks.length) {
    const taskLabels = ownedReadOnlyTasks
      .slice(0, 3)
      .map((task) => `#${task.id} ${task.subject || task.title || 'Untitled task'}`)
      .join(', ');
    lines.push(`Owned read-only tasks still need closure: ${taskLabels}.`);
    lines.push(`Ask ${teammateName} to save any requested handoff artifact, send the final findings, and mark the task completed or blocked via TaskUpdate before idling again.`);
  } else {
    lines.push('Remaining tasks are blocked or already assigned. Keep the teammate idle until dependencies clear.');
  }

  process.stdout.write(
    JSON.stringify(responseWithContext('TeammateIdle', lines.join('\n')))
  );
  process.exit(0);
} catch {
  process.exit(0);
}
