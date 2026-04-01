#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const PLAN_APPROVED_PATTERN = /^\s*approval status\s*:\s*approved\s*$/im;
const PLAN_PENDING_PATTERN = /^\s*approval status\s*:\s*pending\s*$/im;
const AGENT_SESSION_STATE_FILE = path.join('.claude', 'state', 'agent-sessions.json');
const ACTIVE_PLAN_STATE_FILE = path.join('.claude', 'state', 'active-plan.json');
const ACTIVE_STRATEGY_STATE_FILE = path.join('.claude', 'state', 'active-strategy.json');
const TEAM_RUNTIME_STATE_FILE = path.join('.claude', 'state', 'team-runtime.json');
const SESSION_STATE_LATEST_FILE = path.join('.claude', 'session-state', 'latest.md');
const SESSION_STATE_ARCHIVE_DIR = path.join('.claude', 'session-state', 'archive');
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
const TASK_GRAPH_REQUIRED_FIELDS = [
  'id',
  'title',
  'owner',
  'dependencies',
  'fileGlobs',
  'acceptanceCriteria',
  'validationCommands',
  'blockingPolicy',
  'taskDescription'
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
    label: 'strategy intake packets, plans, and docs only',
    allowPrefixes: ['docs/', 'plans/', 'reports/strategy/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'codebase-scout': {
    label: 'findings artifacts only',
    allowPrefixes: ['docs/', 'reports/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'technical-brainstormer': {
    label: 'decision artifacts only',
    allowPrefixes: ['docs/', 'reports/'],
    allowFiles: ['README.md', 'CLAUDE.md']
  },
  'quality-reviewer': {
    label: 'review artifacts only',
    allowPrefixes: ['docs/', 'reports/'],
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

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasNonEmptyList(value) {
  if (Array.isArray(value)) {
    return value.some((entry) => hasText(String(entry || '')));
  }

  return hasText(String(value || ''));
}

function asArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return [value];
}

function resolveArtifact(projectRoot, artifactPath) {
  if (!artifactPath || typeof artifactPath !== 'string') {
    return '';
  }

  return path.isAbsolute(artifactPath)
    ? artifactPath
    : path.join(projectRoot, artifactPath);
}

function collectTaskQualityGateFailures(projectRoot, task, options = {}) {
  const metadata = task?.metadata || {};
  const subject = task?.subject || task?.title || task?.id || 'task';
  const failures = [];
  const artifactFlags = Array.isArray(options.artifactFlags)
    ? options.artifactFlags
    : ['enforceArtifactsOnIdle'];
  const validationFlags = Array.isArray(options.validationFlags)
    ? options.validationFlags
    : ['enforceValidationOnIdle'];
  const enforceArtifacts = artifactFlags.some((flag) => metadata[flag]);
  const enforceValidation = validationFlags.some((flag) => metadata[flag]);

  if (enforceArtifacts) {
    for (const artifact of asArray(metadata.requiredArtifacts)) {
      if (!fs.existsSync(resolveArtifact(projectRoot, artifact))) {
        failures.push(`Missing required artifact for ${subject}: ${artifact}`);
      }
    }
  }

  if (enforceValidation) {
    const hasValidation = metadata.validationPassed === true || metadata.validationRecorded === true;
    if (!hasValidation) {
      failures.push(
        `Validation not recorded for ${subject}. Run: ${asArray(metadata.validationCommands).join(', ') || 'the task validation command'}`
      );
    }
  }

  return failures;
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

function getClaudeRuntimeRoot() {
  return path.join(os.homedir(), '.claude');
}

function extractTeamNameFromAgentId(agentId) {
  const value = String(agentId || '').trim();
  const atIndex = value.indexOf('@');
  if (atIndex <= 0) {
    return '';
  }

  const teamName = value.slice(atIndex + 1).trim();
  if (!teamName || teamName.includes('/') || teamName.includes('\\') || teamName.includes('..')) {
    return '';
  }

  return teamName;
}

function getRuntimeTeamConfigPath(teamName) {
  if (!teamName) {
    return '';
  }

  return path.join(getClaudeRuntimeRoot(), 'teams', teamName, 'config.json');
}

function getRuntimeTaskDir(teamName) {
  if (!teamName) {
    return '';
  }

  return path.join(getClaudeRuntimeRoot(), 'tasks', teamName);
}

function readTeamConfig(teamName) {
  return readJson(getRuntimeTeamConfigPath(teamName));
}

function readTeamTasks(teamName) {
  const taskDir = getRuntimeTaskDir(teamName);
  if (!taskDir || !fs.existsSync(taskDir)) {
    return [];
  }

  return fs.readdirSync(taskDir)
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => {
      const filePath = path.join(taskDir, entry);
      const task = readJson(filePath);
      if (!task || typeof task !== 'object') {
        return null;
      }

      return {
        ...task,
        _taskFilePath: filePath,
        id: task.id || task.taskId || path.basename(entry, '.json')
      };
    })
    .filter(Boolean);
}

function getTaskDependencies(task) {
  if (!task || typeof task !== 'object') {
    return [];
  }

  const candidate = task.blockedBy || task.blocked_by || task.dependencies || [];
  return Array.isArray(candidate) ? candidate.filter(Boolean) : [];
}

function summarizeTeamTasks(teamName) {
  const tasks = readTeamTasks(teamName);
  if (!tasks.length) {
    return {
      pending: 0,
      inProgress: 0,
      completed: 0,
      total: 0,
      unblocked: []
    };
  }

  const completedIds = new Set(
    tasks
      .filter((task) => task.status === 'completed')
      .map((task) => String(task.id))
  );

  const summary = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: tasks.length,
    unblocked: []
  };

  for (const task of tasks) {
    const status = task.status || 'pending';
    if (status === 'completed') {
      summary.completed += 1;
      continue;
    }

    if (status === 'in_progress') {
      summary.inProgress += 1;
      continue;
    }

    summary.pending += 1;
    const dependencies = getTaskDependencies(task).map(String);
    const isUnblocked = dependencies.every((dependency) => completedIds.has(dependency));
    if (isUnblocked && !task.owner) {
      summary.unblocked.push({
        id: String(task.id),
        subject: task.subject || task.title || 'Untitled task',
        metadata: task.metadata || {}
      });
    }
  }

  return summary;
}

function listTeamPeers(teamName, currentAgentId) {
  const config = readTeamConfig(teamName);
  const members = Array.isArray(config.members) ? config.members : [];

  return members
    .filter((member) => member && member.agentId !== currentAgentId)
    .map((member) => ({
      name: member.name || '',
      agentType: member.agentType || member.agent_type || ''
    }))
    .filter((member) => member.name);
}

function listPlanFiles(projectRoot) {
  return walk(
    path.join(projectRoot, 'plans'),
    (fullPath) => path.basename(fullPath).toLowerCase() === 'plan.md'
  );
}

function getPlanRuntimeArtifacts(planFile) {
  if (!planFile) {
    return {
      planDir: null,
      taskGraphPath: null,
      ownershipMatrixPath: null
    };
  }

  const planDir = path.dirname(planFile);
  return {
    planDir,
    taskGraphPath: path.join(planDir, 'task-graph.json'),
    ownershipMatrixPath: path.join(planDir, 'ownership-matrix.md')
  };
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

function validateTaskGraphArtifact(taskGraphPath) {
  const result = {
    exists: false,
    valid: false,
    taskCount: 0,
    errors: []
  };

  if (!taskGraphPath || !fs.existsSync(taskGraphPath)) {
    result.errors.push('missing task-graph.json');
    return result;
  }

  result.exists = true;
  const content = safeRead(taskGraphPath);
  if (!hasText(content)) {
    result.errors.push('task-graph.json is empty');
    return result;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    result.errors.push('task-graph.json is not valid JSON');
    return result;
  }

  const tasks = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.tasks)
      ? parsed.tasks
      : null;

  if (!tasks) {
    result.errors.push('task-graph.json must be an array or contain a top-level `tasks` array');
    return result;
  }

  if (!tasks.length) {
    result.errors.push('task-graph.json must contain at least one task');
    return result;
  }

  result.taskCount = tasks.length;
  const errors = [];

  tasks.forEach((task, index) => {
    const label = hasText(task?.id) ? `task ${task.id}` : `task index ${index}`;
    if (!task || typeof task !== 'object' || Array.isArray(task)) {
      errors.push(`${label} must be an object`);
      return;
    }

    for (const field of TASK_GRAPH_REQUIRED_FIELDS) {
      if (!(field in task)) {
        errors.push(`${label} is missing \`${field}\``);
      }
    }

    if (!hasText(task.id)) {
      errors.push(`${label} must declare a non-empty id`);
    }

    if (!hasText(task.title)) {
      errors.push(`${label} must declare a non-empty title`);
    }

    if (!hasText(task.owner)) {
      errors.push(`${label} must declare a non-empty owner`);
    }

    if (!Array.isArray(task.dependencies)) {
      errors.push(`${label} must declare \`dependencies\` as an array`);
    }

    if (!hasNonEmptyList(task.fileGlobs)) {
      errors.push(`${label} must declare at least one file glob`);
    }

    if (!hasNonEmptyList(task.acceptanceCriteria)) {
      errors.push(`${label} must declare acceptance criteria`);
    }

    if (!hasNonEmptyList(task.validationCommands)) {
      errors.push(`${label} must declare validation commands`);
    }

    const blockingPolicy = task.blockingPolicy;
    const blockingPolicyValid = (
      hasText(blockingPolicy) ||
      (blockingPolicy && typeof blockingPolicy === 'object' && !Array.isArray(blockingPolicy) && Object.keys(blockingPolicy).length > 0)
    );
    if (!blockingPolicyValid) {
      errors.push(`${label} must declare a blocking policy`);
    }

    if (!hasText(task.taskDescription)) {
      errors.push(`${label} must declare a non-empty taskDescription`);
    }
  });

  result.valid = errors.length === 0;
  result.errors = errors;
  return result;
}

function readPlanBundleState(planFile) {
  const artifacts = getPlanRuntimeArtifacts(planFile);
  const taskGraph = validateTaskGraphArtifact(artifacts.taskGraphPath);
  const ownershipMatrixExists = Boolean(
    artifacts.ownershipMatrixPath &&
    fs.existsSync(artifacts.ownershipMatrixPath) &&
    hasText(safeRead(artifacts.ownershipMatrixPath))
  );
  const missingArtifacts = [];

  if (!ownershipMatrixExists) {
    missingArtifacts.push('ownership-matrix.md');
  }

  if (!taskGraph.exists) {
    missingArtifacts.push('task-graph.json');
  }

  return {
    ...artifacts,
    ready: taskGraph.valid && ownershipMatrixExists,
    missingArtifacts,
    taskGraphValid: taskGraph.valid,
    taskGraphErrors: taskGraph.errors,
    taskCount: taskGraph.taskCount,
    ownershipMatrixReady: ownershipMatrixExists
  };
}

function summarizePlanBundleIssues(approval) {
  const issues = [];

  if (approval?.missingArtifacts?.includes('task-graph.json')) {
    issues.push('missing task-graph.json');
  } else if (approval && approval.taskGraphValid === false && approval.taskGraphErrors?.length) {
    issues.push(...approval.taskGraphErrors);
  }

  if (approval?.missingArtifacts?.includes('ownership-matrix.md')) {
    issues.push('missing ownership-matrix.md');
  } else if (approval && approval.ownershipMatrixReady === false && approval.ownershipMatrixPath) {
    issues.push('ownership-matrix.md is empty');
  }

  return [...new Set(issues.filter(Boolean))];
}

function getActivePlanStatePath(projectRoot) {
  return path.join(projectRoot, ACTIVE_PLAN_STATE_FILE);
}

function getActiveStrategyStatePath(projectRoot) {
  return path.join(projectRoot, ACTIVE_STRATEGY_STATE_FILE);
}

function getTeamRuntimeStatePath(projectRoot) {
  return path.join(projectRoot, TEAM_RUNTIME_STATE_FILE);
}

function getSessionStateLatestPath(projectRoot) {
  return path.join(projectRoot, SESSION_STATE_LATEST_FILE);
}

function getSessionStateArchiveDir(projectRoot) {
  return path.join(projectRoot, SESSION_STATE_ARCHIVE_DIR);
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

function readTeamRuntimeState(projectRoot) {
  const state = readJson(getTeamRuntimeStatePath(projectRoot));
  return state && typeof state === 'object' ? state : {};
}

function writeTeamRuntimeState(projectRoot, partialState) {
  if (!partialState || typeof partialState !== 'object') {
    return;
  }

  const statePath = getTeamRuntimeStatePath(projectRoot);
  const current = readTeamRuntimeState(projectRoot);
  const nextState = {
    ...current,
    ...partialState,
    updatedAt: new Date().toISOString()
  };

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(nextState, null, 2)}\n`);
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

function readLatestSessionState(projectRoot) {
  return safeRead(getSessionStateLatestPath(projectRoot));
}

function formatTaskOwner(task) {
  return task?.owner || task?.assignee || task?.metadata?.owner || '';
}

function listAssignedTeamTasks(teamName, teammateName) {
  if (!teamName || !teammateName) {
    return [];
  }

  const normalizedTeammate = String(teammateName).trim().toLowerCase();
  return readTeamTasks(teamName)
    .filter((task) => String(formatTaskOwner(task) || '').trim().toLowerCase() === normalizedTeammate)
    .sort((left, right) => {
      const statusWeight = { in_progress: 0, pending: 1, completed: 2 };
      const leftWeight = statusWeight[left.status] ?? 3;
      const rightWeight = statusWeight[right.status] ?? 3;
      if (leftWeight !== rightWeight) {
        return leftWeight - rightWeight;
      }

      return String(left.id).localeCompare(String(right.id));
    });
}

function relativeLabel(projectRoot, absolutePath, fallback = 'none') {
  return absolutePath ? normalizeRelative(projectRoot, absolutePath) : fallback;
}

function approvalSummaryLabel(projectRoot, approval) {
  if (approval.approvedPlan && approval.implementationReady) {
    return `approved (${relativeLabel(projectRoot, approval.approvedPlan)})`;
  }

  if (approval.approvedPlan) {
    const issues = summarizePlanBundleIssues(approval);
    const missing = issues.length
      ? issues[0]
      : 'runtime artifacts incomplete';
    return `approved-but-blocked (${relativeLabel(projectRoot, approval.approvedPlan)}; ${missing})`;
  }

  if (approval.pendingPlan) {
    return `pending (${relativeLabel(projectRoot, approval.pendingPlan)})`;
  }

  if (approval.resolution === 'ambiguous') {
    return `ambiguous (${approval.totalPlans || 0} plans)`;
  }

  return 'missing';
}

function strategySummaryLabel(projectRoot, strategy) {
  if (strategy.ready && strategy.memoPath) {
    return `ready (${relativeLabel(projectRoot, strategy.memoPath)})`;
  }

  if (strategy.memoPath) {
    return `incomplete (${relativeLabel(projectRoot, strategy.memoPath)})`;
  }

  if (strategy.resolution === 'ambiguous') {
    return `ambiguous (${strategy.totalMemos || 0} memos)`;
  }

  return 'missing';
}

function isoTimestampLabel(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}-${hour}${minute}`;
}

function buildSessionStateMarkdown(projectRoot, payload = {}) {
  const approval = readApprovalState(projectRoot);
  const strategy = readStrategyState(projectRoot);
  const teamRuntime = readTeamRuntimeState(projectRoot);
  const generatedAt = new Date().toISOString();
  const eventLabel = payload.hook_event_name || payload.source || 'unknown';
  const activeStrategyLabel = relativeLabel(projectRoot, strategy.activeStrategy);
  const activePlanLabel = relativeLabel(projectRoot, approval.activePlan);
  const progress = teamRuntime.progress || {};
  const completed = [];
  const remaining = [];
  const artifacts = [];
  const checklist = [];

  if (strategy.ready && strategy.memoPath) {
    completed.push(`- Strategy memo ready: ${relativeLabel(projectRoot, strategy.memoPath)}`);
  } else if (strategy.memoPath) {
    remaining.push(
      `- Finish the active strategy memo: ${relativeLabel(projectRoot, strategy.memoPath)} (missing: ${strategy.missingSections.join(', ')})`
    );
  } else {
    remaining.push('- No active strategy memo recorded yet. Run the marketing cycle or save strategy-memo.md first.');
  }

  if (approval.approved && approval.approvedPlan && approval.implementationReady) {
    completed.push(`- Approved plan active: ${relativeLabel(projectRoot, approval.approvedPlan)}`);
    if (approval.taskCount) {
      completed.push(`- Task graph ready with ${approval.taskCount} task(s).`);
    }
  } else if (approval.approvedPlan) {
    const bundleIssues = summarizePlanBundleIssues(approval);
    remaining.push(
      `- Approved plan is not implementation-ready yet: ${relativeLabel(projectRoot, approval.approvedPlan)}.` +
      `${bundleIssues.length ? ` Fix: ${bundleIssues.join('; ')}.` : ''}`
    );
  } else if (approval.pendingPlan) {
    remaining.push(`- Plan still pending user approval: ${relativeLabel(projectRoot, approval.pendingPlan)}`);
  } else if (approval.resolution === 'ambiguous') {
    remaining.push(
      `- Multiple plans exist without a clear active plan (${approval.totalPlans || 0} total). Re-open the target plan.md before implementation.`
    );
  } else {
    remaining.push('- No active implementation plan recorded yet.');
  }

  if (teamRuntime.activeTeam) {
    const taskSummary = progress.total
      ? `${progress.completed || 0}/${progress.total} complete; ${progress.pending || 0} pending; ${progress.inProgress || 0} in progress`
      : 'task progress unavailable';
    completed.push(`- Team runtime tracked: ${teamRuntime.activeTeam} (${taskSummary})`);
  }

  if (teamRuntime.lastTask?.subject) {
    completed.push(
      `- Last completed task: #${teamRuntime.lastTask.id || '?'} ${teamRuntime.lastTask.subject}` +
        `${teamRuntime.lastTask.teammate ? ` (${teamRuntime.lastTask.teammate})` : ''}`
    );
  }

  if ((progress.pending || 0) + (progress.inProgress || 0) > 0) {
    remaining.push(
      `- Team work remains: ${progress.pending || 0} pending and ${progress.inProgress || 0} in progress` +
        `${teamRuntime.phase ? ` in phase ${teamRuntime.phase}` : ''}.`
    );
  }

  if (teamRuntime.idleTeammate) {
    remaining.push(`- ${teamRuntime.idleTeammate} is idle. Reassign an unblocked task or shut the teammate down.`);
  }

  if (teamRuntime.lastConfigChange?.filePath) {
    artifacts.push(
      `- Last config change: ${teamRuntime.lastConfigChange.source || 'unknown'} -> ${teamRuntime.lastConfigChange.filePath}`
    );
  }

  artifacts.push(`- Active strategy: ${activeStrategyLabel}`);
  artifacts.push(`- Active plan: ${activePlanLabel}`);
  artifacts.push(`- Strategy status: ${strategySummaryLabel(projectRoot, strategy)}`);
  artifacts.push(`- Plan status: ${approvalSummaryLabel(projectRoot, approval)}`);
  if (approval.taskGraphPath) {
    artifacts.push(`- Task graph: ${relativeLabel(projectRoot, approval.taskGraphPath)}`);
  }
  if (approval.ownershipMatrixPath) {
    artifacts.push(`- Ownership matrix: ${relativeLabel(projectRoot, approval.ownershipMatrixPath)}`);
  }

  checklist.push('- Re-open the active strategy memo and active plan before dispatching more work.');
  checklist.push('- Check task ownership before parallelizing; do not let two engineers touch the same files.');
  if (!approval.approved) {
    checklist.push('- Keep implementation blocked until the active plan says `Approval Status: approved`.');
  } else if (!approval.implementationReady) {
    checklist.push('- Do not dispatch engineers yet. Regenerate `task-graph.json` and `ownership-matrix.md` for the active approved plan.');
  } else {
    checklist.push('- If implementation resumes, start from ownership-matrix.md and validation commands, not memory.');
  }
  if (teamRuntime.activeTeam) {
    checklist.push(`- Inspect current task progress for team ${teamRuntime.activeTeam} before spawning or shutting down teammates.`);
  }

  return [
    '# Session State',
    `<!-- Generated: ${generatedAt} -->`,
    `<!-- Event: ${eventLabel} -->`,
    `<!-- Strategy: ${activeStrategyLabel} -->`,
    `<!-- Plan: ${activePlanLabel} -->`,
    '',
    '## Workflow Snapshot',
    `- Strategy: ${strategySummaryLabel(projectRoot, strategy)}`,
    `- Plan: ${approvalSummaryLabel(projectRoot, approval)}`,
    `- Team: ${teamRuntime.activeTeam || 'none'}`,
    `- Phase: ${teamRuntime.phase || 'idle'}`,
    '',
    '## What Worked (Verified)',
    ...(completed.length ? completed : ['- (No completed tasks recorded)']),
    '',
    "## What's Left",
    ...(remaining.length ? remaining : ['- (All tracked workflow gates complete)']),
    '',
    '## Active Artifacts',
    ...artifacts,
    '',
    '## Resume Checklist',
    ...checklist,
    ''
  ].join('\n');
}

function writeLatestSessionState(projectRoot, content) {
  const statePath = getSessionStateLatestPath(projectRoot);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, content.endsWith('\n') ? content : `${content}\n`);
}

