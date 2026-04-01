#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  normalizeRelative,
  readApprovalState,
  readStrategyState,
  readTeamRuntimeState
} = require('./hooks/workflow-utils.cjs');

function planLabel(projectRoot, approval) {
  return approval.activePlan
    ? normalizeRelative(projectRoot, approval.activePlan)
    : 'none';
}

function strategyLabel(projectRoot, strategy) {
  return strategy.memoPath
    ? normalizeRelative(projectRoot, strategy.memoPath)
    : 'none';
}

function approvalLabel(approval) {
  if (approval.implementationReady) {
    return 'approved';
  }

  if (approval.approvedPlan) {
    return 'approved-blocked';
  }

  if (approval.pendingPlan) {
    return 'pending';
  }

  if (approval.resolution === 'ambiguous') {
    return 'ambiguous';
  }

  return 'missing';
}

function strategyStatusLabel(strategy) {
  if (strategy.ready) {
    return 'ready';
  }

  if (strategy.memoPath) {
    return 'incomplete';
  }

  if (strategy.resolution === 'ambiguous') {
    return 'ambiguous';
  }

  return 'missing';
}

function folderLabel(relativePath) {
  if (!relativePath || relativePath === 'none') {
    return 'none';
  }

  return path.basename(path.dirname(relativePath)) || 'none';
}

try {
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const approval = readApprovalState(projectRoot);
  const strategy = readStrategyState(projectRoot);
  const teamRuntime = readTeamRuntimeState(projectRoot);
  const progress = teamRuntime.progress || {};
  const strategyPath = strategyLabel(projectRoot, strategy);
  const planPath = planLabel(projectRoot, approval);

  const parts = [
    `team:${teamRuntime.activeTeam || 'none'}`,
    `tasks:${progress.total ? `${progress.completed || 0}/${progress.total}` : '0/0'}`,
    `phase:${teamRuntime.phase || 'idle'}`,
    `strategy:${strategyStatusLabel(strategy)}`,
    `plan:${approvalLabel(approval)}`,
    `strategy-file:${folderLabel(strategyPath)}`,
    `plan-file:${folderLabel(planPath)}`
  ];

  process.stdout.write(`${parts.join(' | ')}\n`);
  process.exit(0);
} catch {
  process.stdout.write('team:none | tasks:0/0 | phase:idle | strategy:missing | plan:missing\n');
  process.exit(0);
}
