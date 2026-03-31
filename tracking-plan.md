# GA4 Tracking Plan

Last updated: 2026-03-31

## Overview

- Property: `GA4_PROPERTY_ID` from `.env`
- Data stream: web by default, with app events mirrored or mapped when mobile analytics is available
- Primary business goal: acquire qualified learners, activate them into meaningful study, and convert the right segments into premium subscribers
- Primary conversion: `signup_completed`
- Secondary conversion: `subscription_started`
- Supporting conversions: `placement_test_completed`, `lesson_completed`, `affiliate_signup_completed`, `lead_magnet_downloaded`

## Measurement Questions

1. Which channels and campaigns drive the highest-quality learner signups?
2. Which landing pages and content assets convert visitors into signup starts and completed signups?
3. Where do learners drop between signup, placement, first lesson, paywall, and subscription?
4. Which languages, intents, or acquisition paths lead to the strongest activation rate?
5. Which content or social campaigns influence high-value actions such as lesson completion and subscription start?

## Funnel

| Stage | Event | Success Signal | Owner |
|------|-------|----------------|-------|
| Discover | `page_view` | User lands on a key acquisition page | Marketing |
| Engage | `cta_clicked` | User clicks a major CTA | Marketing |
| Start Signup | `signup_started` | User begins registration | Marketing / Product |
| Signup | `signup_completed` | User completes account creation | Product |
| Placement | `placement_test_completed` | User finishes routing or level-setting step | Product |
| First Value | `lesson_started` | User begins a meaningful lesson or exercise | Product |
| Activation | `lesson_completed` | User completes first meaningful learning session | Product / Growth |
| Monetization Intent | `paywall_viewed` | User reaches an upgrade surface | Growth |
| Monetization | `subscription_started` | User starts paid subscription | Growth / Product |

## Conversion Events To Mark In GA4 Admin

- `signup_completed`
- `lesson_completed`
- `subscription_started`
- `affiliate_signup_completed`

## Event Catalog

| Event | Category | Trigger | Required Params | Notes |
|------|----------|---------|-----------------|-------|
| `cta_clicked` | Acquisition | Any high-intent CTA click | `cta_label`, `cta_location`, `page_type` | Use for hero, sticky, lesson, and pricing CTAs |
| `signup_started` | Acquisition | First interaction with signup flow | `signup_method`, `entry_point`, `language_interest` | Fire once per attempt |
| `signup_completed` | Acquisition | Account creation succeeds | `signup_method`, `entry_point`, `language_interest` | Primary conversion |
| `placement_test_started` | Activation | User starts placement or assessment | `language`, `entry_point` | Useful for onboarding diagnostics |
| `placement_test_completed` | Activation | Placement or level routing finishes | `language`, `assigned_level` | Helps diagnose activation quality |
| `lesson_started` | Activation | User starts first meaningful lesson | `language`, `lesson_type`, `entry_point` | Exclude trivial page opens |
| `lesson_completed` | Activation | User completes lesson or core exercise | `language`, `lesson_type`, `difficulty_level` | Activation milestone |
| `streak_updated` | Retention | Streak state changes meaningfully | `streak_length`, `language` | Optional if streaks are core product behavior |
| `paywall_viewed` | Monetization | User sees upgrade surface | `offer_name`, `placement`, `language` | Tracks monetization pressure and targeting |
| `subscription_started` | Monetization | User completes paid upgrade | `plan_name`, `billing_period`, `language` | Secondary conversion |
| `affiliate_signup_completed` | Partnership | Affiliate registration succeeds | `entry_point`, `source_channel` | Tracks partner growth |
| `lead_magnet_downloaded` | Content | User downloads a gated asset | `asset_name`, `language`, `placement` | Useful for owned-channel growth |

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
| `learner-journey-funnel` | Drop-off from signup to activation and subscription | Daily |
| `content-engagement` | Which content and landing assets drive intent | Weekly |
| `event-breakdown` | Volume by event | Weekly |
| `realtime-overview` | Live validation after launches | On demand |

## Validation Checklist

- [ ] Enhanced Measurement enabled only where it does not duplicate custom events
- [ ] DebugView shows `signup_completed`, `lesson_completed`, and `subscription_started`
- [ ] Conversion events marked in Admin
- [ ] No PII in event params
- [ ] UTM values normalized to lowercase
- [ ] Language and learner-segment dimensions are applied consistently
- [ ] `learner-journey-funnel` preset returns expected event counts

## Example gtag / GTM Payloads

```javascript
gtag('event', 'signup_completed', {
  signup_method: 'email',
  entry_point: 'hero',
  language_interest: 'ja',
});

gtag('event', 'lesson_completed', {
  language: 'ja',
  lesson_type: 'vocabulary',
  difficulty_level: 'n5',
});

gtag('event', 'subscription_started', {
  plan_name: 'premium_yearly',
  billing_period: 'yearly',
  language: 'ja',
});
```

## Next Implementation Tasks

1. Add a shared analytics helper in the web app or GTM data layer.
2. Fire required events on signup, placement, lesson, paywall, and subscription milestones.
3. Mark the four conversion events in GA4 Admin.
4. Run the presets from `.claude/skills/eup-analytics/references/ga4-report-presets.md`.