function archiveSessionStateSnapshot(projectRoot, content) {
  const archiveDir = getSessionStateArchiveDir(projectRoot);
  fs.mkdirSync(archiveDir, { recursive: true });
  const archivePath = path.join(archiveDir, `${isoTimestampLabel()}.md`);
  fs.writeFileSync(archivePath, content.endsWith('\n') ? content : `${content}\n`);
  return archivePath;
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
    const bundle = readPlanBundleState(activePlan.absolutePath);
    return {
      approved: activeState.approved,
      approvedPlan: activeState.approved ? activePlan.absolutePath : null,
      pendingPlan: activeState.pending ? activePlan.absolutePath : null,
      activePlan: activePlan.absolutePath,
      implementationReady: activeState.approved && bundle.ready,
      totalPlans: planFiles.length,
      resolution: 'active',
      ...bundle
    };
  }

  if (planFiles.length === 1) {
    const onlyPlan = planFiles[0];
    const planState = matchApprovalState(onlyPlan);
    const bundle = readPlanBundleState(onlyPlan);
    return {
      approved: planState.approved,
      approvedPlan: planState.approved ? onlyPlan : null,
      pendingPlan: planState.pending ? onlyPlan : null,
      activePlan: onlyPlan,
      implementationReady: planState.approved && bundle.ready,
      totalPlans: 1,
      resolution: 'single',
      ...bundle
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
    implementationReady: false,
    totalPlans: planFiles.length,
    approvedCount,
    pendingCount,
    resolution: planFiles.length ? 'ambiguous' : 'missing',
    taskGraphPath: null,
    ownershipMatrixPath: null,
    missingArtifacts: [],
    taskGraphValid: false,
    taskGraphErrors: [],
    taskCount: 0,
    ownershipMatrixReady: false,
    ready: false
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
  const teamRuntime = readTeamRuntimeState(projectRoot);
  const activePlanLabel = approval.activePlan
    ? normalizeRelative(projectRoot, approval.activePlan)
    : 'none';
  const activeStrategyLabel = strategy.activeStrategy
    ? normalizeRelative(projectRoot, strategy.activeStrategy)
    : 'none';

  let planStatus = 'missing';
  if (approval.approved && approval.approvedPlan && approval.implementationReady) {
    planStatus = `approved (${normalizeRelative(projectRoot, approval.approvedPlan)})`;
  } else if (approval.approvedPlan) {
    const blockers = summarizePlanBundleIssues(approval);
    planStatus =
      `approved-but-blocked (${normalizeRelative(projectRoot, approval.approvedPlan)}; ` +
      `${blockers.join('; ') || 'runtime artifacts incomplete'})`;
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

  let teamRuntimeStatus = 'none';
  if (teamRuntime.activeTeam) {
    const progress = teamRuntime.progress || {};
    const taskSummary = progress.total
      ? ` ${progress.completed || 0}/${progress.total} tasks complete`
      : '';
    const phase = teamRuntime.phase ? ` phase=${teamRuntime.phase}` : '';
    teamRuntimeStatus = `${teamRuntime.activeTeam}${taskSummary}${phase}`;
  }

  return [
    'Company workflow:',
    '1. /eup-market-cycle creates a marketing intelligence team: market-researcher + competitor-analyst + ga4-analyst + seo-specialist or growth-manager, and saves evidence under reports/research/YYYYMMDD-[slug]/',
    '2. marketing-strategist synthesizes saved evidence into reports/strategy/YYYYMMDD-[slug]/strategy-memo.md',
    '3. /eup-debate optionally runs a structured company debate across marketing and dev before intake or planning is locked',
    '4. /eup-dev-intake creates the PM intake team: project-manager + codebase-scout + technical-brainstormer, then implementation-planner writes plans/<slug>/plan.md plus task-graph.json and ownership-matrix.md',
    '5. No implementation starts before the active plan contains `Approval Status: approved`',
    '6. /eup-implement runs the engineering team with distinct file ownership and worktree isolation when parallel implementation is safe',
    '7. quality-reviewer then qa-tester run the quality gate before any release or deploy',
    '8. /eup-company-status reports active strategy, plan, team progress, approval, and next handoff',
    `Active strategy memo: ${activeStrategyLabel}`,
    `Current strategy memo: ${strategyStatus}`,
    `Active plan: ${activePlanLabel}`,
    `Current plan approval: ${planStatus}`,
    approval.taskGraphPath && !approval.missingArtifacts?.includes('task-graph.json')
      ? `Current task graph: ${normalizeRelative(projectRoot, approval.taskGraphPath)}${approval.taskCount ? ` (${approval.taskCount} task(s))` : ''}`
      : approval.taskGraphPath
        ? `Current task graph: missing (expected ${normalizeRelative(projectRoot, approval.taskGraphPath)})`
        : 'Current task graph: missing',
    approval.ownershipMatrixPath && approval.ownershipMatrixReady
      ? `Current ownership matrix: ${normalizeRelative(projectRoot, approval.ownershipMatrixPath)}`
      : approval.ownershipMatrixPath
        ? `Current ownership matrix: missing (expected ${normalizeRelative(projectRoot, approval.ownershipMatrixPath)})`
        : 'Current ownership matrix: missing',
    `Active team runtime: ${teamRuntimeStatus}`,
    'Delegation rule: the main session is the team lead. Project subagents define teammate roles; teammates claim tasks, message the lead, and do not recursively spawn more teammates.',
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
  archiveSessionStateSnapshot,
  asArray,
  buildOperatingBar,
  buildSessionStateMarkdown,
  buildWorkflowSummary,
  collectTaskQualityGateFailures,
  describeAgentEditPolicy,
  extractTeamNameFromAgentId,
  extractToolFilePath,
  getActingAgentName,
  getRuntimeTaskDir,
  getRuntimeTeamConfigPath,
  listAssignedTeamTasks,
  listTeamPeers,
  isExemptPath,
  normalizeRelative,
  recordAgentSession,
  readActivePlan,
  readApprovalState,
  readLatestSessionState,
  readTeamConfig,
  readTeamRuntimeState,
  readTeamTasks,
  readStrategyState,
  readHookStdin,
  readPlanBundleState,
  responseWithContext,
  resolveArtifact,
  setActivePlan,
  setActiveStrategy,
  summarizePlanBundleIssues,
  summarizeTeamTasks,
  validateAgentEditPath,
  writeLatestSessionState,
  writeTeamRuntimeState
};
