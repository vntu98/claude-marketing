#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..', '..');
const { validateProject } = require('../scripts/validate-workflow.cjs');
const {
  readApprovalState,
  readStrategyState,
  summarizeTeamTasks
} = require('../hooks/workflow-utils.cjs');

function runHook(relativePath, payload, cwd, extraEnv = {}) {
  const result = spawnSync(
    process.execPath,
    [path.join(projectRoot, relativePath)],
    {
      cwd,
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: cwd,
        ...extraEnv
      },
      input: JSON.stringify(payload),
      encoding: 'utf8'
    }
  );

  return {
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
}

function listAgentFiles() {
  return fs.readdirSync(path.join(projectRoot, '.claude', 'agents'))
    .filter((file) => file.endsWith('.md'))
    .sort();
}

function writeActivePlan(tmpDir, relativePlanPath) {
  const stateDir = path.join(tmpDir, '.claude', 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(
    path.join(stateDir, 'active-plan.json'),
    `${JSON.stringify({
      planPath: relativePlanPath.replace(/\\/g, '/'),
      updatedAt: '2026-03-31T00:00:00.000Z'
    }, null, 2)}\n`
  );
}

function writeActiveStrategy(tmpDir, relativeMemoPath) {
  const stateDir = path.join(tmpDir, '.claude', 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(
    path.join(stateDir, 'active-strategy.json'),
    `${JSON.stringify({
      memoPath: relativeMemoPath.replace(/\\/g, '/'),
      updatedAt: '2026-03-31T00:00:00.000Z'
    }, null, 2)}\n`
  );
}

function setFileTimestamp(filePath, isoString) {
  const timestamp = new Date(isoString);
  fs.utimesSync(filePath, timestamp, timestamp);
}

function writeTeamRuntimeState(tmpDir, state) {
  const stateDir = path.join(tmpDir, '.claude', 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(
    path.join(stateDir, 'team-runtime.json'),
    `${JSON.stringify(state, null, 2)}\n`
  );
}

function buildApplyPatchCommand(targetPath) {
  return [
    "apply_patch <<'PATCH'",
    '*** Begin Patch',
    `*** Add File: ${targetPath}`,
    '+placeholder',
    '*** End Patch',
    'PATCH'
  ].join('\n');
}

function writeTeamTask(homeDir, teamName, task) {
  const taskDir = path.join(homeDir, '.claude', 'tasks', teamName);
  fs.mkdirSync(taskDir, { recursive: true });
  fs.writeFileSync(
    path.join(taskDir, `${task.id}.json`),
    `${JSON.stringify(task, null, 2)}\n`
  );
}

function writeTeamConfig(homeDir, teamName, members) {
  const teamDir = path.join(homeDir, '.claude', 'teams', teamName);
  fs.mkdirSync(teamDir, { recursive: true });
  fs.writeFileSync(
    path.join(teamDir, 'config.json'),
    `${JSON.stringify({ name: teamName, members }, null, 2)}\n`
  );
}

function writePlanRuntimeArtifacts(planDir, options = {}) {
  const {
    taskGraph = 'valid',
    ownershipMatrix = true
  } = options;

  fs.mkdirSync(planDir, { recursive: true });

  if (taskGraph === 'valid') {
    fs.writeFileSync(
      path.join(planDir, 'task-graph.json'),
      `${JSON.stringify({
        tasks: [
          {
            id: 'task-frontend',
            title: 'Implement frontend slice',
            owner: 'frontend-engineer',
            dependencies: [],
            fileGlobs: ['src/**'],
            acceptanceCriteria: ['approved UI slice is implemented'],
            validationCommands: ['npm test -- frontend'],
            blockingPolicy: 'strict',
            taskDescription: [
              'Phase: implementation',
              'Owner Role: frontend-engineer',
              'Depends On: none',
              'Context:',
              '- Business goal: implement the approved frontend slice',
              '- Constraints: stay within frontend-owned files only',
              'File Ownership:',
              '- src/**',
              'Isolation: worktree',
              'Acceptance Criteria:',
              '- approved UI slice is implemented',
              'Validation:',
              '- npm test -- frontend'
            ].join('\n')
          }
        ]
      }, null, 2)}\n`
    );
  } else if (taskGraph === 'invalid') {
    fs.writeFileSync(
      path.join(planDir, 'task-graph.json'),
      `${JSON.stringify({ tasks: [{ id: 'task-bad' }] }, null, 2)}\n`
    );
  }

  if (ownershipMatrix) {
    fs.writeFileSync(
      path.join(planDir, 'ownership-matrix.md'),
      '# Ownership Matrix\n\n- frontend-engineer: `src/**`\n'
    );
  }
}

test('workflow configuration validates', () => {
  const result = validateProject(projectRoot);
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('canonical context lives in .claude and no legacy copies are present', () => {
  assert.equal(fs.existsSync(path.join(projectRoot, '.claude', 'eup-context.md')), true);
  assert.equal(fs.existsSync(path.join(projectRoot, '.agents', 'eup-context.md')), false);
  assert.equal(fs.existsSync(path.join(projectRoot, '.agents', 'product-marketing-context.md')), false);
});

test('eup workflow entry skills exist and legacy ck artifacts are absent', () => {
  const requiredSkills = [
    '.claude/skills/eup-scout/SKILL.md',
    '.claude/skills/eup-brainstorm/SKILL.md',
    '.claude/skills/eup-plan/SKILL.md',
    '.claude/skills/eup-frontend/SKILL.md'
  ];

  for (const relativePath of requiredSkills) {
    assert.equal(
      fs.existsSync(path.join(projectRoot, relativePath)),
      true,
      `missing workflow skill ${relativePath}`
    );
  }

  const unexpectedSkillDirs = fs.readdirSync(path.join(projectRoot, '.claude', 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('eup-'))
    .map((entry) => entry.name);

  assert.deepEqual(unexpectedSkillDirs, []);
});

test('every project agent exposes hook context and required ending contract', () => {
  for (const file of listAgentFiles()) {
    const fullPath = path.join(projectRoot, '.claude', 'agents', file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const nameMatch = content.match(/^---[\s\S]*?^name:\s*(.+)\s*$/m);
    const seniorityMatch = content.match(/^---[\s\S]*?^seniority:\s*(.+)\s*$/m);
    const descriptionMatch = content.match(/^---[\s\S]*?^description:\s*(.+)\s*$/m);

    assert.ok(nameMatch, `missing agent name in ${file}`);
    assert.ok(seniorityMatch, `missing agent seniority in ${file}`);
    assert.ok(descriptionMatch, `missing agent description in ${file}`);
    assert.equal(seniorityMatch[1].trim(), 'senior', `agent ${file} must declare seniority: senior`);
    assert.match(descriptionMatch[1], /use proactively/i, `agent ${file} should encourage proactive delegation`);
    assert.match(content, /\*\*Status:\*\* DONE \| DONE_WITH_CONCERNS \| BLOCKED \| NEEDS_CONTEXT/, `missing status contract in ${file}`);
    assert.match(content, /\*\*Summary:\*\* 1-2 sentences/, `missing summary contract in ${file}`);
    assert.match(content, /\*\*Next Handoff:\*\*/, `missing handoff contract in ${file}`);

    const agentName = nameMatch[1].trim();
    const hook = runHook(
      '.claude/hooks/subagent-context.cjs',
      {
        session_id: `roster-${agentName}`,
        agent_type: agentName
      },
      projectRoot
    );

    assert.equal(hook.status, 0, `subagent hook failed for ${agentName}`);
    const parsed = JSON.parse(hook.stdout);
    const context = parsed.hookSpecificOutput.additionalContext;
    assert.match(context, new RegExp(`Agent: ${agentName}`), `missing agent marker for ${agentName}`);
    assert.match(context, /Company workflow:/, `missing workflow summary for ${agentName}`);
    assert.match(context, /Operating bar: every employee in this company is senior-only\./, `missing senior operating bar for ${agentName}`);
    assert.match(context, /Required ending:/, `missing ending reminder for ${agentName}`);
  }
});

test('gitignore protects local Claude settings', () => {
  const gitignore = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf8');
  assert.match(gitignore, /^\s*\.claude\/settings\.local\.json\s*$/m);
});

test('plan approval gate blocks source edits without approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
});

test('plan approval gate allows .claude edits without approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, '.claude', 'settings.json')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('plan approval gate allows reports writes without approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  fs.mkdirSync(path.join(tmpDir, 'reports', 'research'), { recursive: true });
  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'reports', 'research', 'summary.md')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('plan approval gate allows tracking-plan updates without approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'ga4-session',
      agent_type: 'ga4-analyst'
    },
    tmpDir
  );

  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'ga4-session',
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'tracking-plan.md')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('plan approval gate allows source edits after approval', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );
  writePlanRuntimeArtifacts(planDir);
  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('plan approval gate blocks source edits when approved plan bundle is incomplete', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );

  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /task-graph\.json|ownership-matrix\.md/i);
});

test('plan approval gate blocks source edits when approved task graph is invalid', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );
  writePlanRuntimeArtifacts(planDir, { taskGraph: 'invalid' });

  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /missing `title`|blocking policy|taskDescription/i);
});

