#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PLAN_APPROVED_PATTERN = /^\s*approval status\s*:\s*approved\s*$/im;
const PLAN_PENDING_PATTERN = /^\s*approval status\s*:\s*pending\s*$/im;
const AGENT_SESSION_STATE_FILE = path.join('.claude', 'state', 'agent-sessions.json');
const ACTIVE_PLAN_STATE_FILE = path.join('.claude', 'state', 'active-plan.json');
const ACTIVE_STRATEGY_STATE_FILE = path.join('.claude', 'state', 'active-strategy.json');
const EXEMPT_PREFIXES = [
  '.claude/',
  'plans/',
  'reports/',
  'docs/'
];
const EXEMPT_FILES = new Set([
  'README.md',
  'CLAUDE.md',
  'tracking-plan.md'
]);
const QA_TEST_FILE_PATTERNS = [
  /(^|\/)__tests__\//,
  /(^|\/)(tests?|e2e|playwright|cypress|spec)\//,
  /\.(test|spec)\.[^/]+$/i,
  /(^|\/)(vitest|jest|playwright|cypress)\.config\.[^/]+$/i
];
const STRATEGY_REQUIRED_SECTIONS = [
  {
    label: 'target audience',
    pattern: /^##\s+.*(?:Target Audience|Đối Tượng Ưu Tiên).*$/im
  },
  {
    label: 'positioning',
    pattern: /^##\s+.*(?:Positioning|Định Vị).*$/im
  },
  {
    label: 'channel priorities',
    pattern: /^##\s+.*(?:Channel Priorities|Ưu Tiên Kênh).*$/im
  },
  {
    label: 'priority experiments',
    pattern: /^##\s+.*(?:Priority Experiments|Thí Nghiệm Ưu Tiên).*$/im
  },
  {
    label: 'measurement notes',
    pattern: /^##\s+.*(?:Measurement Notes|Ghi Chú Đo Lường).*$/im
  },
  {
    label: 'concrete dev asks',
    pattern: /^##\s+.*(?:Concrete Dev Asks|Yêu Cầu Cho Dev).*$/im
  },
  {
    label: 'PM intake packet',
    pattern: /^##\s+.*(?:PM Intake Packet|Gói Bàn Giao PM).*$/im
  },
  {
    label: 'role handoffs',
    pattern: /^##\s+.*(?:Role Handoffs|Bàn Giao Vai Trò).*$/im
  }
];
const AGENT_EDIT_POLICIES = {
  'market-researcher': {
    label: 'research artifacts only',
    allowPrefixes: ['reports/', 'docs/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'competitor-analyst': {
    label: 'research artifacts only',
    allowPrefixes: ['reports/', 'docs/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'ga4-analyst': {
    label: 'tracking plans, reports, and docs only',
    allowPrefixes: ['reports/', 'docs/'],
    allowFiles: ['README.md', 'CLAUDE.md', 'tracking-plan.md']
  },
  'marketing-strategist': {
    label: 'docs, plans, and strategy artifacts only',
    allowPrefixes: ['reports/', 'docs/', 'plans/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'social-media-manager': {
    label: 'docs, plans, reports, and scheduling artifacts only',
    allowPrefixes: ['reports/', 'docs/', 'plans/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'seo-specialist': {
    label: 'reports, docs, and plans only',
    allowPrefixes: ['reports/', 'docs/', 'plans/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'revops-manager': {
    label: 'docs, plans, and operating playbooks only',
    allowPrefixes: ['reports/', 'docs/', 'plans/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'growth-manager': {
    label: 'docs, plans, and funnel strategy artifacts only',
    allowPrefixes: ['reports/', 'docs/', 'plans/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'project-manager': {
    label: 'plans and docs only',
    allowPrefixes: ['docs/', 'plans/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'implementation-planner': {
    label: 'plans only',
    allowPrefixes: ['plans/']
  },
  'qa-tester': {
    label: 'test files only',
    allowPatterns: QA_TEST_FILE_PATTERNS
  }
};

function buildOperatingBar() {
  return [
    'Operating bar: every employee in this company is senior-only.',
    'Lead with trade-offs, evidence quality, failure modes, rollback or test implications, and explicit handoffs.'
  ].join('\n');
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function walk(dir, predicate, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, results);
      continue;
    }

    if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function realish(filePath) {
  try {
    return fs.realpathSync(filePath);
  } catch {
    try {
      return path.join(fs.realpathSync(path.dirname(filePath)), path.basename(filePath));
    } catch {
      return path.resolve(filePath);
    }
  }
}

function normalizeRelative(projectRoot, filePath) {
  const relative = path.relative(realish(projectRoot), realish(filePath));
  return relative.split(path.sep).join('/');
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function listPlanFiles(projectRoot) {
  return walk(
    path.join(projectRoot, 'plans'),
    (fullPath) => path.basename(fullPath).toLowerCase() === 'plan.md'
  );
}

function listStrategyMemoFiles(projectRoot) {
  return walk(
    path.join(projectRoot, 'reports', 'strategy'),
    (fullPath) => path.basename(fullPath).toLowerCase() === 'strategy-memo.md'
  );
}

function matchApprovalState(planFile) {
  const content = safeRead(planFile) || '';
  return {
    approved: PLAN_APPROVED_PATTERN.test(content),
    pending: PLAN_PENDING_PATTERN.test(content)
  };
}

function getActivePlanStatePath(projectRoot) {
  return path.join(projectRoot, ACTIVE_PLAN_STATE_FILE);
}

function getActiveStrategyStatePath(projectRoot) {
  return path.join(projectRoot, ACTIVE_STRATEGY_STATE_FILE);
}

function readActivePlan(projectRoot) {
  const state = readJson(getActivePlanStatePath(projectRoot));
  const relativePath = typeof state.planPath === 'string'
    ? state.planPath.trim().replace(/\\/g, '/')
    : '';

  if (!relativePath) {
    return {
      exists: false,
      relativePath: null,
      absolutePath: null,
      updatedAt: null
    };
  }

  const absolutePath = path.join(projectRoot, relativePath);
  return {
    exists: fs.existsSync(absolutePath),
    relativePath,
    absolutePath,
    updatedAt: state.updatedAt || null
  };
}

function readActiveStrategy(projectRoot) {
  const state = readJson(getActiveStrategyStatePath(projectRoot));
  const relativePath = typeof state.memoPath === 'string'
    ? state.memoPath.trim().replace(/\\/g, '/')
    : '';

  if (!relativePath) {
    return {
      exists: false,
      relativePath: null,
      absolutePath: null,
      updatedAt: null
    };
  }

  const absolutePath = path.join(projectRoot, relativePath);
  return {
    exists: fs.existsSync(absolutePath),
    relativePath,
    absolutePath,
    updatedAt: state.updatedAt || null
  };
}

function setActivePlan(projectRoot, planFile) {
  if (!planFile) {
    return;
  }

  const relativePath = normalizeRelative(projectRoot, planFile);
  if (
    relativePath.startsWith('..') ||
    path.basename(relativePath).toLowerCase() !== 'plan.md' ||
    !relativePath.startsWith('plans/')
  ) {
    return;
  }

  const statePath = getActivePlanStatePath(projectRoot);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    `${JSON.stringify({
      planPath: relativePath,
      updatedAt: new Date().toISOString()
    }, null, 2)}\n`
  );
}

function setActiveStrategy(projectRoot, strategyFile) {
  if (!strategyFile) {
    return;
  }

  const relativePath = normalizeRelative(projectRoot, strategyFile);
  if (
    relativePath.startsWith('..') ||
    path.basename(relativePath).toLowerCase() !== 'strategy-memo.md' ||
    !relativePath.startsWith('reports/strategy/')
  ) {
    return;
  }

  const statePath = getActiveStrategyStatePath(projectRoot);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    `${JSON.stringify({
      memoPath: relativePath,
      updatedAt: new Date().toISOString()
    }, null, 2)}\n`
  );
}

function evaluateStrategyMemo(strategyFile) {
  const content = safeRead(strategyFile) || '';
  const missingSections = STRATEGY_REQUIRED_SECTIONS
    .filter(({ pattern }) => !pattern.test(content))
    .map(({ label }) => label);

  return {
    ready: missingSections.length === 0,
    missingSections
  };
}

function readStrategyState(projectRoot) {
  const memoFiles = listStrategyMemoFiles(projectRoot);
  const activeStrategy = readActiveStrategy(projectRoot);

  if (activeStrategy.exists) {
    const activeState = evaluateStrategyMemo(activeStrategy.absolutePath);
    return {
      ready: activeState.ready,
      memoPath: activeStrategy.absolutePath,
      activeStrategy: activeStrategy.absolutePath,
      missingSections: activeState.missingSections,
      totalMemos: memoFiles.length,
      resolution: 'active'
    };
  }

  if (memoFiles.length === 1) {
    const onlyMemo = memoFiles[0];
    const memoState = evaluateStrategyMemo(onlyMemo);
    return {
      ready: memoState.ready,
      memoPath: onlyMemo,
      activeStrategy: onlyMemo,
      missingSections: memoState.missingSections,
      totalMemos: 1,
      resolution: 'single'
    };
  }

  return {
    ready: false,
    memoPath: null,
    activeStrategy: null,
    missingSections: [],
    totalMemos: memoFiles.length,
    resolution: memoFiles.length ? 'ambiguous' : 'missing'
  };
}

function readApprovalState(projectRoot) {
  const planFiles = listPlanFiles(projectRoot);
  const activePlan = readActivePlan(projectRoot);

  if (activePlan.exists) {
    const activeState = matchApprovalState(activePlan.absolutePath);
    return {
      approved: activeState.approved,
      approvedPlan: activeState.approved ? activePlan.absolutePath : null,
      pendingPlan: activeState.pending ? activePlan.absolutePath : null,
      activePlan: activePlan.absolutePath,
      totalPlans: planFiles.length,
      resolution: 'active'
    };
  }

  if (planFiles.length === 1) {
    const onlyPlan = planFiles[0];
    const planState = matchApprovalState(onlyPlan);
    return {
      approved: planState.approved,
      approvedPlan: planState.approved ? onlyPlan : null,
      pendingPlan: planState.pending ? onlyPlan : null,
      activePlan: onlyPlan,
      totalPlans: 1,
      resolution: 'single'
    };
  }

  let approvedCount = 0;
  let pendingCount = 0;
  for (const planFile of planFiles) {
    const planState = matchApprovalState(planFile);
    if (planState.approved) {
      approvedCount += 1;
    }
    if (planState.pending) {
      pendingCount += 1;
    }
  }

  return {
    approved: false,
    approvedPlan: null,
    pendingPlan: null,
    activePlan: null,
    totalPlans: planFiles.length,
    approvedCount,
    pendingCount,
    resolution: planFiles.length ? 'ambiguous' : 'missing'
  };
}

function isExemptPath(projectRoot, filePath) {
  const relative = normalizeRelative(projectRoot, filePath);

  if (relative.startsWith('..')) {
    return false;
  }

  if (EXEMPT_FILES.has(relative)) {
    return true;
  }

  return EXEMPT_PREFIXES.some((prefix) => relative.startsWith(prefix));
}

function extractToolFilePath(payload) {
  const input = payload?.tool_input || {};
  return (
    input.file_path ||
    input.path ||
    input.target_file ||
    input.notebook_path ||
    null
  );
}

function readHookStdin() {
  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getAgentSessionStatePath(projectRoot) {
  return path.join(projectRoot, AGENT_SESSION_STATE_FILE);
}

function trimAgentSessionState(entries) {
  const ordered = Object.entries(entries)
    .sort((left, right) => {
      const leftTime = Date.parse(left[1]?.updatedAt || '') || 0;
      const rightTime = Date.parse(right[1]?.updatedAt || '') || 0;
      return rightTime - leftTime;
    })
    .slice(0, 200);
  return Object.fromEntries(ordered);
}

function recordAgentSession(projectRoot, sessionId, agentName) {
  if (!sessionId || !agentName) {
    return;
  }

  const statePath = getAgentSessionStatePath(projectRoot);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  const current = readJson(statePath);
  current[String(sessionId)] = {
    agentName: normalizeAgentName(agentName),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    statePath,
    `${JSON.stringify(trimAgentSessionState(current), null, 2)}\n`
  );
}

function normalizeAgentName(agentName) {
  if (!agentName) {
    return '';
  }

  return String(agentName).trim().toLowerCase();
}

function getRecordedAgentName(projectRoot, sessionId) {
  if (!sessionId) {
    return '';
  }

  const statePath = getAgentSessionStatePath(projectRoot);
  const state = readJson(statePath);
  return normalizeAgentName(state[String(sessionId)]?.agentName || '');
}

function getActingAgentName(projectRoot, payload) {
  const directType = normalizeAgentName(payload?.agent_type);
  if (directType) {
    return directType;
  }

  const directName = normalizeAgentName(payload?.agent_name);
  if (directName) {
    return directName;
  }

  const directId = normalizeAgentName(payload?.agent_id);
  if (directId && AGENT_EDIT_POLICIES[directId]) {
    return directId;
  }

  return getRecordedAgentName(projectRoot, payload?.session_id);
}

function getAgentEditPolicy(agentName) {
  return AGENT_EDIT_POLICIES[normalizeAgentName(agentName)] || null;
}

function describeAgentEditPolicy(agentName) {
  const policy = getAgentEditPolicy(agentName);
  if (!policy) {
    return '';
  }

  return `Edit scope: ${policy.label}.`;
}

function isAllowedByAgentPolicy(relativePath, policy) {
  if (!policy || !relativePath || relativePath.startsWith('..')) {
    return !policy;
  }

  if ((policy.allowFiles || []).includes(relativePath)) {
    return true;
  }

  if ((policy.allowPrefixes || []).some((prefix) => relativePath.startsWith(prefix))) {
    return true;
  }

  return (policy.allowPatterns || []).some((pattern) => pattern.test(relativePath));
}

function validateAgentEditPath(projectRoot, payload, filePath) {
  const agentName = getActingAgentName(projectRoot, payload);
  const policy = getAgentEditPolicy(agentName);

  if (!policy || !filePath) {
    return { allowed: true, agentName, policy };
  }

  const relativePath = normalizeRelative(projectRoot, filePath);
  const allowed = isAllowedByAgentPolicy(relativePath, policy);

  return {
    allowed,
    agentName,
    policy,
    relativePath
  };
}

function buildWorkflowSummary(projectRoot) {
  const approval = readApprovalState(projectRoot);
  const strategy = readStrategyState(projectRoot);
  const activePlanLabel = approval.activePlan
    ? normalizeRelative(projectRoot, approval.activePlan)
    : 'none';
  const activeStrategyLabel = strategy.activeStrategy
    ? normalizeRelative(projectRoot, strategy.activeStrategy)
    : 'none';

  let planStatus = 'missing';
  if (approval.approved && approval.approvedPlan) {
    planStatus = `approved (${normalizeRelative(projectRoot, approval.approvedPlan)})`;
  } else if (approval.pendingPlan) {
    planStatus = `pending (${normalizeRelative(projectRoot, approval.pendingPlan)})`;
  } else if (approval.resolution === 'ambiguous') {
    planStatus =
      `blocked (multiple plans exist; set the active plan by editing the target plan.md. ` +
      `approved=${approval.approvedCount || 0}, pending=${approval.pendingCount || 0})`;
  }

  let strategyStatus = 'missing';
  if (strategy.ready && strategy.memoPath) {
    strategyStatus = `ready (${normalizeRelative(projectRoot, strategy.memoPath)})`;
  } else if (strategy.memoPath) {
    strategyStatus =
      `incomplete (${normalizeRelative(projectRoot, strategy.memoPath)}; ` +
      `missing: ${strategy.missingSections.join(', ')})`;
  } else if (strategy.resolution === 'ambiguous') {
    strategyStatus =
      `blocked (multiple strategy memos exist; set the active strategy by editing the target ` +
      `strategy-memo.md. total=${strategy.totalMemos || 0})`;
  }

  return [
    'Company workflow:',
    '1. market-researcher + competitor-analyst + ga4-analyst gather market, competitor, and measurement evidence and save artifacts under reports/research/ or tracking-plan.md',
    '2. marketing-strategist turns evidence into a saved strategy memo under reports/strategy/YYYYMMDD-[slug]/strategy-memo.md',
    '3. social-media-manager / seo-specialist / revops-manager / growth-manager turn strategy into calendars, discoverability plans, funnel ops, and lifecycle recommendations when needed',
    '4. project-manager scopes backlog only after a complete saved strategy memo exists; codebase-scout maps current system, technical-brainstormer evaluates trade-offs',
    '5. implementation-planner writes plan.md with `Approval Status: pending`',
    '6. User approves -> plan updated to `Approval Status: approved` -> engineers implement',
    '7. quality-reviewer then qa-tester run quality gate before any release',
    `Active strategy memo: ${activeStrategyLabel}`,
    `Current strategy memo: ${strategyStatus}`,
    `Active plan: ${activePlanLabel}`,
    `Current plan approval: ${planStatus}`,
    'Delegation rule: the main session orchestrates subagents; subagents report back, they do not recursively spawn more subagents.',
    buildOperatingBar()
  ].join('\n');
}

function responseWithContext(eventName, additionalContext) {
  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext
    }
  };
}

module.exports = {
  buildOperatingBar,
  buildWorkflowSummary,
  describeAgentEditPolicy,
  extractToolFilePath,
  getActingAgentName,
  isExemptPath,
  normalizeRelative,
  recordAgentSession,
  readActivePlan,
  readApprovalState,
  readStrategyState,
  readHookStdin,
  responseWithContext,
  setActivePlan,
  setActiveStrategy,
  validateAgentEditPath
};
