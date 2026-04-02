# GA4 Tracking Plan

Last updated: 2026-03-31

## Overview

- Property: `GA4_PROPERTY_ID` from `.env`
- Data stream: app-first measurement for the mobile product, with web surfaces treated as supporting acquisition context
- Primary business goal: measure whether learners watch real content, engage with vocabulary support, and use practice tabs deeply enough to justify monetization
- Primary conversion: `app_store_subscription_convert`
- Secondary conversion: `in_app_purchase`
- Supporting conversions: `app_store_subscription_renew`, `activity_word_save`, `activity_practice_complete`

## Measurement Questions

1. How many users actually watch learning content, and how many move from watching to word interaction?
2. Which tabs are being used for practice after the watch event?
3. Which tab experiences lead to completion rather than just entry?
4. Which acquisition sources bring users who watch, save words, and practice?
5. Which practice behaviors correlate with purchase and renewal signals?

## Funnel

| Stage | Event | Success Signal | Owner |
|------|-------|----------------|-------|
| Watch | `activity_video_watch` | User watches a real learning video | Product |
| Understand | `activity_word_define` | User opens a dictionary/definition interaction | Product |
| Save | `activity_word_save` | User saves a word for later review | Product |
| Practice Entry | `activity_video_tab_*_start` or `*_view` | User enters a practice tab after watching | Product / Growth |
| Practice Completion | `activity_video_tab_*_complete` | User finishes a tab-level practice experience | Product / Growth |
| Monetization | `in_app_purchase` / `app_store_subscription_convert` | User pays after extracting value from watch + practice | Growth / Product |

## Conversion Events To Mark In GA4 Admin

- `app_store_subscription_convert`
- `in_app_purchase`
- `app_store_subscription_renew`

## Event Catalog

| Event | Category | Trigger | Required Params | Notes |
|------|----------|---------|-----------------|-------|
| `activity_video_watch` | Watch | User watches a learning video | `video_id`, `source_type`, `language_pair` | Entry point for the content loop |
| `activity_word_define` | Understand | User opens a word definition or lookup | `word`, `video_id`, `language_pair` | Measures comprehension intent |
| `activity_word_save` | Save | User saves a word from a video | `word`, `video_id`, `language_pair` | Strong activation signal |
| `activity_video_tab_notes_view` | Practice Tab | User opens Notes tab | `video_id`, `tab_name` | Lightweight tab engagement |
| `activity_video_tab_vocab_view` | Practice Tab | User opens Vocabulary tab | `video_id`, `tab_name` | Lightweight tab engagement |
| `activity_video_tab_speaking_start` | Practice Tab | User starts Speaking tab | `video_id`, `tab_name` | Start event for speaking practice |
| `activity_video_tab_speaking_complete` | Practice Tab | User completes Speaking tab | `video_id`, `tab_name` | Completion signal |
| `activity_video_tab_listening_start` | Practice Tab | User starts Listening tab | `video_id`, `tab_name` | Start event for listening practice |
| `activity_video_tab_listening_complete` | Practice Tab | User completes Listening tab | `video_id`, `tab_name` | Completion signal |
| `activity_video_tab_quiz_start` | Practice Tab | User starts Quiz tab | `video_id`, `tab_name` | Start event for quiz practice |
| `activity_video_tab_quiz_complete` | Practice Tab | User completes Quiz tab | `video_id`, `tab_name` | Completion signal |
| `activity_video_tab_saved_review_complete` | Practice Tab | User completes saved review tab flow | `video_id`, `tab_name` | Completion-only event |
| `activity_video_tab_matching_complete` | Practice Tab | User completes matching tab flow | `video_id`, `tab_name` | Completion-only event |
| `activity_video_tab_ai_talk_start` | Practice Tab | User starts AI Talk tab | `video_id`, `tab_name` | Start event for AI conversation tab |
| `activity_video_tab_ai_talk_complete` | Practice Tab | User completes AI Talk tab | `video_id`, `tab_name` | Completion signal |
| `activity_practice_start` | Cross-Tab Practice | User starts a generic practice flow | `practice_type`, `video_id` | Optional aggregate practice marker |
| `activity_practice_complete` | Cross-Tab Practice | User completes a generic practice flow | `practice_type`, `video_id` | Optional aggregate completion marker |
| `activity_srs_review` | Retention | User reviews SRS content | `review_type`, `deck_size` | Retention and habit-loop signal |
| `in_app_purchase` | Monetization | User completes an in-app purchase | `product_id`, `billing_period` | Primary purchase event |
| `app_store_subscription_convert` | Monetization | User converts to paid subscription | `plan_name`, `billing_period` | Primary subscription conversion |
| `app_store_subscription_renew` | Monetization | Subscription renews | `plan_name`, `billing_period` | Revenue retention signal |

