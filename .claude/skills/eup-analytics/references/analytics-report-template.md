# GA4 Analysis

## Scope
- Data source files or live commands used
- Date range
- GA4 property or stream context
- Confidence or known caveats

## KPI Snapshot
- Top-level metrics with plain-English implication
- Call out which headline metrics are trustworthy versus contaminated by measurement issues

## Watch And Practice Funnel
- Watch -> define -> save progression
- Practice-tab entry versus completion
- Practice depth / SRS depth
- Name the denominator for each ratio and whether it uses users or events

## Acquisition Quality
- Best and worst sources or campaigns
- Attribution anomalies such as `(not set)`
- Do not over-rank channels if the `conversions` metric is polluted

## Conversion Quality
- Compare `conversions.json` to `tracking-plan.md`
- Classify each marked conversion as primary signal, supporting signal, or noise
- Call out duplicate or suspicious conversion events

## Key Findings
1. Measurement integrity findings
2. Product funnel findings
3. Growth or channel findings

## Recommended Actions
1. P0 data-quality or GA4 Admin fixes
2. P1 instrumentation fixes
3. P1/P2 product or growth experiments

## Instrumentation Gaps
- Missing start or completion events
- Event-name mismatches versus `tracking-plan.md`
- Missing attribution context
- Any event that prevents confident funnel interpretation
