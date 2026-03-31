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

function runHook(relativePath, payload, cwd) {
  const result = spawnSync(
    process.execPath,
    [path.join(projectRoot, relativePath)],
    {
      cwd,
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: cwd
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

test('plan approval gate uses the active plan instead of an unrelated approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const oldPlanDir = path.join(tmpDir, 'plans', 'old-release');
  const newPlanDir = path.join(tmpDir, 'plans', 'new-feature');
  fs.mkdirSync(oldPlanDir, { recursive: true });
  fs.mkdirSync(newPlanDir, { recursive: true });
  fs.writeFileSync(path.join(oldPlanDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
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
  assert.match(context, /Current plan approval/);
  assert.match(context, /senior-only/);
});

test('marketing strategist cannot edit product source even with an approved plan', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(
    path.join(planDir, 'plan.md'),
    '# Plan\n\nApproval Status: approved\n'
  );

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

test('bash approval gate respects non-engineering artifact scope', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-'));
  const planDir = path.join(tmpDir, 'plans', 'feature');
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(path.join(planDir, 'plan.md'), '# Plan\n\nApproval Status: approved\n');
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
      allowedPath: ['plans', 'pm-brief.md'],
      blockedPath: ['src', 'feature.ts'],
      reason: /plans and docs only/i
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

test('workflow e2e smoke: research -> plan -> approval -> implementation', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-e2e-'));
  fs.mkdirSync(path.join(tmpDir, 'reports', 'research', '20260331-demo'), { recursive: true });
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
  assert.equal(fs.existsSync(path.join(tmpDir, 'plans', 'launch-workflow', 'plan.md')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'src', 'app.ts')), true);
  assert.equal(fs.existsSync(path.join(tmpDir, 'tests', 'app.test.ts')), true);
});
