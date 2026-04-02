# GA4 Insights — Live App Analytics
**Date:** 2026-04-02
**Product:** Bilingual video / learning-through-content app (eUp portfolio)
**GA4 Property:** 517672135 (timezone Etc/GMT-7)
**Data window:** 30 days ago → today (approx. 2026-03-03 – 2026-04-02)
**Data sources:** `reports/analytics/20260402-ga4/` snapshot: acquisition-overview.json, conversions.json, event-breakdown.json, watch-tabs.json, realtime-overview.json

> NOTE: The previous version of this file was a pre-launch measurement framework written before live credentials were available. This version supersedes it with live GA4 evidence. The tracking taxonomy and UTM guidance from the prior version remain valid planning references.

---

## KPI Snapshot

| Metric | 30-day value | Implication |
|--------|--------------|-------------|
| Total sessions | ~7,301 | Modest but real volume; app is live and active |
| Active users | ~4,644 | Reasonable retention pool given session count |
| `first_open` (new installs) | 2,590 | Healthy install flow; ~35% of active user base is new |
| `app_remove` | 508 events / 490 users | ~20% of new installs churn before forming a habit |
| `activity_video_watch` | 9,995 events / 1,719 users | Core content engagement is healthy; 37% of active users watch video |
| `activity_word_define` | 91,330 events / 824 users | Dictionary lookup is the highest-volume action; small but highly active user cohort |
| `activity_word_save` | 1,186 events / 134 users | Word save (activation signal) reached by only 7.8% of watchers — critical leakage |
| `in_app_purchase` | 13 events / 13 users | Purchase volume is critically low |
| `app_store_subscription_renew` | 92 events / 7 users | Existing subscribers renewing but base is tiny |
| `app_store_subscription_convert` | 0 events in window | Primary conversion event is silent — not firing or naming mismatch |

Engagement rate across paid and organic channels is 78–87%, which is strong. The problem is depth: users engage in sessions but very few reach the word-save or purchase conversion steps.

---

## Watch and Practice Funnel (Live)

### Watch → Define → Save

```
activity_video_watch    9,995 events / 1,719 users   [100% baseline]
activity_word_define   91,330 events /   824 users   [48% of watchers]
activity_word_save      1,186 events /   134 users   [7.8% of watchers]
```

The define step is high-frequency (avg 111 defines per defining user), confirming users are actively looking up words. The collapse at word_save — from 824 defining users to 134 saving users — is the most actionable funnel gap. Only 16% of users who define words also save them.

### Tab Entry After Watching

| Tab | Starts | Users | Entry rate vs. watchers |
|-----|--------|-------|------------------------|
| `activity_video_tab_notes_view` | 4,085 | 175 | 10% |
| `activity_video_tab_speaking_start` | 678 | 209 | 12% |
| `activity_video_tab_vocab_view` | 430 | 176 | 10% |
| `activity_video_tab_quiz_start` | 148 | 56 | 3% |
| `activity_video_tab_listening_start` | 64 | 2 | <1% |
| `activity_video_tab_ai_talk_start` | 3 | 1 | <0.1% |

Tab entry rate from watchers is ~12% at best. Notes is the most-viewed tab by event volume but captures only 175 users — likely the same engaged core using it repeatedly.

### Tab Completion Rates

| Tab | Starts | Completions | Completion rate |
|-----|--------|-------------|-----------------|
| Quiz | 148 | 31 | 21% |
| Speaking | 678 | 17 | **2.5%** — critical friction |
| Saved Review | 22 | 5 | 23% |
| Matching | no start event | 59 | unmeasurable |

Speaking is the most-entered active tab but has a 2.5% completion rate. This is likely a length or difficulty friction problem, not an interest problem (users start it willingly).

### Practice Depth / SRS

| Event | Count | Users |
|-------|-------|-------|
| `activity_practice_start` | 998 | 498 |
| `activity_practice_complete` | 398 | 176 |
| `activity_srs_review` | 415 | 99 |
| `activity_srs_flashcard` | 89 | 50 |
| `activity_srs_quiz` | 64 | 24 |

Practice start-to-complete: 40% (acceptable). SRS engagement is thin — only 99 users are entering spaced-repetition review. This is the habit-formation engine and it is reaching a small fraction of the active base.