test('active plan sync records the latest plan.md path', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'launch');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(path.join(planDir, 'plan.md'), '# Plan\n\nApproval Status: pending\n');

  const hook = runHook(
    '.claude/hooks/active-plan-sync.cjs',
    {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(planDir, 'plan.md')
      }
    },
    tmpDir
  );

  const activePlanState = JSON.parse(
    fs.readFileSync(path.join(tmpDir, '.claude', 'state', 'active-plan.json'), 'utf8')
  );

  assert.equal(hook.status, 0);
  assert.equal(activePlanState.planPath, 'plans/launch/plan.md');
});

test('active strategy sync records the latest strategy-memo.md path', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const strategyDir = path.join(tmpDir, 'reports', 'strategy', 'launch-angle');
  fs.mkdirSync(strategyDir, { recursive: true });
  fs.writeFileSync(path.join(strategyDir, 'strategy-memo.md'), '# Strategy Memo\n');

  const hook = runHook(
    '.claude/hooks/active-strategy-sync.cjs',
    {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(strategyDir, 'strategy-memo.md')
      }
    },
    tmpDir
  );

  const activeStrategyState = JSON.parse(
    fs.readFileSync(path.join(tmpDir, '.claude', 'state', 'active-strategy.json'), 'utf8')
  );

  assert.equal(hook.status, 0);
  assert.equal(activeStrategyState.memoPath, 'reports/strategy/launch-angle/strategy-memo.md');
});

test('approval state falls back to the latest plan.md when active plan state is missing', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const olderPlanDir = path.join(tmpDir, 'plans', 'older-plan');
  const latestPlanDir = path.join(tmpDir, 'plans', 'latest-plan');

  fs.mkdirSync(olderPlanDir, { recursive: true });
  fs.mkdirSync(latestPlanDir, { recursive: true });
  fs.writeFileSync(path.join(olderPlanDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
  fs.writeFileSync(path.join(latestPlanDir, 'plan.md'), '# Plan\n\nApproval Status: pending\n');
  writePlanRuntimeArtifacts(olderPlanDir);
  writePlanRuntimeArtifacts(latestPlanDir);
  setFileTimestamp(path.join(olderPlanDir, 'plan.md'), '2026-04-01T08:00:00.000Z');
  setFileTimestamp(path.join(latestPlanDir, 'plan.md'), '2026-04-01T09:00:00.000Z');

  const approval = readApprovalState(tmpDir);

  assert.equal(approval.resolution, 'latest');
  assert.equal(approval.activePlan, path.join(latestPlanDir, 'plan.md'));
  assert.equal(approval.pendingPlan, path.join(latestPlanDir, 'plan.md'));
  assert.equal(approval.approvedPlan, null);
});

test('strategy state falls back to the latest strategy memo when active strategy state is missing', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const olderMemoDir = path.join(tmpDir, 'reports', 'strategy', '20260401-older');
  const latestMemoDir = path.join(tmpDir, 'reports', 'strategy', '20260401-latest');

  fs.mkdirSync(olderMemoDir, { recursive: true });
  fs.mkdirSync(latestMemoDir, { recursive: true });

  const strategyMemo = [
    '## Target Audience',
    'placeholder',
    '## Positioning',
    'placeholder',
    '## Channel Priorities',
    'placeholder',
    '## Priority Experiments',
    'placeholder',
    '## Measurement Notes',
    'placeholder',
    '## Concrete Dev Asks',
    'placeholder',
    '## PM Intake Packet',
    'placeholder',
    '## Role Handoffs',
    'placeholder'
  ].join('\n');

  fs.writeFileSync(path.join(olderMemoDir, 'strategy-memo.md'), strategyMemo);
  fs.writeFileSync(path.join(latestMemoDir, 'strategy-memo.md'), strategyMemo);
  setFileTimestamp(path.join(olderMemoDir, 'strategy-memo.md'), '2026-04-01T08:00:00.000Z');
  setFileTimestamp(path.join(latestMemoDir, 'strategy-memo.md'), '2026-04-01T09:00:00.000Z');

  const strategy = readStrategyState(tmpDir);

  assert.equal(strategy.resolution, 'latest');
  assert.equal(strategy.memoPath, path.join(latestMemoDir, 'strategy-memo.md'));
  assert.equal(strategy.ready, true);
});

