# Primary Workflow

All roles in this workflow operate at a senior or staff-level bar. Outputs should be evidence-based, explicit about risks, and disciplined about handoffs, approval, review, and testing.

## 1. Marketing Discovery

- Prefer `/eup-market-cycle` as the orchestration entrypoint when work should run in parallel.
- `market-researcher` gathers customer, market, and channel evidence.
- `competitor-analyst` benchmarks direct and adjacent competitors.
- `ga4-analyst` turns GA4 data into decision-ready findings.
- Output required under `reports/research/**`: `research-summary.md`, `customer-signals.md`, `quote-bank.md`, `sources.md`, `competitor-landscape.md`, plus `ga4-insights.md` and `channel-scorecard.md` when GA4 or channel analysis is in scope.

## 2. Strategy Synthesis

- `marketing-strategist` merges discovery outputs into a strategy memo.
- The saved handoff artifact is `reports/strategy/YYYYMMDD-[slug]/strategy-memo.md`.
- The strategy memo must contain: target audience, positioning, channel priorities, priority experiments, measurement notes, concrete dev asks, PM intake packet, and role handoffs.

## 3. Optional Debate

- Prefer `/eup-debate` when the company should argue through a strategy, initiative, or task before dev intake or planning is locked.
- Use it when there are multiple viable directions, meaningful reversibility cost, or real disagreement between commercial upside and technical feasibility.
- Skip it for routine execution or when one direction is already clearly dominant and evidence-backed.
- Debate artifacts live in the same `reports/strategy/YYYYMMDD-[slug]/` folder as the strategy memo.
- The final artifact is `debate-memo.md`, which must say whether the next handoff is revised strategy work, `/eup-dev-intake`, or planning.

## 4. Distribution and Ops Support

- `social-media-manager` turns strategy into a social calendar, queue plan, and dry-run publishing ops when social publishing is in scope.
- `seo-specialist` audits crawlability, on-page SEO, internal linking, and content discoverability when organic growth is part of the brief.
- `revops-manager` defines lead lifecycle, routing, CRM automation, and handoff rules when marketing must connect cleanly to revenue workflows.
- `growth-manager` owns signup friction, onboarding activation, paywall optimization, pricing, and experiment backlog when acquisition, activation, or monetization is in scope.

## 5. Technical Intake

- Prefer `/eup-dev-intake` as the orchestration entrypoint when PM, scout, and brainstorm work should run as an Agent Team.
- In the default company path, `/eup-dev-intake` continues through `implementation-planner` and produces the approval bundle. Use `/eup-plan` only when a standalone planning pass is explicitly requested or PM intake already exists.
- The most recently edited `reports/strategy/**/strategy-memo.md` becomes the active strategy input when no explicit active-strategy state is present.
- `project-manager` converts the saved strategy memo into backlog items, dependencies, file ownership, and `reports/strategy/**/dev-intake.md`.
- `project-manager` is blocked until a complete `reports/strategy/**/strategy-memo.md` exists.
- `codebase-scout` maps the existing codebase before planning or implementation, usually through `/eup-scout`.
- `technical-brainstormer` evaluates non-obvious technical options and recommends one path.

## 6. Approval Gate

- `implementation-planner` writes `plans/<slug>/plan.md`, `plans/<slug>/task-graph.json`, and `plans/<slug>/ownership-matrix.md`.
- The most recently edited `plans/**/plan.md` becomes the active plan for approval gating.
- Every plan must contain an explicit line: `Approval Status: pending`.
- Implementation stays blocked if the active approved plan is missing a valid `task-graph.json` or a non-empty `ownership-matrix.md`.
- No product-code edits outside `.claude/`, `plans/`, `reports/`, `docs/`, `tracking-plan.md`, `README.md`, or `CLAUDE.md` before approval.
- After the user explicitly approves, update that same active plan file to `Approval Status: approved`.

## 7. Implementation

- The main session owns delegation. `/eup-implement` is the preferred orchestration entrypoint after approval.
- Use official Agent Teams with 3-5 teammates by default when tasks are independent enough to benefit from parallelism.
- Use worktree isolation for parallel implementation whenever engineers own separate file groups.
- `database-engineer`, `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `fullstack-developer`, and `devops-engineer` implement only approved work.
- Each engineer must have distinct file ownership. No overlap.
- Marketing, PM, growth, and planning roles may write reports, docs, and plans in their allowed scope, but never product source files.

## 8. Quality Gate

- `quality-reviewer` runs before `qa-tester`.
- `qa-tester` runs the real test/build commands and reports gaps or failures.
- Blocking review findings or failing tests send work back to implementation.

## 9. Release

- `devops-engineer` only performs deploy or infrastructure mutations when the user explicitly asks for go-live.
- Release notes must include what changed, what was tested, and remaining risk.
