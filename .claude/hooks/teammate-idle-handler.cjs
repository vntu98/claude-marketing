#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  readHookStdin,
  readTeamTasks,
  responseWithContext,
  summarizeTeamTasks,
  writeTeamRuntimeState
} = require('./workflow-utils.cjs');

function asArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return [value];
}

function resolveArtifact(projectRoot, artifactPath) {
  if (!artifactPath || typeof artifactPath !== 'string') {
    return '';
  }

  return path.isAbsolute(artifactPath)
    ? artifactPath
    : path.join(projectRoot, artifactPath);
}

function collectIdleGuards(projectRoot, tasks, teammateName) {
  const failures = [];

  for (const task of tasks) {
    const owner = task.owner || task.assignee || task?.metadata?.owner;
    if (owner !== teammateName) {
      continue;
    }

    const metadata = task.metadata || {};
    if (metadata.enforceArtifactsOnIdle) {
      for (const artifact of asArray(metadata.requiredArtifacts)) {
        if (!fs.existsSync(resolveArtifact(projectRoot, artifact))) {
          failures.push(`Missing required artifact for ${task.subject || task.id}: ${artifact}`);
        }
      }
    }

    if (metadata.enforceValidationOnIdle) {
      const hasValidation = metadata.validationPassed === true || metadata.validationRecorded === true;
      if (!hasValidation) {
        failures.push(`Validation not recorded for ${task.subject || task.id}. Run: ${asArray(metadata.validationCommands).join(', ') || 'the task validation command'}`);
      }
    }
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