test('plan approval gate uses the active plan instead of an unrelated approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const oldPlanDir = path.join(tmpDir, 'plans', 'old-release');
  const newPlanDir = path.join(tmpDir, 'plans', 'new-feature');
  fs.mkdirSync(oldPlanDir, { recursive: true });
  fs.mkdirSync(newPlanDir, { recursive: true });
  fs.writeFileSync(path.join(oldPlanDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
  writePlanRuntimeArtifacts(oldPlanDir);
  fs.writeFileSync(path.join(newPlanDir, 'plan.md'), '# Plan\n\nApproval Status: pending\n');
  writeActivePlan(tmpDir, 'plans/new-feature/plan.md');

  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
});

test('session init exposes workflow summary', () => {
  const hook = runHook(
    '.claude/hooks/session-init.cjs',
    {
      source: 'startup',
      session_id: 'test-session'
    },
    projectRoot
  );
  const parsed = JSON.parse(hook.stdout);
  const context = parsed.hookSpecificOutput.additionalContext;

  assert.equal(hook.status, 0);
  assert.match(context, /Workflow Bootstrap/);
  assert.match(context, /market-researcher/);
  assert.match(context, /Current strategy memo/);
  assert.match(context, /Current plan approval/);
  assert.match(context, /senior-only/);
});

test('session state persists a workflow snapshot on Stop and replays it on startup', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-session-state-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  const strategyDir = path.join(tmpDir, 'reports', 'strategy', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.mkdirSync(strategyDir, { recursive: true });
  fs.writeFileSync(path.join(planDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
  writePlanRuntimeArtifacts(planDir);
  fs.writeFileSync(
    path.join(strategyDir, 'strategy-memo.md'),
    [
      '# Strategy Memo',
      '',
      '## Target Audience',
      '- Learners',
      '',
      '## Positioning',
      '- Fast bilingual subtitle learning',
      '',
      '## Channel Priorities',
      '- Search',
      '',
      '## Priority Experiments',
      '- Test landing page',
      '',
      '## Measurement Notes',
      '- Track activation',
      '',
      '## Concrete Dev Asks',
      '- Instrument subtitle tap',
      '',
      '## PM Intake Packet',
      '- Scope MVP flow',
      '',
      '## Role Handoffs',
      '- project-manager next',
      ''
    ].join('\n')
  );
  writeActivePlan(tmpDir, 'plans/feature/plan.md');
  writeActiveStrategy(tmpDir, 'reports/strategy/feature/strategy-memo.md');
  writeTeamRuntimeState(tmpDir, {
    activeTeam: 'implementation',
    phase: 'backend',
    progress: { total: 3, completed: 1, pending: 1, inProgress: 1 },
    lastTask: { id: 'task-1', subject: 'Implement backend' }
  });

  const stopHook = runHook(
    '.claude/hooks/session-state.cjs',
    {
      hook_event_name: 'Stop',
      last_assistant_message: 'Backend lane complete.'
    },
    tmpDir
  );
  const latestState = fs.readFileSync(path.join(tmpDir, '.claude', 'session-state', 'latest.md'), 'utf8');
  assert.equal(stopHook.status, 0);
  assert.match(latestState, /Approved plan active: plans\/feature\/plan\.md/);
  assert.match(latestState, /Team runtime tracked: implementation/);

  const startHook = runHook(
    '.claude/hooks/session-state.cjs',
    {
      source: 'startup'
    },
    tmpDir
  );
  const startParsed = JSON.parse(startHook.stdout);
  assert.equal(startHook.status, 0);
  assert.match(startParsed.hookSpecificOutput.additionalContext, /Previous Session State/);
  assert.match(startParsed.hookSpecificOutput.additionalContext, /plans\/feature\/plan\.md/);
});

test('workflow reminder blocks /eup-pm when strategy memo is missing', () => {
  const hook = runHook(
    '.claude/hooks/workflow-reminder.cjs',
    {
      prompt: '/eup-pm break this into tasks'
    },
    projectRoot
  );
  const parsed = JSON.parse(hook.stdout);
  const context = parsed.hookSpecificOutput.additionalContext;

  assert.equal(hook.status, 0);
  assert.match(context, /PM Intake Gate/);
  assert.match(context, /\/eup-pm and \/eup-dev-intake are BLOCKED/);
  assert.match(context, /reports\/strategy\/YYYYMMDD-\[slug\]\/strategy-memo\.md/);
});

test('workflow reminder allows /eup-pm when strategy memo is ready', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const strategyDir = path.join(tmpDir, 'reports', 'strategy', 'ready-brief');
  fs.mkdirSync(strategyDir, { recursive: true });
  fs.writeFileSync(
    path.join(strategyDir, 'strategy-memo.md'),
    [
      '# Strategy Memo',
      '',
      '## Target Audience',
      '- Learners',
      '',
      '## Positioning',
      '- Fast bilingual subtitle learning',
      '',
      '## Channel Priorities',
      '- Search',
      '',
      '## Priority Experiments',
      '- Test landing page',
      '',
      '## Measurement Notes',
      '- Track activation',
      '',
      '## Concrete Dev Asks',
      '- Instrument subtitle tap',
      '',
      '## PM Intake Packet',
      '- Scope MVP flow',
      '',
      '## Role Handoffs',
      '- project-manager next',
      ''
    ].join('\n')
  );
  writeActiveStrategy(tmpDir, 'reports/strategy/ready-brief/strategy-memo.md');

  const hook = runHook(
    '.claude/hooks/workflow-reminder.cjs',
    {
      prompt: '/eup-pm break this into tasks'
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);
  const context = parsed.hookSpecificOutput.additionalContext;

  assert.equal(hook.status, 0);
  assert.match(context, /Strategy memo ready:/);
  assert.match(context, /PM intake may proceed/);
});

test('workflow reminder blocks /eup-implement until approved plan bundle is ready', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'ready-brief');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );
  writeActivePlan(tmpDir, 'plans/ready-brief/plan.md');

  const hook = runHook(
    '.claude/hooks/workflow-reminder.cjs',
    {
      prompt: '/eup-implement plans/ready-brief/plan.md'
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);
  const context = parsed.hookSpecificOutput.additionalContext;

  assert.equal(hook.status, 0);
  assert.match(context, /Implementation Gate/);
  assert.match(context, /\/eup-implement is BLOCKED/);
  assert.match(context, /task-graph\.json|ownership-matrix\.md/);
});

test('workflow reminder allows /eup-implement when approved plan bundle is ready', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'ready-brief');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );
  writePlanRuntimeArtifacts(planDir);
  writeActivePlan(tmpDir, 'plans/ready-brief/plan.md');

  const hook = runHook(
    '.claude/hooks/workflow-reminder.cjs',
    {
      prompt: '/eup-implement plans/ready-brief/plan.md'
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);
  const context = parsed.hookSpecificOutput.additionalContext;

  assert.equal(hook.status, 0);
  assert.match(context, /Approved plan bundle ready/);
  assert.match(context, /\/eup-implement may proceed/);
});

test('task created hook blocks incomplete team task packets', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-task-created-block-'));

  const hook = runHook(
    '.claude/hooks/task-created-validator.cjs',
    {
      hook_event_name: 'TaskCreated',
      team_name: 'market-cycle',
      task_id: 'task-01',
      task_subject: 'Research JTBD',
      task_description: 'Phase: market-discovery\nOwner Role: market-researcher'
    },
    tmpDir
  );

  assert.equal(hook.status, 2);
  assert.match(hook.stderr, /missing required task packet fields/i);
});

test('task created hook blocks debate packets missing option set and decision criteria', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-task-created-debate-'));

  const hook = runHook(
    '.claude/hooks/task-created-validator.cjs',
    {
      hook_event_name: 'TaskCreated',
      team_name: 'debate-team',
      task_id: 'task-debate-01',
      task_subject: 'Write marketing thesis',
      task_description: [
        'Phase: debate',
        'Owner Role: marketing-strategist',
        'Depends On: task-debate-brief',
        'Context:',
        '- Debate question: choose the next growth motion',
        '- Lane objective: argue the strongest commercial case',
        'Artifacts:',
        '- reports/strategy/20260402-demo/marketing-thesis.md',
        'Acceptance Criteria:',
        '- thesis is explicit',
        'Validation:',
        '- confirm artifact exists'
      ].join('\n')
    },
    tmpDir
  );

  assert.equal(hook.status, 2);
  assert.match(hook.stderr, /Option Set:/);
  assert.match(hook.stderr, /Decision Criteria:/);
});

test('task created hook blocks unknown owner roles', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-task-created-owner-'));

  const hook = runHook(
    '.claude/hooks/task-created-validator.cjs',
    {
      hook_event_name: 'TaskCreated',
      team_name: 'implementation',
      task_id: 'task-typo',
      task_subject: 'Implement backend tracking',
      task_description: [
        'Phase: implementation',
        'Owner Role: backend-enginer',
        'Depends On: none',
        'Context:',
        '- Business goal: implement backend tracking',
        '- Constraints: stay within approved backend scope',
        'Artifacts:',
        '- reports/debug.md',
        'Acceptance Criteria:',
        '- output saved',
        'Validation:',
        '- confirm artifact exists'
      ].join('\n')
    },
    tmpDir
  );

  assert.equal(hook.status, 2);
  assert.match(hook.stderr, /unknown Owner Role/i);
});

