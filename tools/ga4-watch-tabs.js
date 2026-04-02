#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('node:child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GA4_TOOL = path.join(PROJECT_ROOT, 'tools', 'ga4.js');
const PRESETS = [
  'watch-core-actions',
  'tab-entry-overview',
  'tab-completion-overview',
  'practice-depth-overview'
];

function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = true;
    }
  }

  return parsed;
}

function buildPresetArgs(preset, args) {
  const toolArgs = ['presets', 'run', '--preset', preset];

  if (args.property) {
    toolArgs.push('--property', args.property);
  }

  if (args['start-date']) {
    toolArgs.push('--start-date', args['start-date']);
  }

  if (args['end-date']) {
    toolArgs.push('--end-date', args['end-date']);
  }

  if (args['dry-run']) {
    toolArgs.push('--dry-run');
  }

  return toolArgs;
}

function runPreset(preset, args) {
  const result = spawnSync(process.execPath, [GA4_TOOL, ...buildPresetArgs(preset, args)], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    env: process.env
  });

  if (result.status !== 0) {
    return {
      preset,
      ok: false,
      status: result.status,
      stderr: result.stderr.trim(),
      stdout: result.stdout.trim()
    };
  }

  try {
    return {
      preset,
      ok: true,
      result: JSON.parse(result.stdout)
    };
  } catch (error) {
    return {
      preset,
      ok: false,
      status: result.status,
      stderr: `Invalid JSON output: ${error instanceof Error ? error.message : String(error)}`,
      stdout: result.stdout.trim()
    };
  }
}

function usage() {
  return {
    usage: 'node tools/ga4-watch-tabs.js [--property <id>] [--start-date <date>] [--end-date <date>] [--dry-run]',
    presets: PRESETS
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(`${JSON.stringify(usage(), null, 2)}\n`);
    process.exit(0);
  }

  const reports = PRESETS.map((preset) => runPreset(preset, args));
  const failed = reports.find((report) => !report.ok);

  process.stdout.write(`${JSON.stringify({
    property: args.property || process.env.GA4_PROPERTY_ID || null,
    startDate: args['start-date'] || '30daysAgo',
    endDate: args['end-date'] || 'today',
    presets: reports
  }, null, 2)}\n`);

  process.exit(failed ? 1 : 0);
}

main();
