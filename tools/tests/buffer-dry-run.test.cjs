#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..', '..');
const cliPath = path.join(projectRoot, 'tools', 'buffer.js');

function run(args, env = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env
    }
  });
}

test('creates a scheduled social update in dry-run mode', () => {
  const result = run(
    [
      'updates',
      'create',
      '--profile-ids',
      'profile-demo',
      '--text',
      'Study Japanese for 15 minutes today.',
      '--scheduled-at',
      '2026-04-01T01:00:00Z',
      '--dry-run'
    ],
    { BUFFER_API_KEY: 'demo-token' }
  );

  assert.equal(result.status, 0, result.stderr);

  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed._dry_run, true);
  assert.match(parsed.url, /\/updates\/create\.json$/);
  assert.match(parsed.body, /text=Study\+Japanese\+for\+15\+minutes\+today\./);
  assert.match(parsed.body, /profile_ids%5B%5D=profile-demo/);
});