test('task created hook allows valid implementation task packets and records runtime state', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-task-created-ok-'));

  const hook = runHook(
    '.claude/hooks/task-created-validator.cjs',
    {
      hook_event_name: 'TaskCreated',
      team_name: 'implementation',
      teammate_name: 'lead',
      task_id: 'task-02',
      task_subject: 'Implement backend tracking',
      task_description: [
        'Phase: implementation',
        'Owner Role: backend-engineer',
        'Depends On: task-db',
        'Context:',
        '- Business goal: implement backend tracking',
        '- Constraints: keep file ownership within the backend lane',
        'File Ownership:',
        '- src/api/**',
        '- src/services/tracking/**',
        'Isolation: worktree',
        'Acceptance Criteria:',
        '- API contract is implemented',
        'Validation:',
        '- npm test -- tracking',
        '- npm run build'
      ].join('\n')
    },
    tmpDir
  );
  const runtimeState = JSON.parse(
    fs.readFileSync(path.join(tmpDir, '.claude', 'state', 'team-runtime.json'), 'utf8')
  );

  assert.equal(hook.status, 0);
  assert.equal(runtimeState.activeTeam, 'implementation');
  assert.equal(runtimeState.lastTaskCreated.ownerRole, 'backend-engineer');
});

test('team task summary respects assignee and metadata owners and counts claimed tasks as in progress', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-team-summary-'));
  const previousHome = process.env.HOME;
  process.env.HOME = tmpDir;

  try {
    writeTeamTask(tmpDir, 'alpha-team', {
      id: 'task-claimed',
      subject: 'Claimed by teammate',
      status: 'claimed',
      assignee: 'worker-a',
      dependencies: []
    });
    writeTeamTask(tmpDir, 'alpha-team', {
      id: 'task-owned-metadata',
      subject: 'Owned through metadata',
      status: 'pending',
      dependencies: [],
      metadata: {
        owner: 'worker-b'
      }
    });
    writeTeamTask(tmpDir, 'alpha-team', {
      id: 'task-blocked',
      subject: 'Blocked follow-up',
      status: 'pending',
      dependencies: ['task-claimed']
    });

    const summary = summarizeTeamTasks('alpha-team');

    assert.equal(summary.inProgress, 1);
    assert.equal(summary.pending, 2);
    assert.deepEqual(summary.unblocked, []);
  } finally {
    process.env.HOME = previousHome;
  }
});

test('marketing strategist cannot edit product source even with an approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );
  writePlanRuntimeArtifacts(planDir);

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'marketing-session',
      agent_type: 'marketing-strategist'
    },
    tmpDir
  );

  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'marketing-session',
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /strategy artifacts/i);
});

