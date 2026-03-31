#!/usr/bin/env node
'use strict';

const {
  buildWorkflowSummary,
  describeAgentEditPolicy,
  recordAgentSession,
  readHookStdin,
  responseWithContext
} = require('./workflow-utils.cjs');

function buildAgentReminder(agentName) {
  const normalized = (agentName || '').toLowerCase();

  if (['market-researcher', 'competitor-analyst', 'ga4-analyst'].includes(normalized)) {
    return 'If you save artifacts under reports/**, write the analysis in Vietnamese. Keep verbatim source quotes in the original language when useful.';
  }

  if (/(engineer|developer|devops)/.test(normalized)) {
    return 'You may edit only the files in your assigned scope. If the plan is not approved, stop and report BLOCKED.';
  }

  if (/(reviewer|tester)/.test(normalized)) {
    return 'Report concrete findings first. Do not wave through missing tests or unresolved blockers.';
  }

  if (/(planner|manager|strategist)/.test(normalized)) {
    return 'Return structured handoff output with owner, acceptance criteria, and next step.';
  }

  return 'Return a concise report with status, summary, blockers, and next handoff.';
}

try {
  const payload = readHookStdin();
  const agentName = payload.agent_type || payload.agent_name || payload.agent_id || '';
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  recordAgentSession(projectRoot, payload.session_id, agentName);
  const editPolicy = describeAgentEditPolicy(agentName);

  process.stdout.write(
    JSON.stringify(
      responseWithContext(
        'SubagentStart',
        `## Subagent Context\nAgent: ${agentName || 'unknown'}\n${buildWorkflowSummary(projectRoot)}\n${buildAgentReminder(agentName)}${editPolicy ? `\n${editPolicy}` : ''}\n\nRequired ending:\n**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT\n**Summary:** 1-2 sentences\n**Next Handoff:** which role should act next`
      )
    )
  );
  process.exit(0);
} catch {
  process.exit(0);
}
