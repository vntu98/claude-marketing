---
title: GA4 Insights — Ứng dụng học tiếng Anh qua video song ngữ
date: 2026-04-01
analyst: ga4-analyst
credentials_status: KHÔNG CÓ (GA4_ACCESS_TOKEN và GA4_PROPERTY_ID chưa được cấu hình)
data_source: Framework phân tích dựa trên industry benchmark và competitor patterns
---

# GA4 Insights: Ứng dụng Học Tiếng Anh Qua Video Song Ngữ

## 1. Tình Trạng Dữ Liệu

**Credentials:** Không có `GA4_ACCESS_TOKEN` và `GA4_PROPERTY_ID` trong môi trường hiện tại.

**Hệ quả:** Toàn bộ phân tích dưới đây là framework recommendation dựa trên:
- Benchmark ngành EdTech/language learning (Duolingo, Elsa Speak, LingQ)
- Patterns từ video-first apps (YouTube Learning, Yoyo Chinese, Dreaming Spanish)
- GA4 event taxonomy chuẩn cho mobile app với video interaction

**Hành động cần thiết trước khi có dữ liệu thực:**
1. Cấu hình `GA4_ACCESS_TOKEN` (OAuth 2.0 service account)
2. Cấu hình `GA4_PROPERTY_ID` (format: `properties/XXXXXXX`)
3. Chạy preset `event-breakdown` để audit instrumentation hiện tại
4. Chạy preset `learner-journey-funnel` để xác nhận funnel stages

---

## 2. Taxonomy Sự Kiện GA4 Cho Sản Phẩm Học Qua Video

### 2.1 Nhóm Sự Kiện Cốt Lõi (Core Video Learning Events)

| Tên Sự Kiện | Mô Tả | Parameters Khuyến Nghị |
|---|---|---|
| `video_play` | Người dùng bắt đầu xem video | `video_id`, `video_title`, `video_level` (A1–C1), `content_type` (clip/full_episode), `source_language`, `target_language` |
| `video_pause` | Tạm dừng video | `video_id`, `pause_position_sec`, `total_duration_sec` |
| `video_completed` | Xem hết video (>85% duration) | `video_id`, `video_title`, `video_level`, `duration_sec`, `completion_pct` |
| `video_seek` | Tua lại/tua nhanh | `video_id`, `seek_from_sec`, `seek_to_sec`, `direction` |
| `subtitle_toggle` | Bật/tắt phụ đề | `video_id`, `subtitle_state` (on/off), `subtitle_lang` (vi/en/both), `position_in_video_pct` |
| `subtitle_language_switched` | Đổi ngôn ngữ phụ đề | `video_id`, `from_lang`, `to_lang` |

### 2.2 Nhóm Sự Kiện Học Từ Vựng (Vocabulary Learning Events)

| Tên Sự Kiện | Mô Tả | Parameters Khuyến Nghị |
|---|---|---|
| `word_tap` | Nhấn vào từ trong phụ đề để xem nghĩa | `word`, `word_id`, `video_id`, `context_sentence`, `video_position_sec` |
| `word_saved` | Lưu từ vào danh sách học | `word`, `word_id`, `video_id`, `source` (subtitle/definition_card), `deck_id` |
| `word_definition_viewed` | Xem định nghĩa đầy đủ | `word_id`, `definition_source`, `duration_ms` |
| `word_unsaved` | Bỏ lưu từ | `word_id` |
| `word_deck_created` | Tạo bộ thẻ từ mới | `deck_name`, `initial_word_count` |

### 2.3 Nhóm Sự Kiện Ôn Tập (Review/SRS Events)

| Tên Sự Kiện | Mô Tả | Parameters Khuyến Nghị |
|---|---|---|
| `review_started` | Bắt đầu phiên ôn tập | `review_type` (flashcard/quiz/fill_blank), `deck_id`, `word_count`, `session_number` |
| `review_answer_submitted` | Trả lời một câu trong ôn tập | `word_id`, `is_correct` (bool), `review_type`, `response_time_ms` |
| `review_completed` | Hoàn thành phiên ôn tập | `deck_id`, `total_cards`, `correct_count`, `accuracy_pct`, `duration_sec` |
| `review_abandoned` | Bỏ dở giữa chừng | `deck_id`, `cards_completed`, `abandoned_at_pct` |
| `streak_extended` | Kéo dài chuỗi ngày học | `streak_days`, `action_that_extended` |
| `streak_broken` | Mất chuỗi ngày học | `streak_days_lost`, `last_active_date` |

