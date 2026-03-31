# GA4 Report Presets

Use these presets with `node tools/ga4.js presets run --preset <name> --property "$GA4_PROPERTY_ID"`.

## Available Presets

| Preset | Type | What it answers |
|--------|------|-----------------|
| `acquisition-overview` | report | Which sources, mediums, and campaigns are driving sessions, users, and conversions |
| `landing-page-performance` | report | Which landing pages convert by source and medium |
| `learner-journey-funnel` | report | How learners move from signup into activation and subscription |
| `content-engagement` | report | Which pages, lessons, and proof assets keep users engaged |
| `event-breakdown` | report | Whether event instrumentation is firing and which events dominate volume |
| `realtime-overview` | realtime | Who is active right now by country and device |

## Quick Mapping

- Acquisition question -> `acquisition-overview`
- Landing page or campaign QA -> `landing-page-performance`
- Funnel leak analysis -> `learner-journey-funnel`
- Content or proof performance -> `content-engagement`
- Event audit -> `event-breakdown`
- Live verification after a launch -> `realtime-overview`

## Operating Rules

- Start with a preset before building custom dimensions and metrics.
- Keep date ranges explicit when comparing launches, experiments, or channel swings.
- If the preset output does not answer the business question, note the instrumentation gap instead of guessing.