test('bash approval gate blocks shell-based source mutations before approval', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));

  const hook = runHook(
    '.claude/hooks/bash-approval-gate.cjs',
    {
      cwd: tmpDir,
      tool_name: 'Bash',
      tool_input: {
        command: buildApplyPatchCommand('src/app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /active plan|Approval Status: approved/i);
});

test('bash approval gate allows shell mutations inside .claude before approval', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });

  const hook = runHook(
    '.claude/hooks/bash-approval-gate.cjs',
    {
      cwd: tmpDir,
      tool_name: 'Bash',
      tool_input: {
        command: buildApplyPatchCommand('.claude/settings.json')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('bash approval gate allows source mutations after active plan approval', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(path.join(planDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
  writePlanRuntimeArtifacts(planDir);
  writeActivePlan(tmpDir, 'plans/feature/plan.md');

  const hook = runHook(
    '.claude/hooks/bash-approval-gate.cjs',
    {
      cwd: tmpDir,
      tool_name: 'Bash',
      tool_input: {
        command: buildApplyPatchCommand('src/app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('bash approval gate blocks source mutations when approved plan bundle is incomplete', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(path.join(planDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
  writeActivePlan(tmpDir, 'plans/feature/plan.md');

  const hook = runHook(
    '.claude/hooks/bash-approval-gate.cjs',
    {
      cwd: tmpDir,
      tool_name: 'Bash',
      tool_input: {
        command: buildApplyPatchCommand('src/app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /task-graph\.json|ownership-matrix\.md/i);
});

test('bash approval gate respects non-engineering artifact scope', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(path.join(planDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
  writePlanRuntimeArtifacts(planDir);
  writeActivePlan(tmpDir, 'plans/feature/plan.md');

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'marketing-bash-session',
      agent_type: 'marketing-strategist'
    },
    tmpDir
  );

  const hook = runHook(
    '.claude/hooks/bash-approval-gate.cjs',
    {
      cwd: tmpDir,
      session_id: 'marketing-bash-session',
      tool_name: 'Bash',
      tool_input: {
        command: buildApplyPatchCommand('src/app.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /strategy artifacts/i);
});

test('market researcher can save research reports before approval', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  fs.mkdirSync(path.join(tmpDir, 'reports', 'research', '20260331-demo'), { recursive: true });

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'research-session',
      agent_type: 'market-researcher'
    },
    tmpDir
  );

  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'research-session',
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'reports', 'research', '20260331-demo', 'research-summary.md')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('qa tester can edit test files after approval', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(path.join(tmpDir, 'tests'), { recursive: true });
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );
  writePlanRuntimeArtifacts(planDir);

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'qa-session',
      agent_type: 'qa-tester'
    },
    tmpDir
  );

  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'qa-session',
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'tests', 'feature.test.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('qa tester cannot edit product source after approval', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );
  writePlanRuntimeArtifacts(planDir);

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'qa-block-session',
      agent_type: 'qa-tester'
    },
    tmpDir
  );
  const hook = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'qa-block-session',
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'feature.ts')
      }
    },
    tmpDir
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /test files only/i);
});

test('constrained non-engineering roles are limited to approved artifact paths', () => {
  const cases = [
    {
      agent: 'marketing-strategist',
      allowedPath: ['reports', 'strategy', '20260401-demo', 'strategy-memo.md'],
      blockedPath: ['src', 'app.ts'],
      reason: /strategy artifacts/i
    },
    {
      agent: 'competitor-analyst',
      allowedPath: ['reports', 'research', '20260331-demo', 'competitor-landscape.md'],
      blockedPath: ['src', 'app.ts'],
      reason: /research artifacts only/i
    },
    {
      agent: 'social-media-manager',
      allowedPath: ['plans', 'social-calendar.md'],
      blockedPath: ['src', 'scheduler.ts'],
      reason: /scheduling artifacts only/i
    },
    {
      agent: 'seo-specialist',
      allowedPath: ['docs', 'site-architecture.md'],
      blockedPath: ['src', 'router.ts'],
      reason: /reports, docs, and plans only/i
    },
    {
      agent: 'project-manager',
      allowedPath: ['reports', 'strategy', '20260401-demo', 'dev-intake.md'],
      blockedPath: ['src', 'feature.ts'],
      reason: /strategy intake packets/i
    },
    {
      agent: 'codebase-scout',
      allowedPath: ['reports', 'strategy', '20260401-demo', 'scout-findings.md'],
      blockedPath: ['src', 'feature.ts'],
      reason: /findings artifacts only/i
    },
    {
      agent: 'technical-brainstormer',
      allowedPath: ['reports', 'strategy', '20260401-demo', 'technical-options.md'],
      blockedPath: ['src', 'feature.ts'],
      reason: /decision artifacts only/i
    },
    {
      agent: 'quality-reviewer',
      allowedPath: ['reports', 'strategy', '20260401-demo', 'dev-challenge.md'],
      blockedPath: ['src', 'feature.ts'],
      reason: /review artifacts only/i
    },
    {
      agent: 'implementation-planner',
      allowedPath: ['plans', 'launch', 'plan.md'],
      blockedPath: ['docs', 'plan-summary.md'],
      reason: /plans only/i
    }
  ];

  for (const testCase of cases) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `claude-role-${testCase.agent}-`));
    fs.mkdirSync(path.join(tmpDir, 'reports', 'research', '20260331-demo'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'plans', 'launch'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    fs.mkdirSync(path.dirname(path.join(tmpDir, ...testCase.allowedPath)), { recursive: true });

    runHook(
      '.claude/hooks/subagent-context.cjs',
      {
        session_id: `${testCase.agent}-session`,
        agent_type: testCase.agent
      },
      tmpDir
    );

    const allowedHook = runHook(
      '.claude/hooks/plan-approval-gate.cjs',
      {
        session_id: `${testCase.agent}-session`,
        tool_name: 'Write',
        tool_input: {
          file_path: path.join(tmpDir, ...testCase.allowedPath)
        }
      },
      tmpDir
    );
    const allowedParsed = JSON.parse(allowedHook.stdout);
    assert.equal(allowedHook.status, 0, `${testCase.agent} allowed path hook failed`);
    assert.equal(allowedParsed.continue, true, `${testCase.agent} should be allowed to write ${testCase.allowedPath.join('/')}`);

    const blockedHook = runHook(
      '.claude/hooks/plan-approval-gate.cjs',
      {
        session_id: `${testCase.agent}-session`,
        tool_name: 'Edit',
        tool_input: {
          file_path: path.join(tmpDir, ...testCase.blockedPath)
        }
      },
      tmpDir
    );
    const blockedParsed = JSON.parse(blockedHook.stdout);
    assert.equal(blockedHook.status, 0, `${testCase.agent} blocked path hook failed`);
    assert.equal(blockedParsed.hookSpecificOutput.permissionDecision, 'deny');
    assert.match(blockedParsed.hookSpecificOutput.permissionDecisionReason, testCase.reason);
  }
});

test('settings enable agent teams runtime, status line, and secret deny rules', () => {
  const settings = JSON.parse(
    fs.readFileSync(path.join(projectRoot, '.claude', 'settings.json'), 'utf8')
  );

  assert.equal(settings.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS, '1');
  assert.match(settings.statusLine.command, /\.claude\/statusline\.cjs/);
  assert.ok(Array.isArray(settings.permissions.allow));
  assert.ok(settings.permissions.allow.includes('WebFetch'));
  assert.ok(Array.isArray(settings.permissions.deny));
  assert.ok(settings.permissions.deny.includes('Read(./.env)'));
  assert.ok(settings.permissions.deny.includes('Read(./.env.*)'));
  assert.ok(settings.permissions.deny.includes('Read(./secrets/**)'));
  assert.ok(Array.isArray(settings.hooks.TaskCreated));
  assert.ok(Array.isArray(settings.hooks.TaskCompleted));
  assert.ok(Array.isArray(settings.hooks.TeammateIdle));
  assert.ok(Array.isArray(settings.hooks.ConfigChange));
  assert.ok(Array.isArray(settings.hooks.Stop));
  assert.ok(Array.isArray(settings.hooks.SessionEnd));
});

test('implementation-capable agents declare worktree isolation', () => {
  const isolatedAgents = [
    'database-engineer',
    'backend-engineer',
    'frontend-engineer',
    'mobile-engineer',
    'fullstack-developer',
    'qa-tester',
    'devops-engineer'
  ];

  for (const agentName of isolatedAgents) {
    const content = fs.readFileSync(
      path.join(projectRoot, '.claude', 'agents', `${agentName}.md`),
      'utf8'
    );
    assert.match(content, /^isolation:\s*worktree$/m, `${agentName} must declare worktree isolation`);
  }
});

test('project teammate agents can update tasks but cannot create new team tasks', () => {
  for (const file of listAgentFiles()) {
    const content = fs.readFileSync(
      path.join(projectRoot, '.claude', 'agents', file),
      'utf8'
    );
    const toolsLine = content.match(/^tools:\s*(.+)$/m);

    assert.ok(toolsLine, `missing tools line in ${file}`);
    assert.match(toolsLine[1], /\bTaskGet\b/, `${file} must allow TaskGet`);
    assert.match(toolsLine[1], /\bTaskUpdate\b/, `${file} must allow TaskUpdate`);
    assert.match(toolsLine[1], /\bTaskList\b/, `${file} must allow TaskList`);
    assert.match(toolsLine[1], /\bSendMessage\b/, `${file} must allow SendMessage`);
    assert.doesNotMatch(toolsLine[1], /\bTaskCreate\b/, `${file} must not allow TaskCreate`);
  }
});

test('manual company orchestration skills exist and are manual-only', () => {
  const manualSkills = [
    '.claude/skills/eup-market-cycle/SKILL.md',
    '.claude/skills/eup-debate/SKILL.md',
    '.claude/skills/eup-dev-intake/SKILL.md',
    '.claude/skills/eup-implement/SKILL.md',
    '.claude/skills/eup-company-status/SKILL.md'
  ];

  for (const relativePath of manualSkills) {
    const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
    assert.match(content, /^disable-model-invocation:\s*true$/m, `${relativePath} must be manual-only`);
  }
});

test('market-cycle, debate, and dev-intake require team cleanup before creating a new team', () => {
  const marketCycle = fs.readFileSync(
    path.join(projectRoot, '.claude', 'skills', 'eup-market-cycle', 'SKILL.md'),
    'utf8'
  );
  const debateSkill = fs.readFileSync(
    path.join(projectRoot, '.claude', 'skills', 'eup-debate', 'SKILL.md'),
    'utf8'
  );
  const devIntake = fs.readFileSync(
    path.join(projectRoot, '.claude', 'skills', 'eup-dev-intake', 'SKILL.md'),
    'utf8'
  );

  assert.match(marketCycle, /Before `TeamCreate`, check whether this lead session is already managing another team/i);
  assert.match(marketCycle, /call `TeamDelete` on the old team first/i);
  assert.match(marketCycle, /shut down idle teammates and delete the team with `TeamDelete` from the lead session/i);
  assert.match(marketCycle, /Only report `team disbanded`.*after `TeamDelete` returns success/i);
  assert.match(marketCycle, /one primary learner segment and one primary geography cluster/i);
  assert.match(marketCycle, /15-25 high-signal quotes across at least 5 independent sources/i);

  assert.match(debateSkill, /Before `TeamCreate`, check whether this lead session is already managing another team/i);
  assert.match(debateSkill, /call `TeamDelete` on the old team first/i);
  assert.match(debateSkill, /Only report `team disbanded`.*after `TeamDelete` returns success/i);
  assert.match(debateSkill, /marketing-rebuttal\.md/i);
  assert.match(debateSkill, /dev-rebuttal\.md/i);
  assert.match(debateSkill, /no-action or defer baseline/i);
  assert.match(debateSkill, /concede at least one valid criticism/i);
  assert.match(debateSkill, /exact option set with 2-3 materially different options/i);
  assert.match(debateSkill, /Do not open a debate for routine work/i);

  assert.match(devIntake, /Before `TeamCreate`, check whether this lead session is already managing another team/i);
  assert.match(devIntake, /call `TeamDelete` on the old team first/i);
  assert.match(devIntake, /shut down idle teammates and delete the dev-intake team with `TeamDelete` from the lead session/i);
  assert.match(devIntake, /Only report `team disbanded`.*after `TeamDelete` returns success/i);
  assert.match(devIntake, /scout-findings\.md/i);
  assert.match(devIntake, /technical-options\.md/i);
  assert.match(devIntake, /call `TaskUpdate` so their assigned tasks are marked completed/i);
});

test('market researcher and research skill constrain breadth and define a good-enough evidence threshold', () => {
  const marketResearcher = fs.readFileSync(
    path.join(projectRoot, '.claude', 'agents', 'market-researcher.md'),
    'utf8'
  );
  const researchSkill = fs.readFileSync(
    path.join(projectRoot, '.claude', 'skills', 'eup-research', 'SKILL.md'),
    'utf8'
  );

  assert.match(marketResearcher, /one highest-value learner segment and one primary geography cluster/i);
  assert.match(marketResearcher, /15-25 high-signal quotes across at least 5 independent sources/i);
  assert.match(marketResearcher, /Save `sources\.md` and `quote-bank\.md` early/i);

  assert.match(researchSkill, /one primary segment and one primary geography cluster/i);
  assert.match(researchSkill, /15-25 high-signal quotes across at least 5 independent sources/i);
  assert.match(researchSkill, /Stop once evidence quality is strong enough for strategy use/i);
});

test('eup-implement enforces lead-owned team lifecycle and rich task context', () => {
  const implementSkill = fs.readFileSync(
    path.join(projectRoot, '.claude', 'skills', 'eup-implement', 'SKILL.md'),
    'utf8'
  );

  assert.match(implementSkill, /Before `TeamCreate`, check whether this lead session is already managing another team/i);
  assert.match(implementSkill, /shut down idle teammates, call `TeamDelete` on the old team first/i);
  assert.match(implementSkill, /Teammates do not inherit the lead chat history/i);
  assert.match(implementSkill, /split it into additional self-contained tasks so teammates can self-claim/i);
  assert.match(implementSkill, /Wait for teammates to complete their tasks before the lead synthesizes/i);
  assert.match(implementSkill, /shut down idle teammates and delete the team with `TeamDelete` from the lead session/i);
  assert.match(implementSkill, /Only report `team disbanded`.*after `TeamDelete` returns success/i);
});

test('eup-implement documents explicit quality-review and qa task packet templates', () => {
  const implementSkill = fs.readFileSync(
    path.join(projectRoot, '.claude', 'skills', 'eup-implement', 'SKILL.md'),
    'utf8'
  );

  assert.match(implementSkill, /For `quality-reviewer` lanes, require an explicit read scope:/);
  assert.match(implementSkill, /Owner Role: quality-reviewer/);
  assert.match(implementSkill, /Read Scope:/);
  assert.match(implementSkill, /For `qa-tester` lanes, require explicit validation scope plus test-only ownership when edits are allowed:/);
  assert.match(implementSkill, /Owner Role: qa-tester/);
  assert.match(implementSkill, /Isolation: worktree/);
});

test('eup-research defaults to saving a full research package for direct command usage', () => {
  const researchSkill = fs.readFileSync(
    path.join(projectRoot, '.claude', 'skills', 'eup-research', 'SKILL.md'),
    'utf8'
  );

  assert.doesNotMatch(researchSkill, /^context:\s*fork$/m);
  assert.doesNotMatch(researchSkill, /^agent:\s*market-researcher$/m);
  assert.match(researchSkill, /^Research brief: \$ARGUMENTS$/m);
  assert.match(researchSkill, /When this skill is invoked as `\/eup-research \$ARGUMENTS`, execute the workflow immediately/i);
  assert.match(researchSkill, /do \*\*not\*\* wait for the user to choose a deliverable before producing output/i);
  assert.match(researchSkill, /always create the full report package under `reports\/research\/YYYYMMDD-\[slug\]\/`/i);
  assert.match(researchSkill, /The `\/eup-research` command itself is authorization to create the report package/i);
  assert.match(researchSkill, /create it yourself with `mkdir -p` before attempting file writes/i);
  assert.match(researchSkill, /Immediately run `mkdir -p "reports\/research\/YYYYMMDD-\[slug\]"`/i);
  assert.match(researchSkill, /Write the minimum required files in the package before ending/i);
  assert.match(researchSkill, /Do not stop with only an in-chat summary/i);
  assert.match(researchSkill, /Only report `done`, `completed`, or equivalent language after the minimum report package has been written to disk/i);
  assert.match(researchSkill, /do not keep the final result only in chat/i);
  assert.match(researchSkill, /Do not claim the research is complete until the package exists on disk/i);
  assert.doesNotMatch(researchSkill, /^Ask the user which deliverable\(s\) they need before generating output\.$/m);
});

test('subagent context injects team metadata when agent is a teammate', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-team-context-'));
  const homeDir = path.join(tmpDir, 'home');
  fs.mkdirSync(homeDir, { recursive: true });
  writeTeamConfig(homeDir, 'market-cycle', [
    { name: 'lead', agentId: 'lead@market-cycle', agentType: 'lead' },
    { name: 'research-1', agentId: 'research-1@market-cycle', agentType: 'market-researcher' },
    { name: 'ga4-1', agentId: 'ga4-1@market-cycle', agentType: 'ga4-analyst' }
  ]);
  writeTeamTask(homeDir, 'market-cycle', {
    id: '1',
    subject: 'Research JTBD',
    status: 'completed'
  });
  writeTeamTask(homeDir, 'market-cycle', {
    id: '2',
    subject: 'Analyze GA4',
    owner: 'research-1',
    status: 'pending',
    blockedBy: ['1']
  });
  writeActiveStrategy(tmpDir, 'reports/strategy/demo/strategy-memo.md');
  writeActivePlan(tmpDir, 'plans/demo/plan.md');
  fs.mkdirSync(path.join(tmpDir, 'reports', 'strategy', 'demo'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'plans', 'demo'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'reports', 'strategy', 'demo', 'strategy-memo.md'), '# Strategy Memo\n');
  fs.writeFileSync(path.join(tmpDir, 'plans', 'demo', 'plan.md'), '# Plan\n\nApproval Status: pending\n');

  const hook = runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'team-agent',
      agent_id: 'research-1@market-cycle',
      agent_type: 'market-researcher'
    },
    tmpDir,
    { HOME: homeDir }
  );
  const parsed = JSON.parse(hook.stdout);
  const context = parsed.hookSpecificOutput.additionalContext;

  assert.equal(hook.status, 0);
  assert.match(context, /Team: market-cycle/);
  assert.match(context, /Teammate: research-1/);
  assert.match(context, /Peers: lead \(lead\), ga4-1 \(ga4-analyst\)/);
  assert.match(context, /Team tasks: 1\/2 complete/);
  assert.match(context, /Assigned tasks: #2 Analyze GA4 \[pending\]/);
  assert.match(context, /Active strategy artifact: reports\/strategy\/demo\/strategy-memo\.md/);
  assert.match(context, /Active plan artifact: plans\/demo\/plan\.md/);
});

test('task completed hook updates team runtime state and reports progress', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-task-completed-'));
  const homeDir = path.join(tmpDir, 'home');
  fs.mkdirSync(homeDir, { recursive: true });
  writeTeamTask(homeDir, 'feature-rollout', {
    id: '1',
    subject: 'Implement backend',
    status: 'completed'
  });
  writeTeamTask(homeDir, 'feature-rollout', {
    id: '2',
    subject: 'Implement frontend',
    status: 'pending',
    blockedBy: ['1']
  });

  const hook = runHook(
    '.claude/hooks/task-completed-handler.cjs',
    {
      team_name: 'feature-rollout',
      teammate_name: 'backend-1',
      task_id: '1',
      task_subject: 'Implement backend',
      task_metadata: { phase: 'backend' }
    },
    tmpDir,
    { HOME: homeDir }
  );
  const parsed = JSON.parse(hook.stdout);
  const runtimeState = JSON.parse(
    fs.readFileSync(path.join(tmpDir, '.claude', 'state', 'team-runtime.json'), 'utf8')
  );

  assert.equal(hook.status, 0);
  assert.match(parsed.hookSpecificOutput.additionalContext, /Progress: 1\/2 complete/);
  assert.equal(runtimeState.activeTeam, 'feature-rollout');
  assert.equal(runtimeState.phase, 'backend');
  assert.equal(runtimeState.progress.completed, 1);
});

