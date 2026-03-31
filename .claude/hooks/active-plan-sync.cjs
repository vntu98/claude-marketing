#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  extractToolFilePath,
  readHookStdin,
  setActivePlan
} = require('./workflow-utils.cjs');

try {
  const payload = readHookStdin();
  const filePath = extractToolFilePath(payload);
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  if (!filePath) {
    process.exit(0);
  }

  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(projectRoot, filePath);

  setActivePlan(projectRoot, resolvedPath);
  process.exit(0);
} catch {
  process.exit(0);
}
