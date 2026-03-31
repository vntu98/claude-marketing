#!/usr/bin/env node
'use strict';

const {
  buildWorkflowSummary,
  readHookStdin,
  responseWithContext
} = require('./workflow-utils.cjs');

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const prompt =
    payload.prompt ||
    payload.user_prompt ||
    payload.input ||
    '';

  const looksLikeImplementation = /\b(build|implement|code|ship|deploy|refactor|fix|feature|api|component)\b/i.test(prompt);
  const header = looksLikeImplementation
    ? '## Implementation Reminder'
    : '## Workflow Reminder';

  process.stdout.write(
    JSON.stringify(
      responseWithContext(
        'UserPromptSubmit',
        `${header}\n${buildWorkflowSummary(projectRoot)}`
      )
    )
  );
  process.exit(0);
} catch {
  process.exit(0);
}
