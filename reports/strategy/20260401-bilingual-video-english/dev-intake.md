# Dev Intake Packet: Ứng Dụng Học Tiếng Anh Qua Video Song Ngữ

**Ngày tạo:** 2026-04-01
**Người tạo:** project-manager
**Phiên bản:** 1.0
**Trạng thái:** Sẵn sàng cho implementation-planner

---

## Business Objective

**Mục tiêu kinh doanh:** Ra mắt app mobile-first (iOS + Android) tại thị trường Việt Nam giúp người học tiếng Anh 18-35 tuổi xem video thật, hiểu ngay khi bí, lưu từ có ngữ cảnh, và luyện lại đúng lúc — tất cả trên điện thoại.

**Định nghĩa thành công (6 tháng đầu):**
- D7 Retention > 20% (benchmark ngành 15-25%)
- D30 Retention > 12% (benchmark ngành 8-15%)
- Install → Trial Conversion > 8%
- Trial → Paid Conversion > 30%
- Paywall → Subscription > 8%
- Aha Moment Rate (xem ≥70% video + lưu ≥5 từ + hoàn thành 1 phiên ôn tập trong 72 giờ) > 25% người dùng mới

**Tại sao đây là cơ hội:** Không có app nào sở hữu đầy đủ combo: mobile-first + BYO media + AI subtitle chính xác + review loop chặt chẽ + billing minh bạch tại thị trường Việt Nam. eJOY — đối thủ trực tiếp nhất — đang loãng product thesis. Trancy có feature velocity cao nhưng EN-VI quality yếu và mobile UX kém.

*(Nguồn: strategy-memo.md Mục 1 — Tóm Tắt Điều Hành; competitor-landscape.md Mục 12 Threats)*

---

## Approved Strategy Source

**File chiến lược đã phê duyệt:**
`reports/strategy/20260401-bilingual-video-english/strategy-memo.md`

**Ngày:** 2026-04-01
**Tác giả:** marketing-strategist
**Cơ sở bằng chứng:** 8 artifacts nghiên cứu tại `reports/research/20260401-bilingual-video-english/`

**Các phần liên quan trực tiếp đến dev-intake này:**
- Mục 7: Yêu Cầu Dev Cụ Thể (DEV-01 đến DEV-08)
- Mục 5: Thí Nghiệm Ưu Tiên (EXP-01 đến EXP-08)
- Mục 6: Ghi Chú Đo Lường (GA4 roadmap + tracking events)
- Mục 8: PM Intake Packet (ràng buộc + phụ thuộc + timeline đề xuất)

---

## User Or Ops Change

### Thay đổi người dùng sẽ thấy

| Thay đổi | Hiện tại | Sau khi ship |
|---------|---------|-------------|
| Xem video YouTube với phụ đề song ngữ Anh-Việt chính xác | Không tồn tại trên mobile native | Hiển thị ngay mặc định, AI-generated khi thiếu subtitle gốc |
| Tap vào từ để tra nghĩa trong lúc xem | Không có | Popup định nghĩa + phát âm + câu ví dụ ngay trong video player |
| Lưu từ kèm clip video 5-10 giây làm ngữ cảnh | Không có | Saved word bao gồm câu, audio moment, timestamp |
| Ôn tập từ bằng clip video gốc (không chỉ text flashcard) | Không có | Review loop hiển thị lại video clip tại thời điểm đã lưu từ |
| Chọn chế độ phụ đề theo trình độ (full/blur/delayed/target-only) | Không có | 4 progressive subtitle modes, chuyển đổi không gián đoạn playback |
| Dùng thử app mà không cần đăng ký ngay | Bị gate ngay khi mở | Xem 60 giây + click từ trước, chỉ gate khi muốn lưu |
| Nhìn thấy quota và ngày gia hạn rõ ràng | Không rõ (billing không minh bạch) | Quota hiển thị ở home screen; nhắc gia hạn 3 ngày trước |
| Paywall xuất hiện đúng lúc sau khi đã trải nghiệm giá trị | Ngẫu nhiên hoặc quá sớm | Paywall chỉ kích hoạt sau trigger cụ thể (review quota, video quota, streak 7 ngày) |
| Chia sẻ clip song ngữ cho bạn | Không có | Deep link share mở đúng video + timestamp trong app |

### Thay đổi ops sẽ thấy

- **GA4 dashboard hoạt động:** 8 events P1 firing chính xác, funnel visualization có dữ liệu thực
- **Tracking attribution sạch:** UTM convention từ channel-scorecard.md được tuân theo; cross-platform dedup đúng
- **Experiment infrastructure sẵn sàng:** Tracking events đủ để chạy EXP-01 đến EXP-03 (delay signup, social login, triggered paywall)

---

## Priority Workstreams

### Workstream A — Tracking Infrastructure (P0 — BLOCKER)

**Mô tả:** Không có tracking, không chạy được bất kỳ experiment nào. Đây là blocker tuyệt đối.

**Phạm vi:** Firebase SDK + enhanced measurement + 8 GA4 events P1 + 5 conversion events + funnel visualization

**8 GA4 Events P1 bắt buộc** (nguồn: growth-opportunities.md Mục 7; ga4-insights.md Mục 5):
1. `video_preview_started` — đo lường điểm vào đầu funnel
2. `first_word_lookup` — aha moment đầu tiên
3. `first_word_saved` — activation milestone 1
4. `first_review_completed` — activation milestone 2 (vòng lặp hoàn chỉnh)
5. `paywall_viewed` (với parameter `trigger_source`) — hiệu quả từng loại trigger
6. `subscription_started` (với parameter `plan_type`) — đo lường conversion và plan mix
7. `streak_day_achieved` (với số ngày) — đo lường streak engagement
8. `push_notification_opened` (với parameter `notification_type`) — hiệu quả notification

