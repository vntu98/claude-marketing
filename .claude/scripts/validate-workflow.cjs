#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return {};
  }

  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    if (!line.trim()) {
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey] = [];
      }
      frontmatter[currentKey].push(listMatch[1].trim());
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (!keyMatch) {
      continue;
    }

    const [, key, rawValue] = keyMatch;
    currentKey = key;
    let value = rawValue.trim();

    if (!value) {
      frontmatter[key] = [];
      continue;
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).trim();
      frontmatter[key] = value
        ? value.split(',').map((item) => item.trim())
        : [];
      continue;
    }

    if (value.includes(',') && ['tools', 'allowed-tools'].includes(key)) {
      frontmatter[key] = value.split(',').map((item) => item.trim());
      continue;
    }

    frontmatter[key] = value.replace(/^"(.*)"$/, '$1');
  }

  return frontmatter;
}

function listFiles(dir, filter) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, filter));
      continue;
    }

    if (filter(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function stripCodeFences(content) {
  return content.replace(/```[\s\S]*?```/g, '');
}

function validateMarkdownLinks(projectRoot, markdownFiles) {
  const errors = [];

  for (const filePath of markdownFiles) {
    const content = stripCodeFences(readFile(filePath));
    const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
    let match;

    while ((match = linkPattern.exec(content))) {
      const target = match[1].trim();
      if (
        !target ||
        target.startsWith('#') ||
        target.startsWith('http://') ||
        target.startsWith('https://') ||
        target.startsWith('mailto:') ||
        target.startsWith('javascript:') ||
        target.includes('<') ||
        target.includes('>')
      ) {
        continue;
      }

      const resolved = path.resolve(path.dirname(filePath), target);
      if (!fs.existsSync(resolved)) {
        errors.push(
          `Broken markdown link in ${path.relative(projectRoot, filePath)} -> ${target}`
        );
      }
    }
  }

  return errors;
}

function loadNamedMarkdownFiles(rootDir) {
  const files = listFiles(rootDir, (fullPath) => fullPath.endsWith('.md'));
  const map = new Map();

  for (const filePath of files) {
    const frontmatter = parseFrontmatter(readFile(filePath));
    if (frontmatter.name) {
      map.set(frontmatter.name, { filePath, frontmatter });
    }
  }

  return map;
}

function validateNamedEntryIdentifiers(entries, label, errors) {
  for (const [name, entry] of entries.entries()) {
    if (!/^[a-z0-9-]+$/.test(name)) {
      errors.push(
        `${label} name "${name}" in ${path.basename(path.dirname(entry.filePath)) || path.basename(entry.filePath)} must use lowercase letters, numbers, and hyphens only`
      );
    }
  }
}

function extractCommandPaths(settings) {
  const paths = [];
  const hooks = settings.hooks || {};

  for (const eventHooks of Object.values(hooks)) {
    for (const matcherEntry of eventHooks || []) {
      for (const hook of matcherEntry.hooks || []) {
        if (hook.type === 'command' && typeof hook.command === 'string') {
          const match = hook.command.match(/\.claude\/hooks\/([A-Za-z0-9._-]+\.cjs)/);
          if (match) {
            paths.push(path.join('.claude', 'hooks', match[1]));
          }
        }
      }
    }
  }

  return paths;
}

function collectToolEnvVars(projectRoot) {
  const toolFiles = listFiles(
    path.join(projectRoot, 'tools'),
    (fullPath) => fullPath.endsWith('.js')
  );
  const envVars = new Set();

  for (const toolFile of toolFiles) {
    const content = readFile(toolFile);
    const matches = content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
    for (const match of matches) {
      envVars.add(match[1]);
    }
  }

  return [...envVars].sort();
}

function validateProject(projectRoot) {
  const errors = [];
  const warnings = [];
  const skillMap = loadNamedMarkdownFiles(path.join(projectRoot, '.claude', 'skills'));
  const agentMap = loadNamedMarkdownFiles(path.join(projectRoot, '.claude', 'agents'));

  validateNamedEntryIdentifiers(skillMap, 'Skill', errors);
  validateNamedEntryIdentifiers(agentMap, 'Agent', errors);

  const requiredAgents = [
    'market-researcher',
    'competitor-analyst',
    'ga4-analyst',
    'marketing-strategist',
    'social-media-manager',
    'seo-specialist',
    'revops-manager',
    'growth-manager',
    'project-manager',
    'codebase-scout',
    'technical-brainstormer',
    'implementation-planner',
    'database-engineer',
    'backend-engineer',
    'frontend-engineer',
    'mobile-engineer',
    'fullstack-developer',
    'quality-reviewer',
    'qa-tester',
    'devops-engineer'
  ];
  const durableArtifactAgents = [
    'codebase-scout',
    'technical-brainstormer',
    'quality-reviewer'
  ];

  for (const agentName of requiredAgents) {
    if (!agentMap.has(agentName)) {
      errors.push(`Missing agent: ${agentName}`);
      continue;
    }

    const agent = agentMap.get(agentName);
    if (agent.frontmatter.seniority !== 'senior') {
      errors.push(`Agent ${agentName} must declare seniority: senior`);
    }

    if (!/use proactively/i.test(agent.frontmatter.description || '')) {
      errors.push(
        `Agent ${agentName} description should include "Use proactively" to improve automatic delegation`
      );
    }
  }

  for (const agentName of durableArtifactAgents) {
    if (!agentMap.has(agentName)) {
      continue;
    }

    const tools = agentMap.get(agentName).frontmatter.tools || [];
    if (!Array.isArray(tools) || !tools.includes('Write') || !tools.includes('Edit')) {
      errors.push(`Agent ${agentName} must allow Write and Edit so it can save durable handoff artifacts`);
    }
  }

  const coreSkillBindings = {
    'eup-analytics': 'ga4-analyst',
    'eup-strategy': 'marketing-strategist',
    'eup-social-content': 'social-media-manager',
    'eup-seo-audit': 'seo-specialist',
    'eup-site-architecture': 'seo-specialist',
    'eup-revops': 'revops-manager',
    'eup-signup-optimization': 'growth-manager',
    'eup-onboarding-activation': 'growth-manager',
    'eup-monetization-paywall': 'growth-manager',
    'eup-pricing-strategy': 'growth-manager',
    'eup-scout': 'codebase-scout',
    'eup-brainstorm': 'technical-brainstormer',
    'eup-plan': 'implementation-planner',
    'eup-code': 'fullstack-developer',
    'eup-db': 'database-engineer',
    'eup-backend': 'backend-engineer',
    'eup-frontend': 'frontend-engineer',
    'eup-mobile': 'mobile-engineer',
    'eup-review': 'quality-reviewer',
    'eup-test': 'qa-tester',
    'eup-devops': 'devops-engineer'
  };
  const optionalInlineSkills = new Set([
    'eup-research'
  ]);

  const requiredManualSkills = [
    'eup-market-cycle',
    'eup-debate',
    'eup-dev-intake',
    'eup-implement',
    'eup-company-status'
  ];

  const manualByDefaultSkills = [
    'eup-pm',
    'eup-plan',
    'eup-devops'
  ];

  for (const skillName of requiredManualSkills) {
    const skill = skillMap.get(skillName);
    if (!skill) {
      errors.push(`Missing skill: ${skillName}`);
      continue;
    }

    if (skill.frontmatter['disable-model-invocation'] !== 'true') {
      errors.push(`${skillName} must set disable-model-invocation: true`);
    }

    const tools = skill.frontmatter['allowed-tools'] || [];
    const requiredTools = ['TeamCreate', 'TaskCreate', 'TaskUpdate', 'TaskList', 'SendMessage'];
    for (const requiredTool of requiredTools) {
      if (!tools.includes(requiredTool) && skillName !== 'eup-company-status') {
        errors.push(`${skillName} must allow ${requiredTool} for Agent Teams orchestration`);
      }
    }
  }

  for (const skillName of manualByDefaultSkills) {
    const skill = skillMap.get(skillName);
    if (!skill) {
      continue;
    }

    if (skill.frontmatter['disable-model-invocation'] !== 'true') {
      errors.push(`${skillName} must set disable-model-invocation: true to avoid uncontrolled auto-invocation`);
    }
  }

  const orchestrationSkillChecks = {
    'eup-market-cycle': [
      /shut down idle teammates and delete the team with `TeamDelete` from the lead session/i
    ],
    'eup-debate': [
      /exact option set with 2-3 materially different options/i,
      /no-action or defer baseline/i,
      /weighted decision criteria/i,
      /concede at least one valid criticism/i,
      /If no option clearly beats the strongest alternative and the no-action baseline/i
    ],
    'eup-dev-intake': [
      /shut down idle teammates and delete the dev-intake team with `TeamDelete` from the lead session/i
    ],
    'eup-implement': [
      /Before `TeamCreate`, check whether this lead session is already managing another team/i,
      /shut down idle teammates, call `TeamDelete` on the old team first/i,
      /Teammates do not inherit the lead chat history/i,
      /require native teammate plan approval before code changes/i,
      /split it into additional self-contained tasks so teammates can self-claim/i,
      /Wait for teammates to complete their tasks before the lead synthesizes/i,
      /shut down idle teammates and delete the team with `TeamDelete` from the lead session/i,
      /Only report `team disbanded`.*after `TeamDelete` returns success/i
    ]
  };

  for (const [skillName, patterns] of Object.entries(orchestrationSkillChecks)) {
    const skill = skillMap.get(skillName);
    if (!skill) {
      errors.push(`Missing skill: ${skillName}`);
      continue;
    }

    const content = readFile(skill.filePath);
    for (const pattern of patterns) {
      if (!pattern.test(content)) {
        errors.push(`${skillName} is missing orchestration guidance matching ${pattern}`);
      }
    }
  }

  const teamReadyAgents = [
    'market-researcher',
    'competitor-analyst',
    'ga4-analyst',
    'marketing-strategist',
    'social-media-manager',
    'seo-specialist',
    'revops-manager',
    'growth-manager',
    'project-manager',
    'codebase-scout',
    'technical-brainstormer',
    'implementation-planner',
    'database-engineer',
    'backend-engineer',
    'frontend-engineer',
    'mobile-engineer',
    'fullstack-developer',
    'quality-reviewer',
    'qa-tester',
    'devops-engineer'
  ];

  for (const agentName of teamReadyAgents) {
    const agent = agentMap.get(agentName);
    if (!agent) {
      continue;
    }

    const tools = agent.frontmatter.tools || [];
    for (const requiredTool of ['TaskGet', 'TaskUpdate', 'TaskList', 'SendMessage']) {
      if (!tools.includes(requiredTool)) {
        errors.push(`Agent ${agentName} must allow ${requiredTool} for team-ready execution`);
      }
    }

    if (tools.includes('TaskCreate')) {
      errors.push(`Agent ${agentName} must not allow TaskCreate; only the lead should create new team tasks`);
    }
  }

  const worktreeIsolatedAgents = [
    'database-engineer',
    'backend-engineer',
    'frontend-engineer',
    'mobile-engineer',
    'fullstack-developer',
    'qa-tester',
    'devops-engineer'
  ];

  for (const agentName of worktreeIsolatedAgents) {
    const agent = agentMap.get(agentName);
    if (!agent) {
      continue;
    }

    if (agent.frontmatter.isolation !== 'worktree') {
      errors.push(`Agent ${agentName} must declare isolation: worktree for safe parallel execution`);
    }
  }

  const requiredModelAssignments = {
    'marketing-strategist': 'opus',
    'technical-brainstormer': 'opus',
    'implementation-planner': 'opus',
    'codebase-scout': 'haiku'
  };

  for (const [agentName, expectedModel] of Object.entries(requiredModelAssignments)) {
    const agent = agentMap.get(agentName);
    if (!agent) {
      continue;
    }

    if (agent.frontmatter.model !== expectedModel) {
      errors.push(`Agent ${agentName} must use model: ${expectedModel}`);
    }
  }

  for (const [skillName, agentName] of Object.entries(coreSkillBindings)) {
    const skill = skillMap.get(skillName);
    if (!skill) {
      errors.push(`Missing skill: ${skillName}`);
      continue;
    }

    if (skill.frontmatter.agent !== agentName) {
      errors.push(`${skillName} should bind to agent ${agentName}`);
    }
  }

  for (const skillName of optionalInlineSkills) {
    const skill = skillMap.get(skillName);
    if (!skill) {
      errors.push(`Missing skill: ${skillName}`);
      continue;
    }

    if (skill.frontmatter.context === 'fork' && !hasText(skill.frontmatter.agent)) {
      errors.push(`${skillName} must declare an agent when context: fork is used`);
    }
  }

  const scoutSkill = skillMap.get('eup-scout');
  if (!scoutSkill) {
    errors.push('Missing skill: eup-scout');
  } else if (scoutSkill.frontmatter['disable-model-invocation'] !== 'true') {
    errors.push('eup-scout should set disable-model-invocation: true');
  }

  const pmSkill = skillMap.get('eup-pm');
  if (!pmSkill) {
    errors.push('Missing skill: eup-pm');
  } else if (pmSkill.frontmatter.context === 'fork') {
    errors.push('eup-pm must run inline because orchestration cannot happen inside a forked subagent');
  } else {
    const pmContent = readFile(pmSkill.filePath);
    if (!/Approval Status:\s*approved/i.test(pmContent)) {
      errors.push('eup-pm must not allow implementation without a saved approved plan');
    }
    if (!/\/eup-scout/i.test(pmContent) || !/\/eup-plan/i.test(pmContent)) {
      errors.push('eup-pm must route discovery and planning through /eup-scout and /eup-plan');
    }
    if (!/reports\/strategy\/\*\*\/strategy-memo\.md/i.test(pmContent)) {
      errors.push('eup-pm must require a saved strategy memo under reports/strategy/**/strategy-memo.md');
    }
    if (!/dev-intake\.md/i.test(pmContent)) {
      errors.push('eup-pm must support saving a durable dev-intake.md packet');
    }
    if (!/return `BLOCKED`|return BLOCKED|stop immediately/i.test(pmContent)) {
      errors.push('eup-pm must explicitly block when the strategy memo gate is missing');
    }
    if (!/do not scope directly from raw research/i.test(pmContent)) {
      errors.push('eup-pm must reject raw research as a substitute for a strategy memo');
    }
    if (!/main session\/controller|main session\/controller decides|main session\/controller can execute/i.test(pmContent)) {
      errors.push('eup-pm must explicitly say the main session/controller owns delegation');
    }
    if (/^\s*Agent\(/m.test(pmContent) || /spawn multiple subagents/i.test(pmContent)) {
      errors.push('eup-pm must not embed recursive Agent(...) orchestration examples');
    }
  }

  for (const skillName of ['eup-research', 'eup-analytics', 'eup-social-content']) {
    const skill = skillMap.get(skillName);
    const tools = skill?.frontmatter['allowed-tools'] || [];
    if (!Array.isArray(tools) || !tools.includes('Bash')) {
      errors.push(`${skillName} must allow Bash for local data tooling`);
    }
  }

  const researchSkill = skillMap.get('eup-research');
  if (!researchSkill) {
    errors.push('Missing skill: eup-research');
  } else {
    const researchContent = readFile(researchSkill.filePath);
    const requiredResearchPatterns = [
      /Jobs to Be Done/i,
      /Functional job:/i,
      /Emotional job:/i,
      /Social job:/i,
      /Pain Points/i,
      /Trigger Events/i,
      /Desired Outcomes/i,
      /Capture exact quotes, not paraphrases/i,
      /Language and Vocabulary/i,
      /Alternatives Considered/i,
      /direct competitors/i,
      /secondary \/ adjacent competitors/i,
      /Strengths/i,
      /Weaknesses/i,
      /SWOT/i,
      /competitor-landscape\.md/i,
      /reports\/research\//i
    ];
    for (const pattern of requiredResearchPatterns) {
      if (!pattern.test(researchContent)) {
        errors.push(`eup-research is missing required research guidance matching ${pattern}`);
      }
    }

    const tools = researchSkill.frontmatter['allowed-tools'] || [];
    if (!Array.isArray(tools) || !tools.includes('Write') || !tools.includes('Edit')) {
      errors.push('eup-research must allow Write and Edit so research reports can be saved under reports/**');
    }

    if (!/English/i.test(researchContent)) {
      errors.push('eup-research must explicitly require English writing for reports/** artifacts');
    }
  }

  const marketResearcher = agentMap.get('market-researcher');
  if (marketResearcher) {
    const tools = marketResearcher.frontmatter.tools || [];
    if (!Array.isArray(tools) || !tools.includes('Write') || !tools.includes('Edit')) {
      errors.push('market-researcher must allow Write and Edit for reports/** output');
    }
  }

  const agentContractsPath = path.join(projectRoot, '.claude', 'rules', 'agent-contracts.md');
  if (fs.existsSync(agentContractsPath)) {
    const agentContracts = readFile(agentContractsPath);
    if (!/Every company role is senior-only/i.test(agentContracts)) {
      errors.push('agent-contracts.md must define the senior-only operating standard');
    }
  }

  const competitorAnalyst = agentMap.get('competitor-analyst');
  if (competitorAnalyst) {
    const competitorContent = readFile(competitorAnalyst.filePath);
    const requiredCompetitorPatterns = [
      /direct, secondary, and substitute competitors/i,
      /strengths/i,
      /weaknesses/i,
      /pricing/i,
      /review themes/i,
      /SWOT/i,
      /competitor-landscape\.md/i
    ];
    for (const pattern of requiredCompetitorPatterns) {
      if (!pattern.test(competitorContent)) {
        errors.push(`competitor-analyst is missing required competitor guidance matching ${pattern}`);
      }
    }
  }

  const reportWriterAgents = {
    'competitor-analyst': 'competitor-analyst must allow Write and Edit for research artifact output',
    'ga4-analyst': 'ga4-analyst must allow Write and Edit for tracking plans and measurement artifacts',
    'social-media-manager': 'social-media-manager must allow Write and Edit for calendars and scheduling artifacts',
    'seo-specialist': 'seo-specialist must allow Write and Edit for audit and site-architecture artifacts'
  };

  for (const [agentName, errorMessage] of Object.entries(reportWriterAgents)) {
    const agent = agentMap.get(agentName);
    if (!agent) {
      continue;
    }

    const tools = agent.frontmatter.tools || [];
    if (!Array.isArray(tools) || !tools.includes('Write') || !tools.includes('Edit')) {
      errors.push(errorMessage);
    }
  }

  const corePromptChecks = {
    'project-manager': [/Task Packet Seeds/i, /Critical path/i, /Acceptance Criteria:/i],
    'codebase-scout': [/Architecture Snapshot/i, /Smallest Safe Change Surface/i, /Untouched Modules/i],
    'technical-brainstormer': [/Option Matrix/i, /Why Not The Other Options/i, /Planner Notes/i],
    'quality-reviewer': [/## Findings/i, /Residual Risks/i, /no findings/i]
  };

  for (const [agentName, patterns] of Object.entries(corePromptChecks)) {
    const agent = agentMap.get(agentName);
    if (!agent) {
      continue;
    }

    const content = readFile(agent.filePath);
    for (const pattern of patterns) {
      if (!pattern.test(content)) {
        errors.push(`${agentName} is missing required Phase 1 prompt guidance matching ${pattern}`);
      }
    }
  }

  const planTemplatePath = path.join(
    projectRoot,
    '.claude',
    'skills',
    'eup-plan',
    'references',
    'plan-template.md'
  );
  if (!fs.existsSync(planTemplatePath)) {
    errors.push('Missing plan template reference: .claude/skills/eup-plan/references/plan-template.md');
  } else {
    const planTemplate = readFile(planTemplatePath);
    if (!/Approval Status:\s*pending/i.test(planTemplate)) {
      errors.push('Plan template must include `Approval Status: pending`');
    }
    if (!/title:\s*".+"/.test(planTemplate) || !/status:\s*pending/.test(planTemplate)) {
      errors.push('Plan template must include YAML frontmatter fields aligned with eup-plan');
    }
    if (!/phase-01-/i.test(planTemplate)) {
      errors.push('Plan template must include linked multi-phase files');
    }
    if (!/task-graph\.json/i.test(planTemplate) || !/ownership-matrix\.md/i.test(planTemplate)) {
      errors.push('Plan template must include task-graph.json and ownership-matrix.md runtime artifacts');
    }
  }

  const contextPath = path.join(projectRoot, '.claude', 'eup-context.md');
  if (!fs.existsSync(contextPath)) {
    errors.push('Missing .claude/eup-context.md');
  }

  const reportTemplatePath = path.join(
    projectRoot,
    '.claude',
    'skills',
    'eup-research',
    'references',
    'report-template.md'
  );
  if (!fs.existsSync(reportTemplatePath)) {
    errors.push('Missing research report template reference: .claude/skills/eup-research/references/report-template.md');
  } else {
    const reportTemplate = readFile(reportTemplatePath);
    if (!/Research Summary/i.test(reportTemplate) || !/Quote Bank/i.test(reportTemplate)) {
      errors.push('Research report template must provide English report headings');
    }
    if (!/competitor-landscape\.md/i.test(reportTemplate) || !/Our SWOT/i.test(reportTemplate)) {
      errors.push('Research report template must include competitor-landscape.md and SWOT structure');
    }
  }

  const competitorTemplatePath = path.join(
    projectRoot,
    '.claude',
    'skills',
    'eup-research',
    'references',
    'competitor-template.md'
  );
  if (!fs.existsSync(competitorTemplatePath)) {
    errors.push('Missing competitor research template reference: .claude/skills/eup-research/references/competitor-template.md');
  }

  const strategySkill = skillMap.get('eup-strategy');
  if (!strategySkill) {
    errors.push('Missing skill: eup-strategy');
  } else {
    const strategyContent = readFile(strategySkill.filePath);
    const requiredStrategyPatterns = [
      /Target audience/i,
      /Positioning/i,
      /Channel priorities/i,
      /Priority experiments/i,
      /Measurement notes/i,
      /Concrete dev asks/i,
      /Role handoffs/i,
      /PM intake packet/i,
      /reports\/strategy\/YYYYMMDD-\[slug\]\/strategy-memo\.md/i
    ];
    for (const pattern of requiredStrategyPatterns) {
      if (!pattern.test(strategyContent)) {
        errors.push(`eup-strategy is missing required strategy memo guidance matching ${pattern}`);
      }
    }

    const tools = strategySkill.frontmatter['allowed-tools'] || [];
    if (!Array.isArray(tools) || !tools.includes('Write') || !tools.includes('Edit')) {
      errors.push('eup-strategy must allow Write and Edit so saved strategy memos can be written under reports/strategy/**');
    }
  }

  const strategyMemoTemplatePath = path.join(
    projectRoot,
    '.claude',
    'skills',
    'eup-strategy',
    'references',
    'strategy-memo-template.md'
  );
  if (!fs.existsSync(strategyMemoTemplatePath)) {
    errors.push('Missing strategy memo template reference: .claude/skills/eup-strategy/references/strategy-memo-template.md');
  } else {
    const strategyTemplate = readFile(strategyMemoTemplatePath);
    const requiredTemplatePatterns = [
      /reports\/strategy\/YYYYMMDD-\[slug\]\/strategy-memo\.md/i,
      /^##\s+Target Audience$/im,
      /^##\s+Positioning$/im,
      /^##\s+Channel Priorities$/im,
      /^##\s+Priority Experiments$/im,
      /^##\s+Measurement Notes$/im,
      /^##\s+Concrete Dev Asks$/im,
      /^##\s+PM Intake Packet$/im,
      /^##\s+Role Handoffs$/im
    ];
    for (const pattern of requiredTemplatePatterns) {
      if (!pattern.test(strategyTemplate)) {
        errors.push(`Strategy memo template is missing required structure matching ${pattern}`);
      }
    }
  }

  const seoSpecialist = agentMap.get('seo-specialist');
  if (seoSpecialist) {
    const skills = seoSpecialist.frontmatter.skills || [];
    if (!Array.isArray(skills) || !skills.includes('eup-site-architecture')) {
      errors.push('seo-specialist must include eup-site-architecture for IA handoffs');
    }
  }

  const legacyContextPaths = [
    path.join(projectRoot, '.agents', 'eup-context.md'),
    path.join(projectRoot, '.agents', 'product-marketing-context.md')
  ];
  for (const legacyPath of legacyContextPaths) {
    if (fs.existsSync(legacyPath)) {
      warnings.push(`Legacy context file still present: ${path.relative(projectRoot, legacyPath)}`);
    }
  }

  const reportsReadmePath = path.join(projectRoot, 'reports', 'README.md');
  if (!fs.existsSync(reportsReadmePath)) {
    errors.push('Missing reports/README.md');
  } else {
    const reportsReadme = readFile(reportsReadmePath);
    if (!/ga4-insights\.md/i.test(reportsReadme) || !/channel-scorecard\.md/i.test(reportsReadme)) {
      errors.push('reports/README.md must document ga4-insights.md and channel-scorecard.md');
    }
    if (!/dev-intake\.md/i.test(reportsReadme)) {
      errors.push('reports/README.md must document dev-intake.md');
    }
    if (!/debate-memo\.md/i.test(reportsReadme)) {
      errors.push('reports/README.md must document debate-memo.md');
    }
  }

  const plansReadmePath = path.join(projectRoot, 'plans', 'README.md');
  if (!fs.existsSync(plansReadmePath)) {
    errors.push('Missing plans/README.md');
  } else {
    const plansReadme = readFile(plansReadmePath);
    if (!/task-graph\.json/i.test(plansReadme) || !/ownership-matrix\.md/i.test(plansReadme)) {
      errors.push('plans/README.md must document task-graph.json and ownership-matrix.md');
    }
  }

  const requiredRules = [
    '.claude/rules/primary-workflow.md',
    '.claude/rules/agent-contracts.md',
    '.claude/rules/engineering-guardrails.md'
  ];
  for (const relativePath of requiredRules) {
    if (!fs.existsSync(path.join(projectRoot, relativePath))) {
      errors.push(`Missing rule file: ${relativePath}`);
    }
  }

  const settingsPath = path.join(projectRoot, '.claude', 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    errors.push('Missing .claude/settings.json');
  } else {
    const settings = JSON.parse(readFile(settingsPath));
    if (settings.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS !== '1') {
      errors.push('settings.json must enable CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS');
    }
    if (!settings.statusLine?.command || !/\.claude\/statusline\.cjs/.test(settings.statusLine.command)) {
      errors.push('settings.json must register .claude/statusline.cjs as the status line command');
    }
    const deniedRules = JSON.stringify(settings.permissions?.deny || []);
    for (const requiredPattern of ['Read(./.env)', 'Read(./.env.*)', 'Read(./secrets/**)']) {
      if (!deniedRules.includes(requiredPattern)) {
        errors.push(`settings.json must deny ${requiredPattern}`);
      }
    }
    if (!settings.hooks?.SubagentStop?.length) {
      errors.push('settings.json must register a SubagentStop hook for agent contract enforcement');
    }
    if (!settings.hooks?.PostToolUse?.length) {
      errors.push('settings.json must register a PostToolUse hook for active plan tracking');
    }
    const preToolHooks = JSON.stringify(settings.hooks?.PreToolUse || []);
    if (!/bash-approval-gate\.cjs/.test(preToolHooks)) {
      errors.push('settings.json must register bash-approval-gate.cjs to block shell mutation bypasses');
    }
    const postToolHooks = JSON.stringify(settings.hooks?.PostToolUse || []);
    if (!/active-plan-sync\.cjs/.test(postToolHooks)) {
      errors.push('settings.json must register active-plan-sync.cjs to track the active plan');
    }
    if (!/active-strategy-sync\.cjs/.test(postToolHooks)) {
      errors.push('settings.json must register active-strategy-sync.cjs to track the active strategy memo');
    }
    if (!settings.hooks?.TaskCompleted?.length) {
      errors.push('settings.json must register a TaskCompleted hook for Agent Teams progress tracking');
    }
    if (!settings.hooks?.TaskCreated?.length) {
      errors.push('settings.json must register a TaskCreated hook for task packet validation');
    }
    if (!settings.hooks?.TeammateIdle?.length) {
      errors.push('settings.json must register a TeammateIdle hook for Agent Teams idle handling');
    }
    if (!settings.hooks?.ConfigChange?.length) {
      errors.push('settings.json must register a ConfigChange hook for company runtime changes');
    }
    if (!settings.hooks?.Stop?.length || !settings.hooks?.SessionEnd?.length) {
      errors.push('settings.json must persist session state on Stop and SessionEnd');
    }
    for (const hookPath of extractCommandPaths(settings)) {
      if (!fs.existsSync(path.join(projectRoot, hookPath))) {
        errors.push(`Missing hook referenced in settings.json: ${hookPath}`);
      }
    }
  }

  if (!fs.existsSync(path.join(projectRoot, '.mcp.json.example'))) {
    errors.push('Missing .mcp.json.example');
  }

  const trackingPlanPath = path.join(projectRoot, 'tracking-plan.md');
  if (!fs.existsSync(trackingPlanPath)) {
    errors.push('Missing tracking-plan.md');
  } else {
    const trackingPlan = readFile(trackingPlanPath);
    if (!/signup_completed/i.test(trackingPlan) || !/subscription_started/i.test(trackingPlan)) {
      errors.push('tracking-plan.md must include the current signup and subscription conversion events');
    }
    if (/challenge_joined|workflow_submitted|challenge-funnel/i.test(trackingPlan)) {
      errors.push('tracking-plan.md still contains the old challenge funnel vocabulary');
    }
  }

  const ga4PresetPath = path.join(projectRoot, 'tools', 'ga4-presets.json');
  if (!fs.existsSync(ga4PresetPath)) {
    errors.push('Missing tools/ga4-presets.json');
  } else {
    const ga4Presets = JSON.parse(readFile(ga4PresetPath));
    if (!ga4Presets['learner-journey-funnel']) {
      errors.push('tools/ga4-presets.json must define learner-journey-funnel');
    }
    if (ga4Presets['challenge-funnel']) {
      errors.push('tools/ga4-presets.json should not keep the legacy challenge-funnel preset');
    }
  }

  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = readFile(gitignorePath);
    if (!/^\s*\.claude\/settings\.local\.json\s*$/m.test(gitignore)) {
      errors.push('.gitignore must ignore .claude/settings.local.json');
    }
    if (!/^\s*\.mcp\.json\s*$/m.test(gitignore)) {
      errors.push('.gitignore must ignore .mcp.json');
    }
    if (!/\.claude\/state\//.test(gitignore)) {
      warnings.push('Consider gitignoring .claude/state/ because hook session state is local-only');
    }
  } else {
    errors.push('Missing .gitignore');
  }

  const envExamplePath = path.join(projectRoot, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    errors.push('Missing .env.example');
  } else {
    const envExample = readFile(envExamplePath);
    for (const envVar of collectToolEnvVars(projectRoot)) {
      if (!new RegExp(`^${envVar}=`, 'm').test(envExample)) {
        errors.push(`.env.example must document ${envVar}`);
      }
    }
  }

  const markdownFiles = listFiles(
    path.join(projectRoot, '.claude'),
    (fullPath) => fullPath.endsWith('.md')
  );
  errors.push(...validateMarkdownLinks(projectRoot, markdownFiles));

  const skillDirsRoot = path.join(projectRoot, '.claude', 'skills');
  if (fs.existsSync(skillDirsRoot)) {
    for (const entry of fs.readdirSync(skillDirsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue;
      }
      if (!entry.name.startsWith('eup-')) {
        errors.push(`Non-EUP skill directory still present: .claude/skills/${entry.name}`);
      }
    }
  }

  const stalePatterns = [
    /\beup-email\b(?!-)/,
    /\beup-editing\b(?!-)/,
    /(?<!eup-)\bpage-cro\b/,
    /(?<!eup-)\bpaid-ads\b/,
    /\bcold-email\b/,
    /\bpopup-cro\b/,
    /\bonboarding-cro\b/,
    /(?<!eup-)\bseo-audit\b/
  ];
  const staleTargets = listFiles(path.join(projectRoot, '.claude', 'skills'), (fullPath) => fullPath.endsWith('SKILL.md'))
    .concat([
      path.join(projectRoot, 'README.md'),
      path.join(projectRoot, 'CLAUDE.md')
    ]);

  for (const target of staleTargets) {
    const content = readFile(target);
    for (const pattern of stalePatterns) {
      if (pattern.test(content)) {
        warnings.push(`Legacy reference "${pattern}" still present in ${path.relative(projectRoot, target)}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts: {
      skills: skillMap.size,
      agents: agentMap.size
    }
  };
}

if (require.main === module) {
  const projectRoot = process.argv[2]
    ? path.resolve(process.argv[2])
    : process.cwd();
  const result = validateProject(projectRoot);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : 1);
}

module.exports = {
  parseFrontmatter,
  validateProject
};
