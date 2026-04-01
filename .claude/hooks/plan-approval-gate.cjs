#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  extractToolFilePath,
  isExemptPath,
  normalizeRelative,
  readApprovalState,
  readHookStdin,
  summarizePlanBundleIssues,
  validateAgentEditPath
} = require('./workflow-utils.cjs');

try {
  const payload = readHookStdin();
  const filePath = extractToolFilePath(payload);
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  if (!filePath) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(projectRoot, filePath);

  const agentDecision = validateAgentEditPath(projectRoot, payload, resolvedPath);
  if (!agentDecision.allowed) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason:
            `${agentDecision.agentName || 'This role'} may edit ${agentDecision.policy.label}. ` +
            `Blocked write to ${agentDecision.relativePath || normalizeRelative(projectRoot, resolvedPath)}.`
        }
      })
    );
    process.exit(0);
  }

  if (isExemptPath(projectRoot, resolvedPath)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const approval = readApprovalState(projectRoot);
  if (approval.implementationReady) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  let reason =
    'Implementation edits are blocked until the active plan (or the only plan in plans/**/plan.md) contains `Approval Status: approved`. Follow market -> strategy -> PM -> scout -> brainstorm -> planner -> user approval first.';

  if (approval.approvedPlan && !approval.implementationReady) {
    const blockers = summarizePlanBundleIssues(approval);
    reason =
      'Implementation edits are blocked until the active approved plan is implementation-ready. ' +
      `Missing or invalid runtime artifacts: ${blockers.join('; ') || 'task-graph.json and ownership-matrix.md'}.`;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason
      }
    })
  );
  process.exit(0);
} catch {
  process.exit(0);
}