## Event Parameter Standards

### Global parameters

- `page_type`: `homepage`, `language_landing`, `exam_landing`, `blog_post`, `pricing`, `dictionary`, `lesson`, `paywall`
- `entry_point`: `hero`, `nav`, `footer`, `inline`, `popup`, `email`, `social`, `lesson_gate`
- `language`: ISO code or approved internal label such as `ja`, `zh`, `en`, `ko`, `de`
- `campaign_stage`: `awareness`, `consideration`, `activation`, `retention`, `monetization`
- `learner_segment`: `exam_prep`, `casual`, `career`, `travel`, `dictionary_first`

### Do not send

- Email addresses
- Full names
- Phone numbers
- Free-text fields that may contain personal data

## Content Grouping

Use these page or surface groupings in GTM or app code:

- `company-home`
- `language-landings`
- `exam-prep`
- `dictionary-and-lookup`
- `lesson-library`
- `onboarding-and-placement`
- `pricing-and-paywall`
- `affiliate-and-partners`

## UTM Convention

| Parameter | Format | Example |
|------|--------|---------|
| `utm_source` | lowercase source | `facebook` |
| `utm_medium` | lowercase channel | `social` |
| `utm_campaign` | objective + language + asset | `jlpt_n5_signup_q2` |
| `utm_content` | creative or placement | `hero_video_v1` |
| `utm_term` | keyword or audience if relevant | `japanese_study_app` |

## Report Presets Mapping

| Preset | Purpose | Recommended cadence |
|------|---------|---------------------|
| `acquisition-overview` | Channel and campaign quality | Daily |
| `landing-page-performance` | Which pages convert | Daily |
| `watch-core-actions` | Watch → define → save progression | Daily |
| `learner-journey-funnel` | Watch-to-practice progression and per-tab completion | Daily |
| `tab-entry-overview` | Which tabs users enter after watching | Daily |
| `tab-completion-overview` | Which tabs users actually complete | Daily |
| `practice-depth-overview` | Cross-tab practice and SRS depth | Daily |
| `content-engagement` | Which content and landing assets drive intent | Weekly |
| `event-breakdown` | Volume by event | Weekly |
| `realtime-overview` | Live validation after launches | On demand |

For the core watch-and-tabs snapshot, run:

```bash
node tools/ga4-watch-tabs.js --property "$GA4_PROPERTY_ID"
```

## Validation Checklist

- [ ] Enhanced Measurement enabled only where it does not duplicate custom events
- [ ] DebugView shows `activity_video_watch`, `activity_word_save`, and at least one tab start/completion event
- [ ] Conversion events marked in Admin
- [ ] No PII in event params
- [ ] UTM values normalized to lowercase
- [ ] `video_id`, `tab_name`, and `language_pair` are applied consistently where relevant
- [ ] `watch-core-actions`, `tab-entry-overview`, and `tab-completion-overview` all return non-empty data
- [ ] `learner-journey-funnel` preset returns expected event counts

## Example gtag / GTM Payloads

```javascript
gtag('event', 'activity_video_watch', {
  video_id: 'abc123',
  source_type: 'youtube',
  language_pair: 'en-vi',
});

gtag('event', 'activity_video_tab_speaking_complete', {
  video_id: 'abc123',
  tab_name: 'speaking',
});

gtag('event', 'app_store_subscription_convert', {
  plan_name: 'premium_monthly',
  billing_period: 'yearly',
});
```

## Next Implementation Tasks

1. Add a shared analytics helper in the app for watch, dictionary, save, and tab practice events.
2. Ensure each practice tab emits either a start/completion pair or a completion event at minimum.
3. Mark purchase and subscription events as conversions in GA4 Admin.
4. Run `watch-core-actions`, `tab-entry-overview`, `tab-completion-overview`, and `practice-depth-overview` after each analytics release.
