#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readHookStdin } = require('./workflow-utils.cjs');

const STATUS_PATTERN = /\*\*Status:\*\*\s*(DONE|DONE_WITH_CONCERNS|BLOCKED|NEEDS_CONTEXT)\b/;
const SUMMARY_PATTERN = /\*\*Summary:\*\*\s*\S+/;
const HANDOFF_PATTERN = /\*\*Next Handoff:\*\*\s*\S+/;

function isProjectAgent(projectRoot, agentName) {
  if (!agentName) {
    return false;
  }

  return fs.existsSync(
    path.join(projectRoot, '.claude', 'agents', `${String(agentName).trim().toLowerCase()}.md`)
  );
}

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const agentName = payload.agent_type || payload.agent_name || '';
  const message = payload.last_assistant_message || '';

  if (payload.stop_hook_active || !isProjectAgent(projectRoot, agentName)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
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