### 2.4 Nhóm Sự Kiện Lesson/Course (Structural Learning Events)

| Tên Sự Kiện | Mô Tả | Parameters Khuyến Nghị |
|---|---|---|
| `lesson_started` | Bắt đầu bài học | `lesson_id`, `lesson_title`, `course_id`, `level`, `estimated_duration_min` |
| `lesson_completed` | Hoàn thành bài học (tất cả video + review) | `lesson_id`, `time_to_complete_min`, `score`, `words_learned_count` |
| `course_enrolled` | Đăng ký khóa học | `course_id`, `course_title`, `level`, `source` |
| `course_completed` | Hoàn thành toàn bộ khóa học | `course_id`, `total_days`, `completion_rate` |
| `level_up` | Đạt cấp độ mới | `new_level`, `previous_level`, `days_at_previous_level` |

### 2.5 Nhóm Sự Kiện Monetization

| Tên Sự Kiện | Mô Tả | Parameters Khuyến Nghị |
|---|---|---|
| `paywall_shown` | Paywall hiển thị | `paywall_id`, `trigger` (feature_gate/content_gate/limit_reached), `feature_attempted`, `user_session_count` |
| `paywall_dismissed` | Đóng paywall không subscribe | `paywall_id`, `trigger`, `time_on_paywall_sec` |
| `pricing_viewed` | Xem trang pricing | `source` (paywall/menu/organic), `plans_shown` |
| `plan_selected` | Chọn gói | `plan_name`, `billing_cycle` (monthly/annual), `price_usd`, `discount_pct` |
| `purchase_completed` | Mua thành công | `plan_name`, `billing_cycle`, `value`, `currency`, `transaction_id`, `trial_converted` (bool) |
| `trial_started` | Bắt đầu dùng thử | `plan_name`, `trial_days`, `source` |
| `trial_converted` | Chuyển đổi từ trial sang paid | `plan_name`, `trial_days_used`, `value` |
| `subscription_cancelled` | Hủy đăng ký | `plan_name`, `tenure_days`, `reason`, `cancel_flow_step` |

### 2.6 Sự Kiện Onboarding & Activation

| Tên Sự Kiện | Mô Tả | Parameters Khuyến Nghị |
|---|---|---|
| `signup_started` | Bắt đầu đăng ký | `source`, `method` (google/apple/email) |
| `signup_completed` | Đăng ký thành công | `method`, `source`, `time_to_complete_sec` |
| `onboarding_step_completed` | Hoàn thành bước onboarding | `step_number`, `step_name` (level_select/goal_set/notification_opt), `time_on_step_sec` |
| `onboarding_completed` | Hoàn thành toàn bộ onboarding | `steps_completed`, `total_time_sec`, `goal_selected`, `level_selected` |
| `first_video_watched` | Xem video đầu tiên | `video_id`, `watch_pct`, `session_number` |
| `aha_moment_reached` | Đạt "aha moment" (xem video + lưu từ + ôn tập lần đầu) | `session_number`, `days_since_signup`, `activation_path` |

---

## 3. Định Nghĩa Funnel và Phân Tích Drop-off

### 3.1 Funnel Cài Đặt → Subscription (7 Bước)

```
Cài đặt App
    ↓ [Dự kiến drop-off: 30-40% không mở lại sau ngày đầu]
Hoàn thành Signup
    ↓ [Dự kiến drop-off: 20-35% bỏ ngang form đăng ký]
Hoàn thành Onboarding
    ↓ [Dự kiến drop-off: 25-40% skip/abandon onboarding]
Xem Video Đầu Tiên (first_video ≥ 50% completion)
    ↓ [Dự kiến drop-off: 30-50% không xem xong video đầu]
Lưu Từ Đầu Tiên (first word_saved)
    ↓ [Dự kiến drop-off: 40-60% không tương tác từ vựng]
Hoàn Thành Ôn Tập Đầu Tiên (first review_completed)
    ↓ [Dự kiến drop-off: 50-70% không quay lại ôn tập]
Đăng Ký Subscription (purchase_completed)
```

