#!/usr/bin/env node
'use strict';

const {
  readHookStdin,
  writeTeamRuntimeState
} = require('./workflow-utils.cjs');

const GENERAL_REQUIRED = [
  ['Phase:', /(^|\n)Phase:\s*\S+/i],
  ['Owner Role:', /(^|\n)Owner Role:\s*\S+/i],
  ['Depends On:', /(^|\n)Depends On:\s*\S+/i],
  ['Acceptance Criteria:', /(^|\n)Acceptance Criteria:\s*[\s\S]*\S/i],
  ['Validation:', /(^|\n)Validation:\s*[\s\S]*\S/i]
];

const CODE_WRITER_ROLES = new Set([
  'database-engineer',
  'backend-engineer',
  'frontend-engineer',
  'mobile-engineer',
  'fullstack-developer',
  'qa-tester',
  'devops-engineer'
]);

const READ_SCOPE_ROLES = new Set([
  'codebase-scout',
  'technical-brainstormer',
  'quality-reviewer'
]);

function parseOwnerRole(description) {
  const match = String(description || '').match(/(^|\n)Owner Role:\s*([a-z0-9-]+)/i);
  return match ? match[2].trim().toLowerCase() : '';
}

function missingGeneralSections(description) {
  return GENERAL_REQUIRED
    .filter(([, pattern]) => !pattern.test(description))
    .map(([label]) => label);
}

function missingRoleSpecificSections(ownerRole, description) {
  if (CODE_WRITER_ROLES.has(ownerRole)) {
    const missing = [];
    if (!/(^|\n)File Ownership:\s*[\s\S]*\S/i.test(description)) {
      missing.push('File Ownership:');
    }
    if (!/(^|\n)Isolation:\s*worktree\b/i.test(description)) {
      missing.push('Isolation: worktree');
    }
    return missing;
  }

  if (READ_SCOPE_ROLES.has(ownerRole)) {
    return /(^|\n)Read Scope:\s*[\s\S]*\S/i.test(description)
      ? []
      : ['Read Scope:'];
  }

  return /(^|\n)Artifacts:\s*[\s\S]*\S/i.test(description)
    ? []
    : ['Artifacts:'];
}

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const teamName = payload.team_name || '';
  const subject = String(payload.task_subject || '').trim();
  const description = String(payload.task_description || '').trim();

  if (!teamName) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  if (!subject) {
    process.stderr.write('Task subject is required.\n');
    process.exit(2);
  }

  if (!description) {
    process.stderr.write(
      'Task description is required. Include Phase, Owner Role, Depends On, Acceptance Criteria, Validation, and the appropriate scope section.\n'
    );
    process.exit(2);
  }

  const ownerRole = parseOwnerRole(description);
  const missing = [
    ...missingGeneralSections(description),
    ...missingRoleSpecificSections(ownerRole, description)
  ];

  if (missing.length) {
    process.stderr.write(
      [
        `Task "${subject}" is missing required task packet fields: ${missing.join(', ')}.`,
        'Use the company task contract with explicit owner, dependency, acceptance criteria, validation, and either Artifacts, Read Scope, or File Ownership + Isolation: worktree.'
      ].join('\n') + '\n'
    );
    process.exit(2);
  }

  writeTeamRuntimeState(projectRoot, {
    activeTeam: teamName,
    lastEvent: 'TaskCreated',
    lastTaskCreated: {
      id: payload.task_id || null,
      subject,
      ownerRole: ownerRole || null,
      teammate: payload.teammate_name || null
    }
  });

  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
} catch {
  process.exit(0);
}