**5 Conversion Events** (nguồn: ga4-insights.md Mục 6.3):
1. `purchase_completed` (primary)
2. `trial_started` (secondary)
3. `aha_moment_reached` (micro-conversion)
4. `first_video_watched` (engagement micro-conversion)
5. `signup_completed` (top-funnel)

**Rủi ro kỹ thuật:**
- iOS ATT: ~50-60% từ chối tracking → cần server-side events hoặc SKAdNetwork
- Cross-platform dedup: nếu dùng cả Firebase mobile + gtag.js web → cần `client_id` mapping nhất quán

---

### Workstream B — AI Subtitle Engine (P0 — BLOCKER)

**Mô tả:** Core promise của sản phẩm. Nếu subtitle AI sai, mọi thứ đổ vỡ.

**Phạm vi:**
- (a) Generate AI subtitle khi video không có subtitle gốc
- (b) Phát hiện và xử lý YouTube AutoDub ghi đè audio gốc
- (c) Hiển thị song ngữ Anh-Việt với độ chính xác ≥95%
- (d) EN-VI translation quality được đánh giá bởi ≥5 người dùng Việt

**Ngưỡng chất lượng bắt buộc:** AI subtitle accuracy ≥95% trên 100 video test (mix có/không có subtitle gốc, có/không có AutoDub) — đây là điều kiện tiên quyết trước launch (nguồn: strategy-memo.md Mục 8 Ràng Buộc #3)

**Câu hỏi kỹ thuật mở (cho technical-brainstormer):** Whisper vs GPT-4o vs Gemini cho subtitle generation? Trade-off về accuracy, cost, latency, và AutoDub resilience? (nguồn: strategy-memo.md Mục 9 Ban Giao Vai Trò)

---

### Workstream C — Core App: Video Player + Word Save (P1 — Launch)

**Mô tả:** App player core với: video playback, dual subtitle display, tap-to-translate, word save với ngữ cảnh đầy đủ (câu + audio + timestamp).

**Phạm vi:**
- Video player mobile-first (iOS + Android)
- Dual subtitle rendering (EN + VI, overlaid)
- Tap-to-translate popup (định nghĩa + phát âm + câu ví dụ trong ngữ cảnh)
- Word save: lưu từ + câu + audio clip 5-10s + timestamp

**Phụ thuộc:** Workstream B (AI subtitle engine) phải hoàn thành hoặc chạy song song với prototype

---

### Workstream D — Progressive Subtitle Modes (P1 — Launch)

**Mô tả:** 4 chế độ phụ đề cho phép người học điều chỉnh theo trình độ.

**4 modes:**
1. Full dual (Anh + Việt đầy đủ)
2. Blur tiếng Việt (hiện khi tap)
3. Delayed reveal (hiện sau 2-3 giây)
4. Target-only (chỉ tiếng Anh)

**Differentiator:** Không ai có UX tốt cho progressive subtitle trên mobile (competitor-landscape.md Gap C)

---

### Workstream E — Context-Rich Review Loop (P1 — Launch)

**Mô tả:** Review loop dùng clip video thay vì chỉ text flashcard. Khi ôn tập, người dùng thấy lại clip 5-10 giây tại thời điểm đã lưu từ.

**Phạm vi:**
- SRS (Spaced Repetition System) lập lịch ôn tập
- Review UI hiển thị video clip + câu gốc thay vì chỉ text
- Push notification cho "3 từ sắp quên" (EXP-08)

**Differentiator:** Hầu hết app save word nhưng mất context. Đây là khoảng trống lớn nhất trong category (competitor-landscape.md Gap D)

---

### Workstream F — Delay Signup Flow (P1 — Launch)

**Mô tả:** Cho phép người dùng xem 60 giây video mẫu + click từ tra nghĩa trước khi yêu cầu đăng ký. Gate chỉ xuất hiện ở hành động lưu từ.

**Ràng buộc thiết kế:**
- Không bắt trượt phụ đề trong phiên đầu
- Chỉ gate khi có sự kiện cụ thể (từ được lưu, tiến độ mất)
- Đăng ký qua Google/Apple một chạm (không có email form — EXP-02)

**Experiment gắn:** EXP-01 (delay signup), EXP-02 (social login only) — nguồn: growth-opportunities.md Mục 1

---

### Workstream G — Billing Transparency Architecture (P1 — Launch)

**Mô tả:** Pricing rõ ràng, nhắc gia hạn, hủy đơn giản, quota hiển thị — để win về trust ngay từ ngày 1.

**Phạm vi:**
- Pricing page rõ ràng (Tháng/Quý/Năm với so sánh)
- Nhắc 3 ngày trước khi subscription sắp tự gia hạn
- Hủy đơn giản trong 2 bước
- Quota sử dụng hiển thị rõ ở home screen (bao nhiêu video/review còn lại)

**Giá sách đề xuất** (nguồn: growth-opportunities.md Mục 3):
- Tháng: 99.000 VND (~$4)
- Quý: 240.000 VND (~$10, tiết kiệm 20%)
- Năm: 699.000 VND (~$28, tiết kiệm 40%)

---

### Workstream H — Smart Paywall Trigger System (P2 — Growth)

**Mô tả:** Paywall hiển thị dựa trên trigger cụ thể thay vì ngẫu nhiên. Pre-condition bắt buộc: người dùng đã lưu ≥5 từ trước khi thấy paywall.

**4 trigger types tối thiểu:**
1. Hết quota review (>20 từ/ngày)
2. Hết video miễn phí tuần
3. Streak 7 ngày
4. Quay lại sau 3+ ngày không hoạt động

**Mỗi trigger có:** copy riêng + `trigger_source` parameter trong GA4 event

**Experiments gắn:** EXP-03 (triggered paywall), EXP-06 (annual plan spotlight) — nguồn: growth-opportunities.md Mục 5

---

### Workstream I — Referral Flow (P2 — Growth)

**Mô tả:** "Gửi clip song ngữ cho bạn" — share clip + deep link → bạn nhận được clip với phụ đề song ngữ → app download/open.

**Phạm vi:**
- Share flow iOS + Android
- Deep link mở đúng video + timestamp
- Track `invite_sent` và `referral_converted` events

**Lý do P2:** Referral CAC = $0, LTV referred users cao hơn 25-35%. Nhưng cần data activation từ P1 trước khi viral loop có ý nghĩa (nguồn: channel-scorecard.md Mục 2.5)

---

## Scoped Dev Asks

### DEV-01: Tracking Infrastructure

**Mô tả:** Implement Firebase SDK + GA4 enhanced measurement + 8 events P1 + 5 conversion events + funnel visualization theo roadmap ga4-insights.md Phase 1-2.

**Độ ưu tiên:** P0 — BLOCKER. Không có tracking, không chạy được bất kỳ experiment nào.

**Acceptance Criteria:**
- [ ] Firebase SDK được cài đặt và kết nối với GA4 property
- [ ] 8 events P1 firing chính xác trong GA4 DebugView với đúng parameters
- [ ] 5 conversion events được đánh dấu trong GA4
- [ ] Funnel visualization (Install → Signup → First Video → Word Saved → Review → Subscription) hoạt động với dữ liệu thực
- [ ] iOS ATT handling implemented (server-side events hoặc SKAdNetwork fallback)
- [ ] Cross-platform `client_id` mapping nhất quán giữa Firebase mobile và web nếu có
- [ ] Internal traffic excluded qua `debug_mode`

**Suggested Engineer Role:** mobile-engineer (Firebase SDK) + backend-engineer (server-side events, UTM attribution)

**Dependencies:** Không có blocker trước đó. Chạy song song với DEV-02.

**Nguồn:** strategy-memo.md Mục 7 DEV-01; ga4-insights.md Mục 8 Roadmap Phase 1-2; growth-opportunities.md Mục 7

---

### DEV-02: AI Subtitle Engine với AutoDub Resilience

**Mô tả:** Xây dựng subtitle engine có thể: generate AI subtitle khi video không có subtitle gốc, phát hiện và xử lý YouTube AutoDub, hiển thị song ngữ Anh-Việt với accuracy ≥95%.

**Độ ưu tiên:** P0 — BLOCKER. Đây là yêu cầu kỹ thuật khó nhất và là điều kiện tiên quyết trước launch.

**Acceptance Criteria:**
- [ ] AI subtitle accuracy ≥95% trên 100 video test (mix có/không có subtitle gốc, có/không có AutoDub)
- [ ] EN-VI translation quality được đánh giá "tốt" hoặc "rất tốt" bởi ≥5 người dùng Việt native
- [ ] AutoDub detection: hệ thống phát hiện và xử lý đúng ≥90% video có AutoDub
- [ ] Fallback plan hoạt động khi không extract được audio gốc YouTube
- [ ] Latency subtitle generation chấp nhận được cho UX mobile (target: <3s cho video đã xử lý)

**Rủi ro:**
- Nếu không đạt ngưỡng ≥95%, cần pivot sang curated subtitle model (không launch với AI subtitle kém)
- YouTube AutoDub policy thay đổi có thể ảnh hưởng extraction pipeline

**Suggested Engineer Role:** backend-engineer (AI model integration, pipeline) + mobile-engineer (subtitle rendering)

**Dependencies:** Cần technical-brainstormer phê duyệt lựa chọn model (Whisper vs GPT-4o vs Gemini) trước khi implement. DEV-03 phụ thuộc DEV-02.

**Nguồn:** strategy-memo.md Mục 7 DEV-02; research-summary.md Mục 3c; customer-signals.md Pain Nhóm 1

---

### DEV-03: Progressive Subtitle Modes

**Mô tả:** Implement 4 chế độ phụ đề trên mobile: Full dual, Blur tiếng Việt, Delayed reveal (2-3s), Target-only (chỉ EN).

**Độ ưu tiên:** P1 — Launch differentiator.

**Acceptance Criteria:**
- [ ] Cả 4 modes hoạt động mượt trên iOS và Android
- [ ] Chuyển đổi giữa các modes không gián đoạn video playback
- [ ] Blur mode: tiếng Việt ẩn mặc định, hiện khi tap
- [ ] Delayed reveal: tiếng Việt xuất hiện sau 2-3 giây từ khi dòng tiếng Anh hiện
- [ ] Người dùng có thể lưu preference mode giữa các phiên
- [ ] `subtitle_toggle` GA4 event firing đúng khi switch mode

**Suggested Engineer Role:** mobile-engineer (iOS + Android subtitle layer) + frontend-engineer (settings UI)

**Dependencies:** DEV-02 (AI subtitle engine phải hoạt động trước). DEV-01 (tracking event `subtitle_toggle`).

**Nguồn:** strategy-memo.md Mục 7 DEV-03; competitor-landscape.md Gap C

---

### DEV-04: Context-Rich Review Loop

**Mô tả:** Review loop dùng video clip thay vì text flashcard. Khi lưu từ, save kèm: từ + câu + audio clip 5-10s + timestamp. Khi ôn tập, hiển thị lại clip video tại đúng thời điểm đó.

**Độ ưu tiên:** P1 — Launch differentiator.

**Acceptance Criteria:**
- [ ] Khi lưu từ, hệ thống tự động lưu: từ gốc + câu tiếng Anh + câu tiếng Việt + audio clip 5-10s + video_id + timestamp
- [ ] Review UI hiển thị clip video 5-10 giây khi ôn tập từ đó
- [ ] SRS scheduling hoạt động (spaced repetition interval tự động tăng khi trả lời đúng)
- [ ] `first_review_completed` GA4 event firing chính xác
- [ ] Review session hỗ trợ ≥20 từ/ngày trong tier miễn phí

**Suggested Engineer Role:** backend-engineer (SRS logic, word storage schema) + mobile-engineer (review UI + video clip playback) + database-engineer (word + context storage schema)

**Dependencies:** DEV-02 (subtitle engine), DEV-03 (subtitle layer), DEV-01 (tracking). Database schema cần design trước khi implement.

**Nguồn:** strategy-memo.md Mục 7 DEV-04; competitor-landscape.md Gap D; customer-signals.md Pain Nhóm 7

---

### DEV-05: Delay Signup Flow

**Mô tả:** Người dùng chưa đăng ký có thể xem 60 giây video mẫu + click từ tra nghĩa. Gate đăng ký chỉ xuất hiện khi người dùng muốn "lưu từ để ôn tập sau". Đăng ký qua Google/Apple một chạm (không có email form).

**Độ ưu tiên:** P1 — Launch. Experiment EXP-01 + EXP-02.

**Acceptance Criteria:**
- [ ] Người dùng chưa đăng ký có thể xem video và click tra từ tự do
- [ ] Gate đăng ký chỉ xuất hiện đúng một điểm: khi người dùng trigger "lưu từ"
- [ ] Chỉ có Google Sign-In và Apple Sign-In (không có email/password form)
- [ ] Toàn bộ signup flow hoàn thành trong ≤2 taps sau khi đã quyết định đăng ký
- [ ] `video_preview_started`, `first_word_lookup`, `signup_started`, `signup_completed` events firing đúng
- [ ] Funnel analytics track được drop-off theo từng bước

**Suggested Engineer Role:** mobile-engineer (onboarding flow) + backend-engineer (OAuth Google/Apple)

**Dependencies:** DEV-01 (tracking events phải có để đo funnel). DEV-02 (video player + subtitle phải hoạt động để có nội dung preview).

**Nguồn:** strategy-memo.md Mục 7 DEV-05; growth-opportunities.md Mục 1 EXP-01/EXP-02

---

### DEV-06: Smart Paywall Trigger System

**Mô tả:** Paywall kích hoạt dựa trên trigger cụ thể thay vì ngẫu nhiên. Pre-condition: người dùng đã lưu ≥5 từ. Mỗi trigger có copy riêng và `trigger_source` parameter.

**Độ ưu tiên:** P2 — Growth. Cần data activation từ P1 experiments trước.

**Acceptance Criteria:**
- [ ] Ít nhất 4 trigger types hoạt động: review quota exceeded, video quota exceeded, streak 7 ngày, re-engagement sau 3+ ngày
- [ ] Pre-condition enforcement: paywall KHÔNG hiện nếu người dùng chưa lưu ≥5 từ
- [ ] Mỗi trigger type có copy paywall riêng biệt
- [ ] `paywall_viewed` event firing với đúng `trigger_source` parameter
- [ ] Annual plan "Chi 1.900 đồng/ngày" được highlight (EXP-06)
- [ ] `paywall_viewed` → `subscription_started` funnel có thể đo theo trigger type

**Suggested Engineer Role:** backend-engineer (trigger logic) + mobile-engineer (paywall UI + copy variants) + frontend-engineer (web paywall nếu có)

**Dependencies:** DEV-01 (tracking), DEV-04 (review loop — cần có quota review), DEV-08 (billing architecture — cần có subscription system trước).

**Nguồn:** strategy-memo.md Mục 7 DEV-06; growth-opportunities.md Mục 3 EXP-03/EXP-06

---

### DEV-07: Referral Flow

**Mô tả:** "Gửi clip song ngữ cho bạn" — share clip + deep link → bạn nhận clip với phụ đề song ngữ → app download/open đúng video + timestamp.

**Độ ưu tiên:** P2 — Growth. Viral loop cần activation data từ P1 trước.

**Acceptance Criteria:**
- [ ] Share flow hoạt động trên iOS và Android
- [ ] Deep link mở đúng video + timestamp trong app
- [ ] Deep link fallback về App Store/Play Store nếu chưa cài app
- [ ] `invite_sent` và `referral_converted` GA4 events firing chính xác
- [ ] Attribution: referral-converted users được tag với acquisition source `referral` trong GA4

**Suggested Engineer Role:** mobile-engineer (share flow, deep link handling) + backend-engineer (deep link generation, attribution)

**Dependencies:** DEV-02 (subtitle engine), DEV-03 (subtitle modes). DEV-01 (tracking events). Người dùng phải có activation data trước để referral có ý nghĩa (sau khi DEV-04 + DEV-05 launch).

**Nguồn:** strategy-memo.md Mục 7 DEV-07; channel-scorecard.md Mục 2.5

---

### DEV-08: Pricing/Billing Transparency Architecture

**Mô tả:** Pricing page rõ ràng, nhắc gia hạn 3 ngày trước, hủy trong 2 bước, quota hiển thị ở home screen. Không dark patterns.

**Độ ưu tiên:** P1 — Launch. Trust là sản phẩm — win ngay từ ngày 1.

**Acceptance Criteria:**
- [ ] Pricing page hiển thị rõ 3 gói (Tháng/Quý/Năm) với so sánh tiết kiệm
- [ ] Notification nhắc gia hạn được gửi đúng 3 ngày trước khi subscription tự gia hạn
- [ ] Hủy subscription thực hiện được trong ≤2 bước (không ẩn nút hủy)
- [ ] Quota sử dụng (video còn lại/tuần, review còn lại/ngày) hiển thị rõ trên home screen
- [ ] Giá: Tháng 99.000 VND / Quý 240.000 VND / Năm 699.000 VND
- [ ] Không có bất kỳ dark pattern nào (không ẩn giá, không subscribe ngầm, không bẫy gia hạn)
- [ ] `subscription_started` event với `plan_type` parameter firing chính xác

**Suggested Engineer Role:** backend-engineer (subscription management, renewal logic, notification triggers) + mobile-engineer (pricing UI, quota display) + frontend-engineer (pricing web page nếu có)

**Dependencies:** DEV-01 (tracking). Cần confirm payment gateway (App Store In-App Purchase + Google Play Billing) trước khi implement. DEV-06 phụ thuộc DEV-08.

**Nguồn:** strategy-memo.md Mục 7 DEV-08; customer-signals.md Pain Nhóm 5; competitor-landscape.md Gap E

---

## Backlog Sequencing

### Phase 0 — Tracking + AI Subtitle Foundation (Tuần 1-4)

**Chạy song song. Cả hai là blockers.**

| Dev Ask | Lý do P0 | Output |
|---------|---------|--------|
| DEV-01: Tracking Infrastructure | Không có tracking = không đo được gì | Firebase SDK + 8 events P1 firing |
| DEV-02: AI Subtitle Engine | Không có subtitle = không có sản phẩm | AI subtitle ≥95% accuracy, AutoDub handled |

**Gate sang Phase 1:** DEV-01 pass DebugView validation + DEV-02 pass 100 video accuracy test.

**Rủi ro Phase 0:** Nếu DEV-02 fail ngưỡng ≥95% sau tuần 1-2 test, cần pivot sớm sang curated subtitle model và điều chỉnh timeline toàn bộ.

---

### Phase 1 — Core App Launch (Tuần 5-12)

**DEV-03, DEV-04, DEV-05, DEV-08 — chạy song song theo file ownership.**

| Dev Ask | Phụ thuộc | Output |
|---------|----------|--------|
| DEV-03: Progressive Subtitle Modes | DEV-02 done | 4 subtitle modes trên iOS + Android |
| DEV-04: Context-Rich Review Loop | DEV-02, DEV-03, database schema | SRS + video clip review |
| DEV-05: Delay Signup Flow | DEV-01, DEV-02 | Onboarding delay + social login only |
| DEV-08: Billing Transparency | DEV-01, payment gateway confirmed | Pricing page, quota display, renewal reminder |

**Gate sang Phase 2:** D7 Retention baseline đo được (cần tracking đầy đủ); EXP-01/EXP-02/EXP-03 có thể chạy (cần events P1).

---

### Phase 2 — Growth Layer (Tuần 14-20)

**DEV-06 và DEV-07 — sau khi có activation data từ Phase 1.**

| Dev Ask | Phụ thuộc | Output |
|---------|----------|--------|
| DEV-06: Smart Paywall Trigger | DEV-01, DEV-04, DEV-08 | Contextual paywall với 4+ trigger types |
| DEV-07: Referral Flow | DEV-02, DEV-03, DEV-01 | Deep link share, referral attribution |

**Điều kiện kích hoạt Phase 2:** ≥25% người dùng mới đạt Aha Moment (xem + lưu ≥5 từ + ôn tập trong 72h); có LTV baseline từ cohort 30+ ngày.

---

## Dependencies And Risks

### External Dependencies

| Phụ thuộc | Nguồn | Tác động | Kế hoạch dự phòng |
|-----------|-------|---------|------------------|
| YouTube API / subtitle extraction | External — YouTube | P0 risk: AutoDub ghi đè audio gốc | AI subtitle fallback không phụ thuộc audio gốc (DEV-02 scope) |
| App Store approval (iOS) | Apple | Timeline risk cho DEV-05, DEV-08 (billing) | Submit sớm; test với TestFlight trước |
| Google Play Billing + Apple IAP | Apple/Google | DEV-08 không launch được nếu chưa confirm | Xác nhận payment gateway trước Phase 1 |
| AI model cho subtitle (Whisper/GPT-4o/Gemini) | Vendor (OpenAI/Google) | Cost, latency, accuracy, rate limits | Đánh giá kỹ với technical-brainstormer trước khi commit |
| EN-VI translation quality | AI model + human QA | Người học Việt có baseline cao từ Toomva — subtitle sai là mất trust ngay | Human QA review trên 100 video test trước launch |

### Internal Dependencies

| Phụ thuộc | Tác động | Hành động |
|-----------|---------|-----------|
| AI subtitle accuracy ≥95% | Điều kiện tiên quyết trước launch — nếu fail, không launch | Test sớm tuần 1-2; escalate ngay nếu <95% |
| Database schema cho word + context storage | DEV-04 không implement được nếu schema chưa design | database-engineer design schema trước khi DEV-04 start |
| GA4 credentials (GA4_ACCESS_TOKEN, GA4_PROPERTY_ID) | DEV-01 không validate được nếu chưa có | Cấu hình trước khi DEV-01 start |
| Payment gateway decision (App Store IAP vs. third-party) | DEV-08 phụ thuộc | PM cần confirm với stakeholder trước Phase 1 |

### Critical Path

```
DEV-01 (tracking) ──────────────────────────────────────────────→ EXP-01/02/03 experiments
DEV-02 (AI subtitle) → DEV-03 (progressive sub) ──────────────→ Core app launch
                     → DEV-04 (review loop) → DEV-06 (paywall)
DEV-05 (delay signup) ──────────────────────────────────────────→ Core app launch
DEV-08 (billing) ────────────────────────────────────────────── → DEV-06 (paywall)
```

**Parallel-safe lanes:**
- DEV-01 || DEV-02 (chạy song song tuần 1-4)
- DEV-03 || DEV-04 || DEV-05 || DEV-08 (chạy song song tuần 5-12 với file ownership riêng)
- DEV-06 || DEV-07 (chạy song song tuần 14-20)

---

## Tracking And Validation Needs

### GA4 Events Bắt Buộc (theo thứ tự ưu tiên)

| Event | Parameters | Dùng cho | Ưu tiên |
|-------|-----------|---------|---------|
| `video_preview_started` | `video_id`, `source_channel` | Funnel đầu vào, EXP-01 | P1 |
| `first_word_lookup` | `word`, `video_id`, `video_position_sec` | Aha moment #1, EXP-01 | P1 |
| `first_word_saved` | `word`, `video_id`, `deck_id` | Activation milestone 1, EXP-07 | P1 |
| `first_review_completed` | `deck_id`, `word_count`, `accuracy_pct` | Activation milestone 2, EXP-03 | P1 |
| `paywall_viewed` | `trigger_source`, `user_session_count`, `words_saved_count` | Paywall optimization, EXP-03/06 | P1 |
| `subscription_started` | `plan_type` (monthly/quarterly/annual), `trigger_source` | Monetization, plan mix | P1 |
| `streak_day_achieved` | `streak_days` | Retention, EXP-04 | P2 |
| `push_notification_opened` | `notification_type` (spaced_rep/streak_reminder/marketing) | Retention, EXP-08 | P2 |

### Định nghĩa Funnel Chính

```
Cài đặt App
    ↓ [Target: <30% drop-off]
signup_completed
    ↓ [Target: <25% drop-off]
first_video_watched (≥50% completion)
    ↓ [Target: <40% drop-off]
first_word_saved
    ↓ [Target: <50% drop-off]
first_review_completed
    ↓ [Target: <60% drop-off]
subscription_started
```

**Benchmark ngành:** Install → paid: 2-5%. Mục tiêu eUp: 3-6% (có SRS + bilingual video).

### Định nghĩa Aha Moment

> Người dùng xem ít nhất 1 video (≥70% completion) + lưu ≥5 từ + hoàn thành ít nhất 1 phiên ôn tập **trong vòng 72 giờ đầu**.

Người dùng đạt milestone này có xác suất retention tuần 2 cao hơn ~3x.

**Event tracking Aha Moment:** `aha_moment_reached` với parameters `session_number`, `days_since_signup`, `activation_path`

### KPI Targets

| Chỉ số | Benchmark ngành | Target eUp |
|--------|----------------|-----------|
| D1 Retention | 30-40% | >35% |
| D7 Retention | 15-25% | >20% |
| D30 Retention | 8-15% | >12% |
| Video completion rate (≥70%) | 40-60% | >55% |
| Word taps per video session | 3-8 | >5 |
| Install → Trial | 5-12% | >8% |
| Trial → Paid | 20-40% | >30% |
| Paywall → Subscription | — | >8% |

### Experiment Readiness Checklist

| Experiment | Events cần có | Sẵn sàng khi |
|-----------|--------------|-------------|
| EXP-01 (Delay Signup) | `video_preview_started`, `first_word_lookup`, `signup_completed` | DEV-01 + DEV-05 done |
| EXP-02 (Social Login Only) | `signup_started`, `signup_completed` (với `method` parameter) | DEV-01 + DEV-05 done |
| EXP-03 (Triggered Paywall) | `paywall_viewed` + `trigger_source`, `first_review_completed` | DEV-01 + DEV-04 + DEV-06 done |
| EXP-08 (Push Notification) | `push_notification_opened` + `notification_type` | DEV-01 + DEV-04 done |

---

## Suggested Ownership

### Phân công theo role (không chồng chéo file ownership)

| Dev Ask | Owner Role | File/System Scope |
|---------|-----------|------------------|
| DEV-01: Tracking Infrastructure | mobile-engineer (Firebase) + backend-engineer (server-side) | Firebase config, tracking service, UTM attribution |
| DEV-02: AI Subtitle Engine | backend-engineer | AI pipeline, subtitle generation service, AutoDub detection |
| DEV-03: Progressive Subtitle Modes | mobile-engineer | Subtitle rendering layer, mode switching UI |
| DEV-04: Context-Rich Review Loop | backend-engineer (SRS logic) + database-engineer (schema) + mobile-engineer (review UI) | SRS service, word/context DB schema, review screen |
| DEV-05: Delay Signup Flow | mobile-engineer | Onboarding flow, OAuth integration |
| DEV-06: Smart Paywall Trigger | backend-engineer (trigger logic) + mobile-engineer (paywall UI) | Trigger service, paywall screens |
| DEV-07: Referral Flow | mobile-engineer (deep link) + backend-engineer (link generation, attribution) | Deep link service, share UI, attribution |
| DEV-08: Billing Transparency | backend-engineer (subscription, renewal) + mobile-engineer (pricing UI, quota) | Subscription service, pricing screens, push notification for renewal |

**Lưu ý ownership:**
- `backend-engineer` sở hữu: AI pipeline (DEV-02), SRS service (DEV-04), trigger service (DEV-06), deep link + attribution service (DEV-07), subscription service (DEV-08)
- `mobile-engineer` sở hữu: subtitle rendering (DEV-03), review UI (DEV-04), onboarding flow (DEV-05), paywall screens (DEV-06), share UI (DEV-07), pricing/quota UI (DEV-08)
- `database-engineer` sở hữu: word + context storage schema (DEV-04), subscription + user schema
- Nếu chỉ có 1 backend engineer và 1 mobile engineer: implement theo phase (Phase 0 → Phase 1 → Phase 2) để tránh context switch

---

## Task Packet Seeds

*Mỗi seed dưới đây là đầu vào để implementation-planner viết task-graph.json.*

---

### Seed 1: Tracking Foundation

**Phase:** 0
**Owner Role:** mobile-engineer + backend-engineer
**Depends On:** GA4_ACCESS_TOKEN + GA4_PROPERTY_ID được cấu hình
**Artifacts:** Firebase SDK integrated, 8 GA4 events P1 firing, funnel visualization in GA4
**Acceptance Criteria:** 8 events P1 visible in GA4 DebugView với đúng parameters; funnel Explore report hoạt động; iOS ATT + cross-platform dedup handled
**Validation:** ga4-analyst chạy preset `event-breakdown` và `learner-journey-funnel` để confirm instrumentation coverage

---

### Seed 2: AI Subtitle Engine + EN-VI Quality Gate

**Phase:** 0
**Owner Role:** backend-engineer
**Depends On:** technical-brainstormer phê duyệt model selection (Whisper vs GPT-4o vs Gemini)
**Artifacts:** Subtitle generation service, AutoDub detection, EN-VI translation pipeline
**Acceptance Criteria:** Accuracy ≥95% trên 100 video test; ≥5 người dùng Việt đánh giá "tốt" hoặc "rất tốt"; AutoDub fallback hoạt động
**Validation:** Human QA review 100 video test set trước khi Phase 1 bắt đầu; nếu fail < 95%, escalate ngay — không sang Phase 1

---

### Seed 3: Core Video Player + Dual Subtitle Display

**Phase:** 1
**Owner Role:** mobile-engineer
**Depends On:** Seed 2 (AI subtitle engine)
**Artifacts:** Mobile video player (iOS + Android), dual subtitle rendering, tap-to-translate popup
**Acceptance Criteria:** Video playback mượt; dual subtitle hiển thị đúng; tap-to-translate mở popup trong <300ms
**Validation:** Manual QA trên 10 video YouTube thực với và không có subtitle gốc

---

### Seed 4: Database Schema — Word + Context Storage

**Phase:** 1 (thiết kế trước implementation)
**Owner Role:** database-engineer
**Depends On:** Seed 2 (subtitle structure), Seed 3 (video player)
**Artifacts:** Schema cho word, context, audio_clip, review_card tables
**Acceptance Criteria:** Schema hỗ trợ lưu: từ + câu EN + câu VI + audio_clip_url + video_id + timestamp; query review card theo SRS schedule hiệu quả
**Validation:** Schema review bởi backend-engineer trước khi implement DEV-04

---

### Seed 5: Progressive Subtitle Modes

**Phase:** 1
**Owner Role:** mobile-engineer
**Depends On:** Seed 2 (subtitle engine), Seed 3 (video player)
**File Ownership:** subtitle rendering module (không chồng với Seed 3 — tách module riêng)
**Acceptance Criteria:** 4 modes hoạt động, không gián đoạn playback, preference được lưu
**Validation:** Manual test 4 modes trên iOS + Android real devices; `subtitle_toggle` event firing

---

### Seed 6: Context-Rich Review Loop + SRS

**Phase:** 1
**Owner Role:** backend-engineer (SRS) + mobile-engineer (review UI)
**Depends On:** Seed 4 (database schema)
**Artifacts:** SRS service, review session API, review screen UI
**Acceptance Criteria:** Review hiển thị video clip 5-10s; SRS interval tự động điều chỉnh; `first_review_completed` event firing
**Validation:** Review flow manual test với 5 từ đã lưu; SRS schedule verify bằng unit tests

---

### Seed 7: Delay Signup + Social Login

**Phase:** 1
**Owner Role:** mobile-engineer
**Depends On:** Seed 1 (tracking), Seed 3 (video player)
**File Ownership:** onboarding module — riêng biệt với video player module
**Acceptance Criteria:** Guest xem 60s + click từ; gate chỉ ở "lưu từ"; Google + Apple login; toàn bộ funnel events firing
**Validation:** A/B test setup sẵn sàng cho EXP-01/02; funnel drop-off visible trong GA4

---

### Seed 8: Billing + Subscription Architecture

**Phase:** 1
**Owner Role:** backend-engineer (subscription service) + mobile-engineer (pricing UI)
**Depends On:** Payment gateway confirmed (App Store IAP + Google Play Billing)
**Artifacts:** Subscription service, renewal notification, pricing screen, quota tracker
**Acceptance Criteria:** 3 gói giá hiển thị đúng; nhắc gia hạn 3 ngày trước; hủy trong 2 bước; quota ở home screen; no dark patterns
**Validation:** End-to-end subscription flow test trên sandbox; `subscription_started` event với `plan_type` firing

---

### Seed 9: Smart Paywall Trigger System

**Phase:** 2
**Owner Role:** backend-engineer (trigger) + mobile-engineer (paywall UI)
**Depends On:** Seed 1 (tracking), Seed 6 (review loop — quota), Seed 8 (subscription), activation data từ Phase 1
**Artifacts:** Trigger service, paywall UI với 4+ variants, GA4 attribution
**Acceptance Criteria:** 4 trigger types; pre-condition ≥5 từ enforce; `paywall_viewed` với `trigger_source` firing; annual plan highlighted
**Validation:** Staged rollout; kiểm tra paywall không xuất hiện trước khi đủ activation

---

### Seed 10: Referral + Deep Link Flow

**Phase:** 2
**Owner Role:** mobile-engineer (share UI, deep link) + backend-engineer (link generation, attribution)
**Depends On:** Seed 2 (subtitle), Seed 3 (video player), Seed 1 (tracking), activation data từ Phase 1
**Artifacts:** Deep link service, share UI, referral attribution
**Acceptance Criteria:** Share flow iOS + Android; deep link mở đúng video + timestamp; `invite_sent` + `referral_converted` events firing
**Validation:** End-to-end test: share → install fresh app → deep link mở đúng video

---

## Open Questions

*Những câu hỏi này cần được trả lời trước hoặc trong khi Phase 0 diễn ra. PM cần escalate cho stakeholder phù hợp.*

| # | Câu hỏi | Người trả lời | Cần trước |
|---|---------|--------------|----------|
| Q1 | Payment gateway: App Store IAP + Google Play Billing only, hay có third-party (Stripe/PayOS)? Quyết định ảnh hưởng đến DEV-08 architecture hoàn toàn. | Stakeholder / Legal | Phase 1 start |
| Q2 | AI model cho subtitle: Budget cho AI inference là bao nhiêu/tháng? Có ảnh hưởng đến model selection (Whisper self-hosted vs. API call). | Stakeholder / Finance | Phase 0, trước khi technical-brainstormer đánh giá |
| Q3 | Human QA cho EN-VI subtitle: Có sẵn 5 người dùng Việt native để review 100 video test không? Hay cần tuyển? | PM / Ops | Phase 0 tuần 1 |
| Q4 | GA4 credentials: GA4_ACCESS_TOKEN và GA4_PROPERTY_ID sẽ được cấu hình vào khi nào? DEV-01 bị block nếu không có. | DevOps / GA4 Admin | Trước khi DEV-01 start |
| Q5 | Mobile codebase hiện tại: Flutter hay React Native hay native iOS/Android? Ảnh hưởng đến estimate tất cả mobile dev asks. | codebase-scout | Trước khi implementation-planner viết plan |
| Q6 | Subtitle storage: Lưu subtitle trên server hay generate on-device? Ảnh hưởng đến bandwidth cost và offline support. | technical-brainstormer | Phase 0 |
| Q7 | YouTube URL support: App có hỗ trợ paste YouTube URL bất kỳ (BYO media), hay chỉ curated list? Ảnh hưởng đến DEV-02 scope. | Stakeholder | Phase 0 |
| Q8 | Offline support: Review loop có cần hoạt động offline không (đặc biệt cho thị trường VN với kết nối không ổn định)? | Stakeholder | Phase 1 design |

---

## Handoff Summary

### Ai cần đọc artifact này tiếp theo

| Vai trò | Việc cần làm | Artifact cần đọc |
|---------|-------------|-----------------|
| **codebase-scout** | Map codebase hiện tại: tìm video player foundation, subtitle rendering, tracking setup, authentication, billing hiện có nếu đã có | Dev-intake này (Mục Scoped Dev Asks) + strategy-memo.md Mục 7 |
| **technical-brainstormer** | Đánh giá trade-off kỹ thuật cho: (a) AI model cho subtitle engine (Whisper/GPT-4o/Gemini), (b) SRS architecture, (c) deep link solution | Dev-intake này (DEV-02, DEV-04, DEV-07) + strategy-memo.md Mục 7 |
| **implementation-planner** | Viết plan.md + task-graph.json + ownership-matrix.md từ Task Packet Seeds | Dev-intake này toàn bộ + output từ codebase-scout + technical-brainstormer |
| **ga4-analyst** | Validate tracking plan và confirm 8 events P1 sau khi GA4 credentials được cấu hình | Dev-intake Mục Tracking; ga4-insights.md |

### Điều kiện để implementation-planner bắt đầu

- [ ] codebase-scout đã map codebase và output scout report
- [ ] technical-brainstormer đã đánh giá và recommend: AI subtitle model + SRS architecture + deep link solution
- [ ] PM đã có câu trả lời cho Q1 (payment gateway), Q4 (GA4 credentials), Q5 (mobile framework)
- [ ] Stakeholder đã confirm ngưỡng ≥95% subtitle accuracy là điều kiện tiên quyết trước launch

---

**Status:** DONE
**Summary:** Dev-intake packet hoàn chỉnh với 8 DEV asks (DEV-01 đến DEV-08), sequencing 3-phase, 10 task packet seeds sẵn sàng để implementation-planner viết task-graph.json, và 8 open questions cần stakeholder confirm trước khi plan được viết. Hai blocker quan trọng nhất: GA4 tracking infrastructure (DEV-01) và AI subtitle engine accuracy ≥95% (DEV-02) — cả hai phải pass trước khi Phase 1 bắt đầu.
**Next Handoff:** codebase-scout (map codebase) + technical-brainstormer (evaluate AI subtitle model, SRS architecture, deep link solution) — chạy song song, sau đó implementation-planner tổng hợp để viết plan.md
