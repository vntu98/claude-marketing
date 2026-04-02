#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..', '..');
const cliPath = path.join(projectRoot, 'tools', 'ga4-watch-tabs.js');

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

test('ga4-watch-tabs exposes usage with the expected preset bundle', () => {
  const result = run(['--help']);
  assert.equal(result.status, 0, result.stderr);

  const parsed = JSON.parse(result.stdout);
  assert.match(parsed.usage, /ga4-watch-tabs/);
  assert.deepEqual(parsed.presets, [
    'watch-core-actions',
    'tab-entry-overview',
    'tab-completion-overview',
    'practice-depth-overview'
  ]);
});

test('ga4-watch-tabs supports dry-run across all bundled presets', () => {
  const result = run(['--property', 'demo-property', '--dry-run']);
  assert.equal(result.status, 0, result.stderr);

  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.property, 'demo-property');
  assert.equal(parsed.presets.length, 4);

  for (const preset of parsed.presets) {
    assert.equal(preset.ok, true);
    assert.equal(preset.result._dry_run, true);
    assert.match(preset.result.url, /properties\/demo-property:runReport/);
  }
});
