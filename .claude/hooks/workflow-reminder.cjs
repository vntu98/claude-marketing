#!/usr/bin/env node
'use strict';

const {
  buildWorkflowSummary,
  readStrategyState,
  readHookStdin,
  responseWithContext
} = require('./workflow-utils.cjs');

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const strategy = readStrategyState(projectRoot);
  const prompt =
    payload.prompt ||
    payload.user_prompt ||
    payload.input ||
    '';

  const looksLikeImplementation = /\b(build|implement|code|ship|deploy|refactor|fix|feature|api|component)\b/i.test(prompt);
  const looksLikePmIntake = /\/eup-pm\b|\/eup-dev-intake\b|project-manager|project manager|dev intake|task breakdown|technical backlog|sprint planning/i.test(prompt);
  const header = looksLikeImplementation
    ? '## Implementation Reminder'
    : '## Workflow Reminder';
  let preface = '';

  if (looksLikePmIntake) {
    if (strategy.ready && strategy.memoPath) {
      preface =
        `## PM Intake Gate\n` +
        `Strategy memo ready: ${strategy.memoPath.replace(/\\/g, '/')}.\n` +
        `PM intake may proceed.\n\n`;
    } else {
      const missingDetails = strategy.memoPath
        ? ` Missing sections: ${strategy.missingSections.join(', ')}.`
        : '';
      preface =
        `## PM Intake Gate\n` +
        `/eup-pm and /eup-dev-intake are BLOCKED until a saved strategy memo exists at ` +
        `reports/strategy/YYYYMMDD-[slug]/strategy-memo.md and includes target audience, positioning, ` +
        `channel priorities, priority experiments, measurement notes, concrete dev asks, PM intake packet, ` +
        `and role handoffs.${missingDetails}\n` +
        `Next handoff: marketing-strategist.\n\n`;
    }
  }

  process.stdout.write(
    JSON.stringify(
      responseWithContext(
        'UserPromptSubmit',
        `${preface}${header}\n${buildWorkflowSummary(projectRoot)}`
      )
    )
  );
  process.exit(0);
} catch {
  process.exit(0);
}
