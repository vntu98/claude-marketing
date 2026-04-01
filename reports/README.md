# Reports

Store non-implementation research and analysis outputs here.

## Research Reports

Every research run must create a new folder under:

```text
reports/research/YYYYMMDD-[slug]/
```

Minimum required files:

- `research-summary.md`
- `customer-signals.md`
- `quote-bank.md`
- `sources.md`
- `competitor-landscape.md` when the brief includes market scans, positioning, strategy, or competitor work
- `ga4-insights.md` when GA4 analysis or measurement findings are part of the market cycle
- `channel-scorecard.md` when channel-level signal, acquisition, or media analysis is in scope

Rule:

- If a report is saved anywhere under `reports/**`, the written analysis should be in Vietnamese
- Verbatim quotes, raw source labels, event names, and product names may stay in the original language when needed

These files are intentionally exempt from the implementation approval gate so the marketing team can research and document findings before engineering planning starts.

## Strategy Memos

When research needs to hand off into PM or planning, save the synthesis package under:

```text
reports/strategy/YYYYMMDD-[slug]/strategy-memo.md
```

Minimum required sections:

- `Đối Tượng Ưu Tiên (Target Audience)`
- `Định Vị (Positioning)`
- `Ưu Tiên Kênh (Channel Priorities)`
- `Thí Nghiệm Ưu Tiên (Priority Experiments)`
- `Ghi Chú Đo Lường (Measurement Notes)`
- `Yêu Cầu Cho Dev (Concrete Dev Asks)`
- `Gói Bàn Giao PM (PM Intake Packet)`
- `Bàn Giao Vai Trò (Role Handoffs)`

`/eup-pm` should treat this saved memo as a hard prerequisite, not an optional artifact.

## Dev Intake Packets

When PM intake should become a durable artifact for planning or implementation orchestration, save:

```text
reports/strategy/YYYYMMDD-[slug]/dev-intake.md
```

Minimum required sections:

- `Business Objective`
- `Approved Strategy Source`
- `Priority Workstreams`
- `Scoped Dev Asks`
- `Dependencies And Risks`
- `Suggested Ownership`
- `Tracking And Validation Needs`

`/eup-dev-intake` should write this packet before `implementation-planner` creates `task-graph.json` and `ownership-matrix.md`.