---

## Acquisition Quality

| Source / Medium | Sessions | Active Users | New Users | Engagement Rate | Signal quality |
|-----------------|----------|--------------|-----------|-----------------|----------------|
| (direct) / (none) | 3,759 | 1,207 | 1,096 | 83.4% | Unattributed; likely includes organic re-engagement |
| google / cpc / VN_4U_AND_Phuongttt_20.03 | 2,452 | 1,159 | 1,132 | 84.8% | Active Android UAC campaign; high new-user share |
| google-play / organic | 771 | 240 | 211 | 78.6% | Strong — store organic is efficient with zero paid |
| **(not set)** / **(not set)** | 153 | **1,160** | 111 | **0%** | DATA QUALITY ALERT — see below |
| google / cpc / VN_4U_IOS_Phuongttt_30.03 | 80 | 41 | 37 | 80% | iOS UAC; too early to evaluate (launched 2026-03-30) |

**Data quality alert — `(not set)` row:** 1,160 active users attributed to a source with 0% engagement rate and only 153 sessions. This indicates a large pool of app users whose sessions are not being attributed — likely push notification re-engagements, deeplinks, or a misconfigured app stream sending events without session context. This row is inflating active-user totals and masking real channel performance.

Both paid campaigns carry `VN_` prefix in campaign names, confirming Vietnam is the primary market. Campaign naming convention is partially readable but would benefit from standardized format: `{country}_{platform}_{objective}_{date}`.

---

## Conversion Quality

### Conversion Events Review

| Event | Marked as conversion | Appropriate | Action |
|-------|----------------------|-------------|--------|
| `app_store_subscription_convert` | Yes | Yes — primary | Validate it is firing (0 events in 30 days is a bug) |
| `app_store_subscription_renew` | Yes | Yes — revenue retention | Keep |
| `in_app_purchase` | Yes | Yes | Keep; verify no double-count with above |
| `first_open` | Yes | Marginal — install proxy only | Keep if install tracking is needed, but exclude from channel ROI comparison |
| `session_start` | Yes | **No** — inflates all channel conversion counts | Remove immediately |
| `activity_video_tab_switch` | Yes | **No** — navigation event, not conversion | Remove immediately |
| `add_to_cart`, `add_to_wishlist`, `begin_checkout`, `view_item`, `view_item_list`, `view_search_results` | Yes | **No** — e-commerce events inapplicable to this product | Remove all six immediately |

The acquisition report showing 5,547 conversions from both direct and Google Android UAC is almost certainly dominated by `session_start` conversions. This makes all channel conversion comparisons meaningless until noise events are removed. Estimated real purchase-level conversions from this window: 13 (`in_app_purchase`) + unknown `app_store_subscription_convert` (currently 0 due to likely bug).

---

## Key Findings

1. **Conversion tracking is broken by noise.** At least 7 of 13 marked conversions are inapplicable or system events. `session_start` alone inflates every channel's conversion count by thousands. Real monetization signals (13 purchases, 0 subscription converts) are invisible. Fix is immediate and zero-cost.

2. **Watch → save funnel leaks severely.** Only 7.8% of video watchers save a word. `activity_word_save` is a designated activation signal; at 134 users it is far too thin to build retention or upsell analysis on. The define → save step has no in-product prompt visible in the data.

3. **Speaking tab is a churn driver at current friction levels.** 2.5% start-to-complete rate (678 starts, 17 completions) means the most-entered active practice tab is abandoning 97.5% of users. If speaking is intended as a premium or differentiating feature, it needs friction reduction before it can serve as a paywall justifier.

4. **`app_store_subscription_convert` is silent.** This is the primary conversion event in the tracking plan and has fired 0 times in 30 days despite being registered since 2025-12-27. Either the event name is mismatched in the app, the IAP flow is not triggering it, or server-side billing events are not routed to GA4.

5. **`(not set)` attribution gap masks 1,160 active users.** These users are generating zero engagement rate in GA4 and no campaign attribution. Push notification and deeplink sessions appear to be arriving without attribution parameters. Fixing this would meaningfully change the active-user denominator for channel analysis.