test('task completed hook blocks when required completion artifacts are missing', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-task-completed-block-'));
  const homeDir = path.join(tmpDir, 'home');
  fs.mkdirSync(homeDir, { recursive: true });
  writeTeamTask(homeDir, 'market-cycle', {
    id: '1',
    subject: 'Write strategy memo',
    owner: 'strategist-1',
    status: 'completed',
    metadata: {
      requiredArtifacts: ['reports/strategy/20260401-demo/strategy-memo.md'],
      enforceArtifactsOnIdle: true
    }
  });

  const hook = runHook(
    '.claude/hooks/task-completed-handler.cjs',
    {
      team_name: 'market-cycle',
      teammate_name: 'strategist-1',
      task_id: '1',
      task_subject: 'Write strategy memo',
      task_metadata: { phase: 'strategy' }
    },
    tmpDir,
    { HOME: homeDir }
  );

  assert.equal(hook.status, 2);
  assert.match(hook.stderr, /Missing required artifact/);
});

test('teammate idle hook blocks when required artifact is missing', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-teammate-idle-block-'));
  const homeDir = path.join(tmpDir, 'home');
  fs.mkdirSync(homeDir, { recursive: true });
  writeTeamTask(homeDir, 'market-cycle', {
    id: '1',
    subject: 'Write strategy memo',
    owner: 'strategist-1',
    status: 'completed',
    metadata: {
      requiredArtifacts: ['reports/strategy/20260401-demo/strategy-memo.md'],
      enforceArtifactsOnIdle: true
    }
  });

  const hook = runHook(
    '.claude/hooks/teammate-idle-handler.cjs',
    {
      team_name: 'market-cycle',
      teammate_name: 'strategist-1'
    },
    tmpDir,
    { HOME: homeDir }
  );

  assert.equal(hook.status, 2);
  assert.match(hook.stderr, /Missing required artifact/);
});

