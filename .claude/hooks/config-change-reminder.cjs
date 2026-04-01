#!/usr/bin/env node
'use strict';

const {
  readHookStdin,
  responseWithContext,
  writeTeamRuntimeState
} = require('./workflow-utils.cjs');

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const source = payload.source || 'unknown';
  const filePath = payload.file_path || 'unknown';

  writeTeamRuntimeState(projectRoot, {
    lastConfigChange: {
      source,
      filePath
    }
  });

  process.stdout.write(
    JSON.stringify(
      responseWithContext(
        'ConfigChange',
        `Configuration changed: ${source} -> ${filePath}. Re-run workflow validation before trusting the updated company runtime.`
      )
    )
  );
  process.exit(0);
} catch {
  process.exit(0);
}