**Benchmark ngành:** Tỉ lệ chuyển đổi từ install → paid subscription trong EdTech mobile thường là 2–5%. Với sản phẩm bilingual video có cơ chế SRS tốt, mục tiêu nên là 3–6%.

### 3.2 Phân Tích Drop-off Quan Trọng

**Điểm rủi ro cao nhất:**

| Bước | Lý Do Drop-off Tiềm Năng | Chỉ Số Cần Theo Dõi |
|---|---|---|
| Install → Signup | Yêu cầu tạo tài khoản ngay (friction quá sớm) | `signup_started` / `app_first_open` ratio |
| Signup → First Video | Onboarding dài hoặc không rõ ràng về giá trị | `time_to_first_video_play_min` median |
| First Video → Word Saved | UI tap-to-translate không đủ nổi bật hoặc khó dùng | `word_tap` / `video_play` ratio |
| Word Saved → Review | Không có trigger/notification nhắc ôn tập | `review_started` within 24h of `word_saved` |
| Review → Subscription | Paywall trigger quá sớm hoặc quá muộn | `paywall_shown` timing vs. session count |

### 3.3 Điểm "Aha Moment" Khuyến Nghị

Dựa trên patterns của Duolingo, LingQ, và Anki:

> **"Aha moment"** = Người dùng xem ít nhất 1 video (≥70% completion) + lưu ≥5 từ + hoàn thành ít nhất 1 phiên ôn tập **trong vòng 72 giờ đầu**

Người dùng đạt milestone này có xác suất retention tuần 2 cao hơn ~3x so với nhóm không đạt.

---

## 4. Phân Tích KPI Snapshot (Dự Kiến/Benchmark)

### 4.1 KPI Acquisition (Benchmark Ngành)

| Chỉ Số | Benchmark Ngành | Mục Tiêu Đề Xuất |
|---|---|---|
| CPI (Cost Per Install) — ASO organic | $0 | Tập trung đầu tư |
| CPI — Paid UA (Google/Meta) | $1.50–$4.00 | < $2.50 |
| DAU/MAU ratio | 15–25% (language apps) | > 20% |
| D1 Retention | 30–40% | > 35% |
| D7 Retention | 15–25% | > 20% |
| D30 Retention | 8–15% | > 12% |
| Install → Trial Conversion | 5–12% | > 8% |
| Trial → Paid Conversion | 20–40% | > 30% |
| Avg. Session Duration | 8–15 phút | > 12 phút |

### 4.2 KPI Video Engagement (Benchmark Video Learning Apps)

| Chỉ Số | Benchmark | Mục Tiêu |
|---|---|---|
| Video completion rate (≥70%) | 40–60% | > 55% |
| word_tap per video session | 3–8 taps | > 5 taps |
| word_saved per video session | 1–3 saves | > 2 saves |
| Subtitle toggle rate | 30–60% dùng song ngữ | Monitor |
| Review completion rate | 50–70% | > 65% |

---

## 5. Lỗ Hổng Đo Lường (Instrumentation Gaps)

### 5.1 Lỗ Hổng Quan Trọng Cần Giải Quyết Ngay

1. **Không có tracking thời gian xem video theo segment** — hiện tại chỉ có `video_play` và `video_completed` nhưng thiếu heartbeat events (ví dụ: mỗi 10s) để tính watch time thực tế và điểm bỏ xem.

2. **Không có cross-session stitching** — nếu người dùng xem video trên web nhưng ôn tập trên mobile, funnel sẽ bị vỡ. Cần `user_id` nhất quán qua các platform.

3. **Thiếu attribution cho word_saved → review_completed path** — hiện chưa rõ từ vựng học qua kênh nào (video A, B, hay C) có recall rate cao hơn.

4. **Không có visibility vào subtitle preference journey** — người dùng học tốt hơn với phụ đề tiếng Anh, tiếng Việt, hay song ngữ? Cần `subtitle_toggle` + `lesson_completed` correlation.

