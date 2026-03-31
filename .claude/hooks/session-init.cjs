#!/usr/bin/env node
'use strict';

const {
  buildWorkflowSummary,
  responseWithContext
} = require('./workflow-utils.cjs');

try {
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const summary = buildWorkflowSummary(projectRoot);
  process.stdout.write(
    JSON.stringify(
      responseWithContext(
        'SessionStart',
        `## Workflow Bootstrap\n${summary}\n\nRead .claude/rules/primary-workflow.md before running implementation work.`
      )
    )
  );
  process.exit(0);
} catch {
  process.exit(0);
}
