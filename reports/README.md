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
