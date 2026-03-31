#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..', '..');
const cliPath = path.join(projectRoot, 'tools', 'ga4.js');

function run(args, env = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  });
}

test('lists GA4 presets without requiring a token', () => {
  const result = run(['presets', 'list']);
  assert.equal(result.status, 0, result.stderr);

  const parsed = JSON.parse(result.stdout);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.some((preset) => preset.name === 'acquisition-overview'));
  assert.ok(parsed.some((preset) => preset.name === 'learner-journey-funnel'));
});

test('runs preset dry-run with env property fallback', () => {
  const result = run(
    ['presets', 'run', '--preset', 'acquisition-overview', '--dry-run'],
    { GA4_PROPERTY_ID: 'demo-property' }
  );
  assert.equal(result.status, 0, result.stderr);

  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed._dry_run, true);
  assert.match(parsed.url, /properties\/demo-property:runReport/);
});