test('teammate idle hook suggests unblocked work when artifacts are satisfied', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-teammate-idle-ok-'));
  const homeDir = path.join(tmpDir, 'home');
  fs.mkdirSync(homeDir, { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'reports', 'strategy', '20260401-demo'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpDir, 'reports', 'strategy', '20260401-demo', 'strategy-memo.md'),
    '# Strategy Memo\n'
  );
  writeTeamTask(homeDir, 'market-cycle', {
    id: '1',
    subject: 'Write strategy memo',
    owner: 'strategist-1',
    status: 'completed',
    metadata: {
      requiredArtifacts: ['reports/strategy/20260401-demo/strategy-memo.md'],
      enforceArtifactsOnIdle: true
    }
  });
  writeTeamTask(homeDir, 'market-cycle', {
    id: '2',
    subject: 'Prepare dev intake',
    status: 'pending',
    blockedBy: ['1']
  });

  const hook = runHook(
    '.claude/hooks/teammate-idle-handler.cjs',
    {
      team_name: 'market-cycle',
      teammate_name: 'strategist-1'
    },
    tmpDir,
    { HOME: homeDir }
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.match(parsed.hookSpecificOutput.additionalContext, /Unblocked tasks: #2 Prepare dev intake/);
});

test('teammate idle hook asks read-only teammates to close owned tasks instead of waiting silently', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-teammate-idle-readonly-'));
  const homeDir = path.join(tmpDir, 'home');
  fs.mkdirSync(homeDir, { recursive: true });
  writeTeamTask(homeDir, 'dev-intake', {
    id: '2',
    subject: 'Codebase mapping',
    owner: 'scout-1',
    status: 'in_progress',
    taskDescription: [
      'Phase: dev-intake',
      'Owner Role: codebase-scout',
      'Depends On: none',
      'Context:',
      '- Business goal: map the smallest safe change surface',
      '- Constraints: read-only lane with explicit file references',
      'Read Scope:',
      '- src/**',
      'Acceptance Criteria:',
      '- smallest safe change surface is named',
      'Validation:',
      '- report findings back to the lead'
    ].join('\n')
  });

  const hook = runHook(
    '.claude/hooks/teammate-idle-handler.cjs',
    {
      team_name: 'dev-intake',
      teammate_name: 'scout-1'
    },
    tmpDir,
    { HOME: homeDir }
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.match(parsed.hookSpecificOutput.additionalContext, /Owned read-only tasks still need closure/);
  assert.match(parsed.hookSpecificOutput.additionalContext, /TaskUpdate/);
});

test('statusline renders active team, task progress, and plan state', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-statusline-'));
  fs.mkdirSync(path.join(tmpDir, '.claude', 'state'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'plans', 'launch'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'reports', 'strategy', 'launch'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpDir, 'plans', 'launch', 'plan.md'),
    '# Plan\n\nApproval Status: pending\n'
  );
  fs.writeFileSync(
    path.join(tmpDir, 'reports', 'strategy', 'launch', 'strategy-memo.md'),
    [
      '# Strategy Memo',
      '',
      '## Target Audience',
      '- Learners',
      '',
      '## Positioning',
      '- Value',
      '',
      '## Channel Priorities',
      '- Search',
      '',
      '## Priority Experiments',
      '- Landing page test',
      '',
      '## Measurement Notes',
      '- KPI notes',
      '',
      '## Concrete Dev Asks',
      '- Build flow',
      '',
      '## PM Intake Packet',
      '- Scope MVP',
      '',
      '## Role Handoffs',
      '- PM next',
      ''
    ].join('\n')
  );
  writeActivePlan(tmpDir, 'plans/launch/plan.md');
  writeActiveStrategy(tmpDir, 'reports/strategy/launch/strategy-memo.md');
  fs.writeFileSync(
    path.join(tmpDir, '.claude', 'state', 'team-runtime.json'),
    `${JSON.stringify({
      activeTeam: 'launch-team',
      phase: 'implementation',
      progress: { completed: 2, total: 5 }
    }, null, 2)}\n`
  );

  const result = spawnSync(
    process.execPath,
    [path.join(projectRoot, '.claude', 'statusline.cjs')],
    {
      cwd: tmpDir,
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: tmpDir
      },
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /team:launch-team/);
  assert.match(result.stdout, /tasks:2\/5/);
  assert.match(result.stdout, /phase:implementation/);
  assert.match(result.stdout, /strategy:ready/);
  assert.match(result.stdout, /plan:pending/);
});

test('subagent stop blocks missing handoff contract', () => {
  const hook = runHook(
    '.claude/hooks/subagent-stop.cjs',
    {
      session_id: 'stop-block',
      agent_type: 'frontend-engineer',
      last_assistant_message: 'Implemented the feature.'
    },
    projectRoot
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.decision, 'block');
  assert.match(parsed.reason, /Status/);
});

