# Ownership Matrix: Bilingual Video English

**Ngay:** 2026-04-01
**Tac gia:** implementation-planner

---

## Nguyen Tac

1. Moi file/directory thuoc **dung 1 engineer** — zero overlap
2. Engineer chi commit vao files trong scope cua minh
3. Khi can sua file cua engineer khac, tao PR va request review tu owner

---

## Phan Cong File Ownership

### backend-engineer

**Pham vi:** Server API, AI subtitle pipeline, billing service, deep link service, push notifications

```
server/src/subtitle/           # Caption extraction, Whisper, AutoDub detection
server/src/translation/        # Google Translate, caching, post-processing
server/src/billing/            # RevenueCat webhook, subscription service, renewal
server/src/paywall/            # Trigger service, trigger types, copy variants
server/src/deeplink/           # Link generation, resolution, store redirect
server/src/notifications/      # FCM client, push service
server/src/analytics/          # Server-side events, ATT fallback
server/src/config/             # Environment config
server/src/index.ts            # Server entry point
server/package.json
server/tsconfig.json
server/Dockerfile
server/docker-compose.yml
server/tests/                  # All server-side tests
docs/subtitle-qa-results.md
```

**Tasks:** T-003, T-005, T-006, T-007, T-008, T-011, T-021, T-022, T-028, T-029, T-032, T-036, T-037, T-040, T-042

**Luu y:** T-021 (FSRS engine) output la Dart file trong `mobile/lib/features/review/domain/fsrs/` — day la ngoai le duy nhat, vi FSRS la pure Dart logic khong phu thuoc UI. Backend-engineer own logic, mobile-engineer khong sua cac file fsrs/.

---

### mobile-engineer

**Pham vi:** Flutter app, video player, subtitle rendering, onboarding, review UI, billing UI, sharing UI

```
mobile/lib/main.dart
mobile/lib/core/                          # App-level: analytics, notifications, DI
  mobile/lib/core/analytics/              # Firebase config, event definitions, UTM
  mobile/lib/core/notifications/          # Notification handler
mobile/lib/features/video/                # Video player, subtitle overlay, modes
  mobile/lib/features/video/data/         # Video source, YouTube source, direct URL
  mobile/lib/features/video/domain/       # Player controller, subtitle sync, word lookup
  mobile/lib/features/video/presentation/ # Player widget, controls, subtitle overlay, modes, popup
mobile/lib/features/vocabulary/           # Word save, audio clip extraction
  mobile/lib/features/vocabulary/data/    # Word repository, audio clip extractor, clip storage
  mobile/lib/features/vocabulary/domain/  # Save word usecase
  mobile/lib/features/vocabulary/presentation/ # Word list screen
mobile/lib/features/review/presentation/  # Review screen, flashcard, summary, clip player
mobile/lib/features/review/domain/activation_tracker.dart
mobile/lib/features/onboarding/           # Guest preview, signup funnel tracker
mobile/lib/features/auth/                 # Auth gate, Google/Apple OAuth
mobile/lib/features/billing/presentation/ # Pricing screen, plan card, quota widget, cancel, paywall
mobile/lib/features/billing/domain/       # Quota tracker, paywall analytics
mobile/lib/features/home/                 # Home screen, video search, recent videos
mobile/lib/features/settings/             # Subtitle preferences
mobile/lib/features/sharing/              # Share button, deep link handler, referral tracker
mobile/pubspec.yaml
mobile/android/                           # Android config (google-services.json, etc.)
mobile/ios/                               # iOS config (GoogleService-Info.plist, Info.plist, etc.)
.github/workflows/mobile-ci.yml
```

**Tasks:** T-001, T-002, T-004, T-012, T-013, T-014, T-015, T-016, T-017, T-018, T-019, T-020, T-023, T-024, T-025, T-026, T-027, T-030, T-031, T-033, T-035, T-038, T-039, T-041, T-043

---

### database-engineer

**Pham vi:** PostgreSQL server schema, Drift/SQLite local schema, migrations

```
server/src/db/                  # Schema, indexes, migrations, migration runner, seeds
  server/src/db/schema.sql
  server/src/db/indexes.sql
  server/src/db/migrations/
  server/src/db/migration-runner.ts
  server/src/db/seeds/
mobile/lib/data/database/       # Drift schema, tables, DAOs
  mobile/lib/data/database/app_database.dart
  mobile/lib/data/database/tables.dart
  mobile/lib/data/database/daos/
docs/server-schema-erd.md
```

**Tasks:** T-009, T-010, T-034

---

## Ranh Gioi Va Quy Tac

### Khu vuc FSRS (ngoai le)

- `mobile/lib/features/review/domain/fsrs/` — **owned by backend-engineer**
- `mobile/lib/features/review/domain/review_session_usecase.dart` — **owned by backend-engineer** (T-022)
- `mobile/lib/features/review/data/review_repository.dart` — **owned by backend-engineer** (T-022)
- Ly do: FSRS la pure algorithm logic, khong phai UI. Backend-engineer co expertise tot hon cho SRS scheduling.
- Mobile-engineer own toan bo `mobile/lib/features/review/presentation/` va `mobile/lib/features/review/domain/activation_tracker.dart`

### Khu vuc RevenueCat (chia se)

- `mobile/lib/features/billing/data/revenuecat_service.dart` — **owned by backend-engineer** (T-028)
- `mobile/lib/features/billing/presentation/` — **owned by mobile-engineer** (T-030, T-031, T-033, T-038)
- `mobile/lib/features/billing/domain/` — **owned by mobile-engineer** (quota tracker, paywall analytics)

### Ranh gioi ro rang

| Ranh gioi | backend-engineer | mobile-engineer |
|-----------|-----------------|-----------------|
| Subtitle logic | server/src/subtitle/ | mobile features/video/presentation/subtitle_* |
| Translation logic | server/src/translation/ | (consume via API) |
| Review logic | FSRS engine + review repo + usecase | Review UI + activation tracker |
| Billing logic | Subscription service + webhook + RevenueCat SDK | Pricing UI + quota display + cancel flow |
| Analytics | Server-side events | Client-side GA4 events |

---

## Tong Ket Theo Phase

| Phase | backend-engineer | mobile-engineer | database-engineer |
|-------|-----------------|-----------------|-------------------|
| Phase 0 | T-003, T-005, T-006, T-007, T-008, T-011 | T-001, T-002, T-004, T-012 | T-009, T-010 |
| Phase 1 | T-021, T-022, T-028, T-029, T-032, T-036 | T-013-T-020, T-023-T-027, T-030, T-031, T-033, T-035 | T-034 |
| Phase 2 | T-037, T-040, T-042 | T-038, T-039, T-041, T-043 | — |

**Tong tasks:** backend-engineer: 15 | mobile-engineer: 25 | database-engineer: 3