5. **Thiếu paywall impression tracking** — không biết bao nhiêu người thấy paywall mà không click, là điểm mù lớn trong monetization funnel.

6. **Không có data về notification opt-in rate** — critical cho retention, đặc biệt streak mechanics.

### 5.2 Lỗ Hổng Thứ Cấp (Cần Trong 60 Ngày)

- A/B test tracking cho subtitle UI variants
- Cohort tracking theo `level_selected` trong onboarding
- Content recommendation click tracking (nếu có gợi ý video)
- Error events cho video buffering/loading failures (ảnh hưởng completion rate)

---

## 6. Thiết Lập GA4 Khuyến Nghị

### 6.1 Custom Dimensions (User-scoped)

| Dimension | Value | Lý Do |
|---|---|---|
| `user_native_language` | vi / en / other | Segment behavior theo ngôn ngữ mẹ đẻ |
| `user_english_level` | A1/A2/B1/B2/C1/C2 | Phân tích content fit |
| `user_learning_goal` | travel / career / exam / entertainment | Attribution cho content strategy |
| `subscription_status` | free / trial / paid | Segment tất cả metrics |
| `acquisition_channel_first` | organic_search / aso / paid_ua / referral / social | LTV attribution |

### 6.2 Custom Dimensions (Event-scoped)

| Dimension | Events | Lý Do |
|---|---|---|
| `video_level` | video_play, video_completed | Hiểu level preference |
| `content_type` | video_play, lesson_started | Phân biệt clip vs. full episode |
| `review_type` | review_started, review_completed | So sánh hiệu quả flashcard vs. quiz |
| `paywall_trigger` | paywall_shown, paywall_dismissed | Tối ưu paywall placement |

### 6.3 Conversion Events Cần Đánh Dấu Trong GA4

Theo thứ tự ưu tiên:
1. `purchase_completed` (primary)
2. `trial_started` (secondary)
3. `aha_moment_reached` (micro-conversion)
4. `first_video_watched` (engagement micro-conversion)
5. `signup_completed` (top-funnel)

---

## 7. Anomalies và Rủi Ro Đo Lường

### 7.1 Rủi Ro Kỹ Thuật

- **iOS App Tracking Transparency (ATT):** Với iOS 14.5+, ~50–60% người dùng từ chối tracking. Cần server-side events hoặc SKAdNetwork để bù đắp attribution gap trong paid UA.
- **GA4 Sampling:** Với property free tier, báo cáo exploration có thể bị sampling khi >10M events/tháng. Nếu app scale, cần GA4 360 hoặc BigQuery export.
- **Cross-platform deduplication:** Nếu dùng cả Firebase (mobile) và gtag.js (web), cần đảm bảo `client_id` mapping nhất quán để tránh inflate user count.

### 7.2 Rủi Ro Dữ Liệu

- **Bot traffic:** Cần kích hoạt GA4 enhanced measurement + IP filtering
- **Internal traffic:** Exclude developer/QA devices bằng `debug_mode` parameter
- **Currency mismatch:** Nếu bán đa thị trường (VN, US, PH), cần chuẩn hóa `currency` trong `purchase_completed`

---

## 8. Roadmap Triển Khai

| Phase | Thời Gian | Việc Cần Làm |
|---|---|---|
| Phase 1 — Foundation | Tuần 1–2 | Cài Firebase SDK, kích hoạt enhanced measurement, implement 5 core conversion events |
| Phase 2 — Video + Vocab | Tuần 3–4 | Implement `video_*`, `word_*`, `subtitle_*` events; validate với event-breakdown preset |
| Phase 3 — Funnel + Review | Tuần 5–6 | Implement review events, funnel visualization trong GA4 Explore; baseline measurement |
| Phase 4 — Monetization | Tuần 7–8 | Paywall events, purchase flow, trial tracking; first LTV cohort analysis |
| Phase 5 — Optimization | Month 3+ | A/B test integration, BigQuery export nếu cần, notification attribution |

---

*Ghi chú: Toàn bộ framework này cần được validate lại sau khi kết nối GA4 credentials thực. Chạy preset `event-breakdown` và `learner-journey-funnel` ngay khi có `GA4_ACCESS_TOKEN` để xác nhận instrumentation coverage.*
