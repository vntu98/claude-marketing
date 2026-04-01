#!/usr/bin/env node
'use strict';

const {
  archiveSessionStateSnapshot,
  buildSessionStateMarkdown,
  readHookStdin,
  readLatestSessionState,
  responseWithContext,
  writeLatestSessionState
} = require('./workflow-utils.cjs');

function shouldReplayState(source) {
  return source === 'startup' || source === 'resume' || source === 'compact';
}

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const eventType = payload.hook_event_name || '';

  if (eventType === 'Stop' || eventType === 'SubagentStop' || eventType === 'PostCompact') {
    writeLatestSessionState(projectRoot, buildSessionStateMarkdown(projectRoot, payload));
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  if (eventType === 'SessionEnd') {
    const snapshot = buildSessionStateMarkdown(projectRoot, payload);
    writeLatestSessionState(projectRoot, snapshot);
    archiveSessionStateSnapshot(projectRoot, snapshot);
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  if (!eventType && shouldReplayState(payload.source || '')) {
    const snapshot = readLatestSessionState(projectRoot);
    if (snapshot) {
      const header = payload.source === 'compact'
        ? '## Session Recovery'
        : '## Previous Session State';

      process.stdout.write(
        JSON.stringify(
          responseWithContext(
            'SessionStart',
            `${header}\n${snapshot}\nReview the saved state above before re-running research, planning, or implementation.`
          )
        )
      );
      process.exit(0);
    }
  }

  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
} catch {
  process.exit(0);
}
