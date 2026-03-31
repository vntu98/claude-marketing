#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  isExemptPath,
  normalizeRelative,
  readApprovalState,
  readHookStdin,
  validateAgentEditPath
} = require('./workflow-utils.cjs');

const APPLY_PATCH_PATTERN = /^\*\*\* (?:Add|Delete|Update) File:\s+(.+)\s*$/gm;
const MOVE_TO_PATTERN = /^\*\*\* Move to:\s+(.+)\s*$/gm;
const REDIRECT_PATTERN = /(?:^|[^\d])>>?\s*(['"]?)([^'"\s|&;]+)\1/g;
const TEE_PATTERN = /\btee\b(?:\s+-a)?\s+(['"]?)([^'"\s|&;]+)\1/g;
const SED_IN_PLACE_PATTERN = /\bsed\s+-i(?:\s+['"][^'"]*['"])?(?:\s+-e\s+['"][^'"]*['"])?\s+['"][^'"]*['"]\s+(['"]?)([^'"\s|&;]+)\1/g;
const PERL_IN_PLACE_PATTERN = /\bperl\s+-pi(?:\s+['"][^'"]*['"])?(?:\s+-e\s+['"][^'"]*['"])?\s+(['"]?)([^'"\s|&;]+)\1/g;

function looksLikeMutatingShellCommand(command) {
  return [
    /\bapply_patch\b/,
    /(?:^|[^\d])>>?\s*[^\s]/,
    /\btee\b/,
    /\bsed\s+-i\b/,
    /\bperl\s+-pi\b/
  ].some((pattern) => pattern.test(command));
}

function resolveCommandPath(projectRoot, cwd, rawPath) {
  const cleaned = String(rawPath || '').trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '/dev/null' || cleaned.startsWith('$')) {
    return null;
  }

  if (cleaned.startsWith('~')) {
    const home = process.env.HOME || '';
    return home ? path.join(home, cleaned.slice(1)) : null;
  }

  return path.isAbsolute(cleaned)
    ? cleaned
    : path.join(cwd || projectRoot, cleaned);
}

function commandRelative(projectRoot, targetPath) {
  return path.relative(path.resolve(projectRoot), path.resolve(targetPath)).split(path.sep).join('/');
}

function collectMatches(pattern, command, projectRoot, cwd, bucket) {
  let match;
  while ((match = pattern.exec(command))) {
    const resolved = resolveCommandPath(projectRoot, cwd, match[2] || match[1]);
    if (resolved) {
      bucket.add(resolved);
    }
  }
  pattern.lastIndex = 0;
}

function extractApplyPatchTargets(command, projectRoot, cwd) {
  const targets = new Set();
  let match;

  while ((match = APPLY_PATCH_PATTERN.exec(command))) {
    const resolved = resolveCommandPath(projectRoot, cwd, match[1]);
    if (resolved) {
      targets.add(resolved);
    }
  }
  APPLY_PATCH_PATTERN.lastIndex = 0;

  while ((match = MOVE_TO_PATTERN.exec(command))) {
    const resolved = resolveCommandPath(projectRoot, cwd, match[1]);
    if (resolved) {
      targets.add(resolved);
    }
  }
  MOVE_TO_PATTERN.lastIndex = 0;

  return targets;
}

function collectMutationTargets(command, projectRoot, cwd) {
  const targets = extractApplyPatchTargets(command, projectRoot, cwd);
  collectMatches(REDIRECT_PATTERN, command, projectRoot, cwd, targets);
  collectMatches(TEE_PATTERN, command, projectRoot, cwd, targets);
  collectMatches(SED_IN_PLACE_PATTERN, command, projectRoot, cwd, targets);
  collectMatches(PERL_IN_PLACE_PATTERN, command, projectRoot, cwd, targets);
  return [...targets];
}

function deny(reason) {
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  });
}

try {
  const payload = readHookStdin();
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const cwd = payload.cwd || projectRoot;
  const command = String(payload?.tool_input?.command || '');

  if (!command || !looksLikeMutatingShellCommand(command)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  const approval = readApprovalState(projectRoot);
  const targets = collectMutationTargets(command, projectRoot, cwd)
    .filter((target) => !commandRelative(projectRoot, target).startsWith('..'));

  if (!targets.length) {
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  }

  for (const target of targets) {
    const scopedDecision = validateAgentEditPath(projectRoot, payload, target);
    if (!scopedDecision.allowed) {
      process.stdout.write(
        deny(
          `${scopedDecision.agentName || 'This role'} may edit ${scopedDecision.policy.label}. ` +
          `Blocked shell mutation to ${scopedDecision.relativePath || normalizeRelative(projectRoot, target)}.`
        )
      );
      process.exit(0);
    }

    if (isExemptPath(projectRoot, target)) {
      continue;
    }

    if (!approval.approved) {
      process.stdout.write(
        deny(
          'Shell-based file mutations are blocked until the active plan (or the only plan in plans/**/plan.md) ' +
          'contains `Approval Status: approved`. Use planning first, then implement.'
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