test('subagent stop allows valid handoff contract', () => {
  const hook = runHook(
    '.claude/hooks/subagent-stop.cjs',
    {
      session_id: 'stop-allow',
      agent_type: 'frontend-engineer',
      last_assistant_message: [
        '**Status:** DONE',
        '**Summary:** Implemented the requested UI slice.',
        '**Next Handoff:** quality-reviewer'
      ].join('\n')
    },
    projectRoot
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('subagent stop blocks teammates that still own active team tasks', () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-stop-active-task-home-'));
  fs.mkdirSync(homeDir, { recursive: true });
  writeTeamTask(homeDir, 'dev-intake', {
    id: '2',
    subject: 'Codebase mapping',
    owner: 'scout-1',
    status: 'in_progress'
  });

  const hook = runHook(
    '.claude/hooks/subagent-stop.cjs',
    {
      session_id: 'stop-active-task',
      agent_id: 'scout-1@dev-intake',
      agent_type: 'codebase-scout',
      last_assistant_message: [
        '**Status:** DONE',
        '**Summary:** Mapped the codebase.',
        '**Next Handoff:** implementation-planner'
      ].join('\n')
    },
    projectRoot,
    { HOME: homeDir }
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.decision, 'block');
  assert.match(parsed.reason, /TaskUpdate/);
  assert.match(parsed.reason, /Codebase mapping/);
});

test('subagent stop allows teammates to stop after owned tasks are completed', () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-stop-completed-task-home-'));
  fs.mkdirSync(homeDir, { recursive: true });
  writeTeamTask(homeDir, 'dev-intake', {
    id: '2',
    subject: 'Codebase mapping',
    owner: 'scout-1',
    status: 'completed'
  });

  const hook = runHook(
    '.claude/hooks/subagent-stop.cjs',
    {
      session_id: 'stop-completed-task',
      agent_id: 'scout-1@dev-intake',
      agent_type: 'codebase-scout',
      last_assistant_message: [
        '**Status:** DONE',
        '**Summary:** Mapped the codebase.',
        '**Next Handoff:** implementation-planner'
      ].join('\n')
    },
    projectRoot,
    { HOME: homeDir }
  );
  const parsed = JSON.parse(hook.stdout);

  assert.equal(hook.status, 0);
  assert.equal(parsed.continue, true);
});

test('workflow e2e smoke: research -> strategy -> plan -> approval -> implementation', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-e2e-'));
  fs.mkdirSync(path.join(tmpDir, 'reports', 'research', '20260331-demo'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'reports', 'strategy', '20260331-demo'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'plans', 'launch-workflow'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'tests'), { recursive: true });

  const initialSession = runHook(
    '.claude/hooks/session-init.cjs',
    {
      source: 'startup',
      session_id: 'e2e-main'
    },
    tmpDir
  );
  const initialContext = JSON.parse(initialSession.stdout).hookSpecificOutput.additionalContext;
  assert.match(initialContext, /reports\/research/);
  assert.match(initialContext, /Current strategy memo: missing/);
  assert.match(initialContext, /Current plan approval: missing/);

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'e2e-research',
      agent_type: 'market-researcher'
    },
    tmpDir
  );

  const researchWrite = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'e2e-research',
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'reports', 'research', '20260331-demo', 'research-summary.md')
      }
    },
    tmpDir
  );
  assert.equal(JSON.parse(researchWrite.stdout).continue, true);
  fs.writeFileSync(
    path.join(tmpDir, 'reports', 'research', '20260331-demo', 'research-summary.md'),
    '# Research Summary\n\nJTBD and pains captured.\n'
  );

  const blockedPmIntake = runHook(
    '.claude/hooks/workflow-reminder.cjs',
    {
      prompt: '/eup-pm break this into tasks'
    },
    tmpDir
  );
  const blockedPmContext = JSON.parse(blockedPmIntake.stdout).hookSpecificOutput.additionalContext;
  assert.match(blockedPmContext, /\/eup-pm and \/eup-dev-intake are BLOCKED/);

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'e2e-strategy-writer',
      agent_type: 'marketing-strategist'
    },
    tmpDir
  );

  const strategyWrite = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'e2e-strategy-writer',
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'reports', 'strategy', '20260331-demo', 'strategy-memo.md')
      }
    },
    tmpDir
  );
  assert.equal(JSON.parse(strategyWrite.stdout).continue, true);
  fs.writeFileSync(
    path.join(tmpDir, 'reports', 'strategy', '20260331-demo', 'strategy-memo.md'),
    [
      '# Strategy Memo',
      '',
      '## Target Audience',
      '- Intermediate video-first learners',
      '',
      '## Positioning',
      '- Learn from real videos with instant bilingual support',
      '',
      '## Channel Priorities',
      '- Search + creator demos',
      '',
      '## Priority Experiments',
      '- Test dual-subtitle landing page',
      '',
      '## Measurement Notes',
      '- Track subtitle tap, save word, review return',
      '',
      '## Concrete Dev Asks',
      '- MVP player with bilingual subtitle controls',
      '',
      '## PM Intake Packet',
      '- Scope the MVP viewing and review loop',
      '',
      '## Role Handoffs',
      '- project-manager receives next',
      ''
    ].join('\n')
  );
  runHook(
    '.claude/hooks/active-strategy-sync.cjs',
    {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'reports', 'strategy', '20260331-demo', 'strategy-memo.md')
      }
    },
    tmpDir
  );

  const readyPmIntake = runHook(
    '.claude/hooks/workflow-reminder.cjs',
    {
      prompt: '/eup-pm break this into tasks'
    },
    tmpDir
  );
  const readyPmContext = JSON.parse(readyPmIntake.stdout).hookSpecificOutput.additionalContext;
  assert.match(readyPmContext, /Strategy memo ready:/);

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'e2e-planner',
      agent_type: 'implementation-planner'
    },
    tmpDir
  );

  const pendingPlanWrite = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'e2e-planner',
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(tmpDir, 'plans', 'launch-workflow', 'plan.md')
      }
    },
    tmpDir
  );
  assert.equal(JSON.parse(pendingPlanWrite.stdout).continue, true);
  fs.writeFileSync(
    path.join(tmpDir, 'plans', 'launch-workflow', 'plan.md'),
    [
      '---',
      'title: "Launch Workflow"',
      'description: "E2E smoke test plan"',
      'status: pending',
      'priority: P1',
      'effort: 1d',
      'created: 2026-03-31',
      'tags: [test, workflow]',
      '---',
      '',
      '# Plan',
      '',
      'Approval Status: pending',
      ''
    ].join('\n')
  );
  writePlanRuntimeArtifacts(path.join(tmpDir, 'plans', 'launch-workflow'));

  const blockedImplementation = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const blockedParsed = JSON.parse(blockedImplementation.stdout);
  assert.equal(blockedParsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(blockedParsed.hookSpecificOutput.permissionDecisionReason, /Approval Status: approved/);

  fs.writeFileSync(
    path.join(tmpDir, 'plans', 'launch-workflow', 'plan.md'),
    [
      '---',
      'title: "Launch Workflow"',
      'description: "E2E smoke test plan"',
      'status: in-progress',
      'priority: P1',
      'effort: 1d',
      'created: 2026-03-31',
      'tags: [test, workflow]',
      '---',
      '',
      '# Plan',
      '',
      'Approval Status: approved',
      ''
    ].join('\n')
  );

  const approvedSession = runHook(
    '.claude/hooks/session-init.cjs',
    {
      source: 'resume',
      session_id: 'e2e-main'
    },
    tmpDir
  );
  const approvedContext = JSON.parse(approvedSession.stdout).hookSpecificOutput.additionalContext;
  assert.match(approvedContext, /Current plan approval: approved/);
  assert.match(approvedContext, /Current task graph: plans\/launch-workflow\/task-graph\.json/);

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'e2e-frontend',
      agent_type: 'frontend-engineer'
    },
    tmpDir
  );
  const engineerWrite = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'e2e-frontend',
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  assert.equal(JSON.parse(engineerWrite.stdout).continue, true);
  fs.writeFileSync(path.join(tmpDir, 'src', 'app.ts'), 'export const ok = true;\n');

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'e2e-qa',
      agent_type: 'qa-tester'
    },
    tmpDir
  );
  const qaWrite = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'e2e-qa',
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'tests', 'app.test.ts')
      }
    },
    tmpDir
  );
  assert.equal(JSON.parse(qaWrite.stdout).continue, true);
  fs.writeFileSync(path.join(tmpDir, 'tests', 'app.test.ts'), 'test("ok", () => {});\n');

  runHook(
    '.claude/hooks/subagent-context.cjs',
    {
      session_id: 'e2e-strategy',
      agent_type: 'marketing-strategist'
    },
    tmpDir
  );
  const blockedStrategist = runHook(
    '.claude/hooks/plan-approval-gate.cjs',
    {
      session_id: 'e2e-strategy',
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(tmpDir, 'src', 'app.ts')
      }
    },
    tmpDir
  );
  const strategistParsed = JSON.parse(blockedStrategist.stdout);
  assert.equal(strategistParsed.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(strategistParsed.hookSpecificOutput.permissionDecisionReason, /strategy artifacts/i);

  assert.equal(fs.existsSync(path.join(tmpDir, 'reports', 'research', '20260331-demo', 'research-summary.md')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'reports', 'strategy', '20260331-demo', 'strategy-memo.md')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'plans', 'launch-workflow', 'plan.md')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'plans', 'launch-workflow', 'task-graph.json')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'plans', 'launch-workflow', 'ownership-matrix.md')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'src', 'app.ts')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'tests', 'app.test.ts')), true);
});
