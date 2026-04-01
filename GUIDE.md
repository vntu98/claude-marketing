# GUIDE

So sánh 2 cách vận hành trong dự án `EUP`: `subagent` và `orchestrate team`.

## 1. Subagent Workflow
```text
SUBAGENT / SEQUENTIAL
━━━━━━━━━━━━━━━━━━━━━

/eup-context
      ↓
/eup-research
      ↓
/eup-strategy
      ↓
/eup-debate (optional)
      ↓
/eup-pm
      ↓
/eup-scout
      ↓
/eup-brainstorm
      ↓
/eup-plan
      ↓
⛔ USER APPROVAL
      ↓
/eup-db | /eup-backend | /eup-frontend | /eup-mobile | /eup-code
      ↓
/eup-review → /eup-test
      ↓
/eup-devops (optional)
```

## 2. Orchestrate Team Workflow
```text
ORCHESTRATE TEAM
━━━━━━━━━━━━━━━━

/eup-context
      ↓
/eup-market-cycle
      ↓
market-researcher + competitor-analyst + ga4-analyst + seo-specialist|growth-manager
      ↓
marketing-strategist (save strategy memo)
      ↓
/eup-debate (optional)
      ↓
/eup-dev-intake
      ↓
project-manager + codebase-scout + technical-brainstormer
      ↓
implementation-planner (plan.md + task-graph.json + ownership-matrix.md)
      ↓
⛔ USER APPROVAL
      ↓
/eup-implement
      ↓
database + backend + frontend + mobile|fullstack
      ↓
quality-reviewer → qa-tester
      ↓
/eup-devops (optional)
```

## 3. Chọn Mode Nào

| Mode | Phù hợp nhất |
|------|--------------|
| `subagent` | task nhỏ, cần kiểm soát từng bước, scope còn mơ hồ |
| `orchestrate team` | research lớn, debate, dev intake, implementation có nhiều lane độc lập |

## 4. Quy tắc thực chiến

- Nếu nhiều người sẽ chạm cùng file, ưu tiên `subagent` hoặc gộp lane.
- Nếu có thể tách ownership rõ bằng artifact hoặc file glob, ưu tiên `orchestrate team`.
- Trong dự án này, flow mặc định để build “công ty” là:

```text
/eup-context
/eup-market-cycle
/eup-dev-intake
[USER CONFIRM]
/eup-implement
```