6. **AI Talk and Listening tab have near-zero adoption.** AI Talk: 3 starts, 1 user. Listening tab: 64 starts, 2 users. If these are premium differentiators or upsell hooks, their current reach is too small to measure ROI or justify prioritization in marketing messaging.

---

## Recommended Actions

### Immediate (0–7 days)

1. **Remove 7 non-applicable conversion events from GA4 Admin.** Delete: `add_to_cart`, `add_to_wishlist`, `begin_checkout`, `view_item`, `view_item_list`, `view_search_results`, `session_start`, `activity_video_tab_switch`. This unblocks all channel ROI analysis.

2. **Debug `app_store_subscription_convert`.** Check app code, GA4 DebugView, and billing provider webhook — this event is the primary revenue signal and it has been silent for at least 30 days.

3. **Add UTM parameters to all push notification links.** The `(not set)` row representing 1,160 users is almost certainly push-notification or deeplink traffic without proper attribution. Add `utm_source`, `utm_medium`, `utm_campaign` to all notification CTAs via Firebase Dynamic Links.

### Near-term (7–30 days)

4. **Add a save-word prompt immediately post-define.** A post-define CTA targeting users who define 3+ words in a session could lift `activity_word_save` significantly. Currently the define → save conversion is only 16%; even a small lift compounds into retention improvement.

5. **Instrument Notes tab with a completion or dwell-time event.** `activity_video_tab_notes_view` is the highest-frequency tab (4,085 events) but has zero actionable exit signal. Add `activity_video_tab_notes_complete` or a scroll-depth event.

6. **Add a speaking-abandon event to diagnose dropout.** `activity_video_tab_speaking_start` → `activity_video_tab_speaking_complete` is 2.5%. An abandon event with a `step_name` parameter would pinpoint where users exit — too long, mic permission failure, or difficulty.

### Strategic (30–90 days)

7. **Optimize SRS discovery.** Only 99 users reached `activity_srs_review` in 30 days. If spaced-repetition is a retention and habit-formation mechanic, its current discoverability within the product is likely failing. Surface the SRS queue via home-screen prompts or post-video CTAs.

8. **Validate onboarding funnel completion.** Events `activity_onboarding_objective_continue` (777), `activity_onboarding_level_continue` (759), `activity_onboarding_topics_continue` (746) are present. However, there is no `onboarding_completed` or `placement_test_completed` event in the data — the tracking plan's primary activation KPI checkpoint is missing.

---

## Instrumentation Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| `app_store_subscription_convert` fires 0 times | Cannot measure primary conversion event | P0 — fix now |
| `placement_test_completed` / `lesson_completed` absent | Primary activation KPIs from eup-context hierarchy unmeasured | P0 |
| `onboarding_completed` absent | Cannot close onboarding funnel even though step events exist | P0 |
| `activity_video_tab_notes_view` has no completion signal | Most-used tab generates zero funnel data | P1 |
| `activity_video_tab_listening_complete` absent | Listening tab started 64 times; no exit signal | P1 |
| `activity_video_tab_speaking_abandon` absent | Cannot diagnose 97.5% speaking dropout | P1 |
| Push/deeplink UTM attribution absent | 1,160 active users unattributed; channel ROI analysis is incomplete | P1 |
| `activity_ai_conversation_session_complet` — possible name truncation | Event name appears truncated; GA4 event name limit is 40 chars | P2 — verify |
| `activity_video_tab_ai_talk_complete` naming mismatch | Event in data is `activity_ai_conversation_session_complet`, tracking plan says `activity_video_tab_ai_talk_complete` | P2 |

---

## Unresolved Questions

1. Is `app_store_subscription_convert` a client-side event that was supposed to fire post-payment, or is it only emitted from App Store server notifications not currently routed to GA4?
2. What does the onboarding sequence end with? `activity_onboarding_topics_continue` fires 746 times but there is no terminal event — is `onboarding_completed` implemented?
3. Are `first_open` events from UAC campaigns being deduplicated against google-play organic installs? Platform overlap on Android is probable.
4. Is the `(direct)` campaign label on google-play organic sessions a GA4 reporting artifact or a data model issue in the app?
5. Is the product currently one app or multiple? The event taxonomy suggests a single app with video + dictionary surfaces, but the acquisition data references both Android and iOS UAC campaigns with different launch dates.
