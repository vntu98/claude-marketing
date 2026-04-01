# Ke Hoach Trien Khai: Ung Dung Hoc Tieng Anh Qua Video Phu De Song Ngu

**Ngay:** 2026-04-01
**Tac gia:** implementation-planner
**Du an viet tat:** bilingual-video-english
**Phien ban:** 1.0

**Approval Status: pending**

---

## Muc Luc

1. [Tom Tat Dieu Hanh](#1-tom-tat-dieu-hanh)
2. [Kien Truc Ky Thuat](#2-kien-truc-ky-thuat)
3. [Phase 0 — Foundation](#3-phase-0--foundation-tuan-1-4)
4. [Phase 1 — Core App](#4-phase-1--core-app-tuan-5-12)
5. [Phase 2 — Growth](#5-phase-2--growth-tuan-14-20)
6. [Rui Ro Va Rollback](#6-rui-ro-va-rollback)
7. [Chien Luoc Test](#7-chien-luoc-test)
8. [Timeline Tong Quan](#8-timeline-tong-quan)
9. [Cross-Plan Considerations](#9-cross-plan-considerations)

---

## 1. Tom Tat Dieu Hanh

### Boi canh

eUp can xay dung app mobile-first (iOS + Android) cho nguoi hoc tieng Anh 18-35 tuoi tai Viet Nam. San pham cho phep xem video that voi phu de song ngu Anh-Viet chinh xac, luu tu kem ngu canh video, va on tap bang clip goc — tat ca tren dien thoai.

### Pham vi

- **8 DEV asks** (DEV-01 den DEV-08) tu strategy-memo.md
- **3 phases**: Foundation (P0) → Core App (P1) → Growth (P2)
- **Greenfield** — khong co codebase hien tai
- **Stack**: Flutter (mobile) + Node.js/Express (backend) + PostgreSQL (database)
- **AI/ML**: youtube_explode_dart (caption extraction) + Whisper API fallback + Google Cloud Translation (EN-VI)
- **Review**: Drift/SQLite (local) + FSRS (SRS algorithm)
- **Billing**: RevenueCat (subscription management)

### Menh de thanh cong

| Chi so | Target |
|--------|--------|
| D7 Retention | >20% |
| D30 Retention | >12% |
| Install → Trial | >8% |
| Trial → Paid | >30% |
| AI subtitle accuracy | >=95% tren 100 video test |

### Doi ky su can thiet

| Vai tro | So luong | Trach nhiem chinh |
|---------|---------|-------------------|
| backend-engineer | 1 | API server, AI subtitle pipeline, SRS service, subscription service, deep link service |
| mobile-engineer | 1 | Flutter app, video player, subtitle rendering, onboarding, review UI, pricing UI |
| database-engineer | 1 | PostgreSQL schema (server), Drift/SQLite schema (local), migrations |

### Quyet dinh ky thuat da duoc phe duyet

Tu technical-brainstorm.md:

1. **AI Subtitle**: YouTube caption extraction + Whisper API fallback (khong phai self-hosted)
2. **Translation**: Google Cloud Translation API + post-processing rules + caching
3. **Subtitle Modes**: Native Flutter widget overlay (Stack + BackdropFilter + animations)
4. **Video Player**: youtube_explode_dart + native player (AVPlayer/ExoPlayer) + Flutter overlay
5. **Review Storage**: Drift/SQLite local + ffmpeg_kit_flutter (audio clip extraction) + FSRS
6. **Framework**: Flutter (eUp da co expertise)

---

## 2. Kien Truc Ky Thuat

```
┌─────────────────────────────────────────────────┐
│                    Flutter App                    │
├─────────────┬───────────────┬───────────────────┤
│ Video Layer │ Subtitle Layer│ Review Layer      │
│ video_player│ Flutter Widgets│ FSRS engine      │
│ (AVPlayer/  │ (Stack +      │ (pure Dart)      │
│  ExoPlayer) │  BackdropFilter│                  │
│             │  + animations)│ Drift/SQLite DB   │
├─────────────┴───────────────┴───────────────────┤
│              Video Source Abstraction             │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ youtube_explode   │  │ Direct URL / Upload  │ │
│  │ (caption + stream)│  │ (fallback + hedge)   │ │
│  └──────────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────────┤
│              Backend API (Node.js/Express)        │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐ │
│  │ Whisper API│ │ Google   │ │ Firebase      │ │
│  │ (fallback  │ │ Translate│ │ (GA4, FCM,    │ │
│  │  transcribe│ │ EN→VI   │ │  Auth)        │ │
│  │  only)     │ │          │ │               │ │
│  └────────────┘ └──────────┘ └───────────────┘ │
├─────────────────────────────────────────────────┤
│  RevenueCat (billing) │ ffmpeg_kit (audio clip) │
│  PostgreSQL (server)  │ Drift/SQLite (local)    │
└─────────────────────────────────────────────────┘
```

---

## 3. Phase 0 — Foundation (Tuan 1-4)

### Muc tieu

Xay dung 2 blockers song song: tracking infrastructure (DEV-01) va AI subtitle engine (DEV-02). Khong co 2 thu nay thi khong launch va khong do duoc.

### Milestone

- **Tuan 2**: 8 GA4 events P1 firing trong DebugView; Whisper API + caption extraction prototype chay duoc tren 10 video test
- **Tuan 4**: Funnel visualization hoat dong; AI subtitle accuracy >=95% tren 100 video test voi human QA sign-off

### Gate sang Phase 1

- [ ] DEV-01: 8 events P1 visible trong GA4 DebugView voi dung parameters
- [ ] DEV-02: Accuracy >=95% tren 100 video test (mix co/khong subtitle goc, co/khong AutoDub)
- [ ] DEV-02: >=5 nguoi dung Viet danh gia EN-VI translation "tot" hoac "rat tot"
- [ ] Database schema (server + local) da duoc review va approved

### Tasks Phase 0

| Task ID | Dev Ask | Mo ta | Owner | Dependencies | Effort |
|---------|---------|-------|-------|-------------|--------|
| T-001 | DEV-01 | Setup Firebase SDK + GA4 property connection | mobile-engineer | GA4 credentials | S |
| T-002 | DEV-01 | Implement 8 GA4 events P1 + 5 conversion events | mobile-engineer | T-001 | M |
| T-003 | DEV-01 | iOS ATT handling + server-side event fallback | backend-engineer | T-001 | M |
| T-004 | DEV-01 | Funnel visualization setup + DebugView validation | mobile-engineer | T-002 | S |
| T-005 | DEV-02 | YouTube caption extraction service (youtube_explode_dart) | backend-engineer | Khong | M |
| T-006 | DEV-02 | AutoDub detection + Whisper API fallback pipeline | backend-engineer | T-005 | L |
| T-007 | DEV-02 | Google Cloud Translation EN-VI integration + caching | backend-engineer | T-005 | M |
| T-008 | DEV-02 | 100-video accuracy test + human QA coordination | backend-engineer | T-006, T-007 | M |
| T-009 | — | PostgreSQL server schema design (users, videos, subtitles, translations) | database-engineer | Khong | M |
| T-010 | — | Drift/SQLite local schema design (words, contexts, review_cards, preferences) | database-engineer | Khong | M |
| T-011 | — | Backend API project scaffolding (Node.js/Express + PostgreSQL) | backend-engineer | Khong | S |
| T-012 | — | Flutter app project scaffolding + CI/CD pipeline | mobile-engineer | Khong | S |

### Rui ro Phase 0

| Rui ro | Xac suat | Tac dong | Phuong an |
|--------|----------|---------|-----------|
| AI subtitle accuracy <95% | Trung binh | Launch delay hoac pivot | Test som tuan 1-2 voi 20 video; neu <90%, escalate ngay. Co the thu gpt-4o-mini-transcribe hoac AssemblyAI Universal-3 |
| GA4 credentials chua duoc cau hinh | Cao | DEV-01 bi block | Escalate cho DevOps/GA4 Admin truoc tuan 1 |
| YouTube thay doi caption extraction endpoints | Thap | Caption extraction bi break | youtube_explode_dart co active maintenance; YouTube Data API captions.list la secondary path |

---

## 4. Phase 1 — Core App (Tuan 5-12)

### Muc tieu

Ship app core voi: video player + dual subtitle + tap-to-translate + word save + review loop + progressive subtitle modes + delay signup + billing transparency.

### Milestone

- **Tuan 7**: Video player + dual subtitle + tap-to-translate hoat dong tren iOS + Android
- **Tuan 9**: Review loop voi video clip + SRS hoat dong; delay signup flow hoan tat
- **Tuan 11**: Progressive subtitle 4 modes + billing/pricing hoan tat
- **Tuan 12**: Integration testing + QA toan bo Phase 1

### Gate sang Phase 2

- [ ] Tat ca 4 DEV asks P1 (DEV-03, DEV-04, DEV-05, DEV-08) da pass acceptance criteria
- [ ] D7 Retention baseline do duoc (tracking day du)
- [ ] EXP-01/EXP-02/EXP-03 co the chay (events P1 san sang)
- [ ] App Store / Play Store submission san sang

### Tasks Phase 1

| Task ID | Dev Ask | Mo ta | Owner | Dependencies | Effort |
|---------|---------|-------|-------|-------------|--------|
| T-013 | DEV-03 | Video source abstraction layer (YouTube + direct URL interface) | mobile-engineer | T-005 (subtitle engine) | M |
| T-014 | DEV-03 | Video player integration (video_player + AVPlayer/ExoPlayer) | mobile-engineer | T-013 | M |
| T-015 | DEV-03 | Dual subtitle rendering (EN + VI overlay widgets) | mobile-engineer | T-014, T-007 | M |
| T-016 | DEV-03 | Tap-to-translate popup (dinh nghia + phat am + cau vi du) | mobile-engineer | T-015 | M |
| T-017 | DEV-03 | Progressive subtitle modes (blur/delayed/target-only) | mobile-engineer | T-015 | L |
| T-018 | DEV-03 | Subtitle mode preference persistence + subtitle_toggle event | mobile-engineer | T-017, T-002 | S |
| T-019 | DEV-04 | Word save flow (tu + cau + audio clip + timestamp + video_id) | mobile-engineer | T-016, T-010 | M |
| T-020 | DEV-04 | On-device audio clip extraction (ffmpeg_kit_flutter) | mobile-engineer | T-014 | M |
| T-021 | DEV-04 | FSRS SRS engine implementation (pure Dart) | backend-engineer | Khong | L |
| T-022 | DEV-04 | Review session API (due cards, answer submission, interval update) | backend-engineer | T-021, T-009 | M |
| T-023 | DEV-04 | Review UI — video clip playback + flashcard + SRS controls | mobile-engineer | T-020, T-022 | L |
| T-024 | DEV-04 | first_review_completed + aha_moment_reached event wiring | mobile-engineer | T-023, T-002 | S |
| T-025 | DEV-05 | Guest preview flow (60s video + tap-to-translate, no auth required) | mobile-engineer | T-014, T-016 | M |
| T-026 | DEV-05 | Auth gate at word save + Google/Apple OAuth integration | mobile-engineer | T-025 | M |
| T-027 | DEV-05 | Signup funnel events (video_preview_started, first_word_lookup, signup_*) | mobile-engineer | T-026, T-002 | S |
| T-028 | DEV-08 | RevenueCat SDK integration + App Store IAP + Google Play Billing setup | backend-engineer | Payment gateway confirmed | M |
| T-029 | DEV-08 | Subscription service (create/cancel/renew/status API) | backend-engineer | T-028, T-009 | L |
| T-030 | DEV-08 | Pricing screen UI (3 goi: Thang/Quy/Nam voi so sanh) | mobile-engineer | T-028 | M |
| T-031 | DEV-08 | Quota tracker (video/review quota display tren home screen) | mobile-engineer | T-029 | M |
| T-032 | DEV-08 | Renewal reminder push notification (3 ngay truoc gia han) | backend-engineer | T-029 | S |
| T-033 | DEV-08 | Cancel subscription flow (2 buoc, khong dark pattern) | mobile-engineer | T-029 | S |
| T-034 | — | Server-side PostgreSQL migration scripts (users, subscriptions, words, reviews) | database-engineer | T-009 | M |
| T-035 | — | Home screen UI (video search/browse + quota display + streak) | mobile-engineer | T-013, T-031 | M |
| T-036 | — | Push notification infrastructure (Firebase Cloud Messaging) | backend-engineer | T-001 | S |

### Phu thuoc giua cac lanes Phase 1

```
mobile-engineer lane:
  T-013 → T-014 → T-015 → T-016 → T-017 → T-018
                                  ↘ T-019 → T-023 → T-024
                          T-014 → T-020 ↗
  T-014 + T-016 → T-025 → T-026 → T-027
  T-028 → T-030 → T-031, T-033
  T-013 + T-031 → T-035

backend-engineer lane:
  T-021 → T-022
  T-028 → T-029 → T-032
  T-001 → T-036

database-engineer lane:
  T-009 → T-034
```

### Rui ro Phase 1

| Rui ro | Xac suat | Tac dong | Phuong an |
|--------|----------|---------|-----------|
| ffmpeg_kit_flutter bi Apple flag trong App Store review | Thap-Trung binh | Audio clip extraction bi reject | Test submission som voi TestFlight; fallback: timestamp-only review (UX kem hon nhung van hoat dong) |
| YouTube ToS enforcement chong youtube_explode_dart | Thap | Video player bi break | Video source abstraction layer cho phep pivot nhanh sang direct URL import; theo doi youtube_explode_dart issue tracker |
| Payment gateway confirm bi tre | Trung binh | DEV-08 bi delay | Bat dau DEV-08 design truoc; RevenueCat co sandbox mode de test |
| EN-VI translation quality duoi ky vong nguoi dung Viet | Trung binh | Trust gap ngay tu launch | Post-processing rules + human QA cho top-viewed videos; thu thap error patterns de fine-tune model v2 |

---

## 5. Phase 2 — Growth (Tuan 14-20)

### Dieu kien kich hoat

- [ ] >=25% nguoi dung moi dat Aha Moment (xem + luu >=5 tu + on tap trong 72h)
- [ ] Co LTV baseline tu cohort 30+ ngay
- [ ] D7 Retention baseline da do duoc

### Muc tieu

Them smart paywall triggers va referral flow de tang monetization va viral growth.

### Tasks Phase 2

| Task ID | Dev Ask | Mo ta | Owner | Dependencies | Effort |
|---------|---------|-------|-------|-------------|--------|
| T-037 | DEV-06 | Paywall trigger service (4 trigger types + pre-condition >=5 tu) | backend-engineer | T-029, T-022 | L |
| T-038 | DEV-06 | Paywall UI variants (4 copy versions + annual plan highlight) | mobile-engineer | T-037 | M |
| T-039 | DEV-06 | paywall_viewed event voi trigger_source parameter | mobile-engineer | T-038, T-002 | S |
| T-040 | DEV-07 | Deep link generation service (video_id + timestamp encoding) | backend-engineer | Khong | M |
| T-041 | DEV-07 | Share UI + deep link handling (iOS + Android) | mobile-engineer | T-040 | M |
| T-042 | DEV-07 | Deep link fallback (App Store/Play Store redirect khi chua cai) | backend-engineer | T-040 | S |
| T-043 | DEV-07 | invite_sent + referral_converted event wiring + attribution | mobile-engineer | T-041, T-002 | S |

### Rui ro Phase 2

| Rui ro | Xac suat | Tac dong | Phuong an |
|--------|----------|---------|-----------|
| Activation rate <25% → Phase 2 bi delay | Trung binh | Growth features khong co y nghia khi chua co activation | Focus vao cai thien Phase 1 UX truoc; dieu chinh Aha Moment definition neu can |
| Paywall qua som lam giam trust | Trung binh | Churn tang | Pre-condition >=5 tu la hard gate; staged rollout 10% → 50% → 100% |

---

## 6. Rui Ro Va Rollback

### Rollback Plan theo Phase

| Phase | Trigger rollback | Hanh dong |
|-------|-----------------|-----------|
| Phase 0 | AI subtitle accuracy <90% sau 2 tuan test | Pivot sang curated subtitle model; dieu chinh timeline +4 tuan |
| Phase 0 | GA4 credentials khong co sau 1 tuan | Dung local event logging truoc; backfill khi co GA4 |
| Phase 1 | App Store reject do ffmpeg_kit | Chuyen sang timestamp-only review (T-020 rollback); submit lai |
| Phase 1 | YouTube block youtube_explode_dart | Kich hoat direct URL import (T-013 abstraction layer); giam scope BYO YouTube |
| Phase 2 | Paywall giam D7 retention >5% | Tat paywall triggers; quay ve manual upgrade flow |
| Phase 2 | Deep link bi block boi platform | Fallback ve share plain text + App Store link |

### Top 3 Rui Ro Nghiem Trong Nhat

1. **AI subtitle accuracy khong dat 95%** — Day la make-or-break. Neu fail, khong launch. Mitigation: test som, nhieu model options (Whisper, gpt-4o-mini-transcribe, AssemblyAI).
2. **YouTube ToS enforcement** — Thap xac suat nhung cao tac dong. Mitigation: video source abstraction + direct URL import tu ngay 1.
3. **EN-VI translation quality** — Nguoi dung Viet co baseline cao tu Toomva. Mitigation: Google Translate + post-processing + human QA + error collection cho v2 fine-tuning.

---

## 7. Chien Luoc Test

### Unit Tests

| Component | Framework | Coverage Target | Owner |
|-----------|-----------|-----------------|-------|
| FSRS SRS engine | Dart test | >=90% | backend-engineer |
| Subtitle parsing + timing | Dart test | >=85% | backend-engineer |
| Caption extraction | Dart test + mocks | >=80% | backend-engineer |
| Translation caching | Node.js test | >=80% | backend-engineer |
| Database migrations | PostgreSQL test | 100% migrations | database-engineer |
| Drift schema | Dart test | >=85% | database-engineer |

### Integration Tests

| Scenario | Mo ta | Owner |
|----------|-------|-------|
| Caption → Translation → Subtitle display | End-to-end subtitle pipeline | backend-engineer + mobile-engineer |
| Word save → Audio clip → Review playback | Full review loop | mobile-engineer |
| Signup → Subscription → Quota enforcement | Billing flow | backend-engineer + mobile-engineer |
| GA4 event firing | 8 events P1 verify trong DebugView | mobile-engineer |

### E2E Tests

| Scenario | Platform | Mo ta |
|----------|----------|-------|
| First-time user journey | iOS + Android | Install → xem video → tap tu → dang ky → luu tu → on tap → paywall |
| Subscription flow | iOS + Android | Chon goi → thanh toan → quota update → gia han reminder → huy |
| Referral flow | iOS + Android | Share clip → nhan link → install → deep link mo dung video |

### Quality Gates

- **Phase 0 → Phase 1**: AI subtitle 95% accuracy, GA4 events firing, schema reviewed
- **Phase 1 → Phase 2**: All P1 acceptance criteria pass, D7 retention baseline co
- **Phase 2 → Launch**: E2E tests pass tren iOS + Android real devices, no critical bugs

---

## 8. Timeline Tong Quan

```
Tuan  1-2:  [Phase 0] Firebase setup + Caption extraction + Whisper prototype + Schema design
Tuan  3-4:  [Phase 0] 100 video test + Human QA + Funnel visualization + Schema review
            Gate: AI accuracy >=95% + GA4 events firing
Tuan  5-7:  [Phase 1] Video player + Dual subtitle + Tap-to-translate + RevenueCat setup
Tuan  8-9:  [Phase 1] Review loop + SRS + Delay signup + Audio clip extraction
Tuan 10-11: [Phase 1] Progressive subtitle modes + Billing/pricing + Push notifications
Tuan    12: [Phase 1] Integration testing + QA + App Store submission prep
            Gate: All P1 criteria pass + D7 baseline
Tuan 13:    Buffer / bug fixes / App Store review
Tuan 14-17: [Phase 2] Smart paywall triggers + Referral flow
Tuan 18-20: [Phase 2] Staged rollout + Experiment readiness + Polish
```

**Tong thoi gian du kien: 20 tuan** (5 thang)

---

## 9. Cross-Plan Considerations

### Phu thuoc voi cac team khac

| Team | Phu thuoc | Thoi diem can |
|------|----------|---------------|
| DevOps/GA4 Admin | GA4_ACCESS_TOKEN + GA4_PROPERTY_ID | Truoc tuan 1 |
| Stakeholder/Legal | Payment gateway decision (IAP only vs third-party) | Truoc tuan 5 |
| Stakeholder | YouTube ToS risk acceptance | Truoc tuan 1 |
| Ops/HR | 5 nguoi dung Viet native cho human QA subtitle | Tuan 2-3 |
| Marketing | ASO metadata + TikTok content prep | Tuan 10-12 (truoc launch) |
| ga4-analyst | Validate tracking plan sau khi DEV-01 done | Tuan 4-5 |
| growth-manager | Chay experiments P1 khi tracking san sang | Tuan 12+ |

### Cau hoi mo chua duoc tra loi (tu dev-intake.md)

| # | Cau hoi | Anh huong | Can tra loi truoc |
|---|---------|----------|------------------|
| Q1 | Payment gateway: IAP only hay co third-party? | DEV-08 architecture | Phase 1 start (tuan 5) |
| Q2 | AI inference budget hang thang? | Model selection | Phase 0 (tuan 1) |
| Q3 | 5 nguoi Viet cho human QA subtitle? | DEV-02 validation | Phase 0 tuan 2 |
| Q4 | GA4 credentials? | DEV-01 bị block | Truoc tuan 1 |
| Q7 | BYO YouTube URL bat ky hay curated list? | DEV-02 scope | Phase 0 (tuan 1) |
| Q8 | Offline review support? | Storage architecture | Phase 1 design (tuan 5) |

---

## Linked Artifacts

- `plans/bilingual-video-english/task-graph.json` — do thi task day du voi dependencies
- `plans/bilingual-video-english/ownership-matrix.md` — phan cong file ownership zero-overlap

## Nguon Tham Khao

- `reports/strategy/20260401-bilingual-video-english/strategy-memo.md`
- `reports/strategy/20260401-bilingual-video-english/dev-intake.md`
- `reports/strategy/20260401-bilingual-video-english/technical-brainstorm.md`
- `.claude/eup-context.md`
