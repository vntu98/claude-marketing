# Strategy Memo: Ung Dung Hoc Tieng Anh Qua Video Phu De Song Ngu

**Ngay:** 2026-04-01
**Tac gia:** marketing-strategist
**Pham vi:** Chien luoc thi truong, dinh vi, kenh phan phoi, thi nghiem, yeu cau dev — app hoc tieng Anh qua video song ngu cua eUp
**Du an viet tat:** bilingual-video-english
**Bang chung co so:** 8 artifacts tai `reports/research/20260401-bilingual-video-english/`

---

## Muc Luc

1. [Tom Tat Dieu Hanh](#1-tom-tat-dieu-hanh)
2. [Doi Tuong Muc Tieu](#2-doi-tuong-muc-tieu)
3. [Dinh Vi San Pham](#3-dinh-vi-san-pham)
4. [Uu Tien Kenh Phan Phoi](#4-uu-tien-kenh-phan-phoi)
5. [Thi Nghiem Uu Tien](#5-thi-nghiem-uu-tien)
6. [Ghi Chu Do Luong](#6-ghi-chu-do-luong)
7. [Yeu Cau Dev Cu The](#7-yeu-cau-dev-cu-the)
8. [PM Intake Packet](#8-pm-intake-packet)
9. [Ban Giao Vai Tro](#9-ban-giao-vai-tro)

---

## 1. Tom Tat Dieu Hanh

### Co hoi

Phan khuc hoc tieng Anh qua video song ngu dang tang truong nhanh nhung **chua co app nao so huu day du ket hop**: mobile-first + BYO media + AI subtitle chinh xac + review loop chat che + trust tot (competitor-landscape.md, Muc 8). Nguoi hoc Viet Nam da co ky vong cao ve phu de song ngu Anh-Viet tu Toomva (2013) va StudyPhim, nhung ca hai deu la web-only, khong co SRS, va chat luong phu de khong dong deu (research-summary.md, Muc 3a).

### Rui ro chinh

1. **AI subtitle accuracy la dieu kien song con** — neu phu de AI sai, core promise cua san pham vo ngay lap tuc. Miraa va Trancy deu dang bi nguoi dung than phien ve van de nay (customer-signals.md, Pain Nhom 1).
2. **Trancy dang positioning aggressive nhu "Language Reactor Pro + mobile"** — feature velocity cao, gia thap ($3.49/thang), va dang keo dung user segment tuong tu (competitor-landscape.md, Muc 12 Threats).
3. **YouTube AutoDub dang pha vo subtitle extraction** — tao rui ro he thong cho bat ky app nao phu thuoc vao audio goc cua YouTube (research-summary.md, Muc 3c).
4. **Tracking infrastructure chua co** — 8 GA4 events can thiet cho P1 experiments chua duoc implement; day la blocker cho moi thi nghiem tang truong (growth-opportunities.md, Muc 7; ga4-insights.md, Muc 5).

### Quyet dinh chien luoc

eUp nen **tham nhap thi truong Viet Nam truoc** voi positioning sac net: app mobile-first hoc tieng Anh qua video song ngu Anh-Viet, khac biet bang subtitle chinh xac + progressive subtitle modes + review loop bam sat video moment + billing minh bach. Day la wedge tot nhat vi:
- Gap EN-VI quality chua ai khai thac tot (competitor-landscape.md, Gap F)
- eJOY — doi thu truc tiep nhat tai VN — dang loang product thesis (competitor-landscape.md, Muc 6)
- Pricing ky vong tai VN thap ($3-6/thang), phu hop voi mo hinh freemium + content gate (competitor-landscape.md, Muc 7)

---

## 2. Doi Tuong Muc Tieu

### Persona chinh: Nguoi hoc tieng Anh Viet Nam 18-35 tuoi, mobile-first

**Dac diem:**
- Da xem YouTube tieng Anh 30+ phut/ngay nhung cam thay "xem nhung khong nho duoc tu" (customer-signals.md, Pain Nhom 7)
- Muon "vua hoc vua giai tri" — khong phai hoc bai theo kieu truyen thong (customer-signals.md, JTBD "Hoc tieng Anh trong luc thu gian")
- Smartphone la thiet bi hoc chinh — desktop extension khong du portable (customer-signals.md, Pain Nhom 2)
- Da quen voi phu de song ngu Anh-Viet tu Toomva/StudyPhim/eJOY (research-summary.md, Muc 3a)
- Nham cam voi billing khong minh bach — Cake subscription tu gia han khong nhac nhung la pain that (customer-signals.md, Pain Nhom 5)

**Trigger chuyen doi dien hinh:**
- Chan Duolingo vi gamification khong tao real-world progress (customer-signals.md, Trigger Events)
- Da thu tai lieu/khoa hoc dai nhung muon cach hoc nhe hon, thuc dung hon (quote-bank.md, "Are you tired of lengthy English courses?")
- Muon cai thien listening + vocabulary cung luc ma khong mo nhieu app (customer-signals.md, JTBD Functional)

**Nhu cau co so (JTBD loi — do tin cay High):**
1. Xem noi dung that — khong phai lesson dong goi (research-summary.md, Muc 7)
2. Hieu ngay khi bi — khong gian doan flow (customer-signals.md, JTBD Functional)
3. Luu thu dang nho — co ngu canh, khong phai list tu roi rac (customer-signals.md, JTBD Functional)
4. Luyen lai dung luc — SRS/review bam sat moment vua hoc (research-summary.md, Muc 7)

### Persona phu: Nguoi hoc ngoai VN muon hoc tieng Anh qua video (phase 2)

- Phan khuc nay chi duoc nhap khi VN market product-market fit da duoc xac nhan
- Khi mo rong, can ho tro them cac cap ngon ngu khac (EN-JP, EN-KR, EN-ZH)

**Trade-off:** Tap trung vao EN-VI truoc co nghia la tu choi luong quoc te trong giai doan dau. Day la dung vi EN-VI la thi truong co gap lon nhat va ky vong da duoc train boi Toomva/StudyPhim. Mo rong som se loang positioning giong nhu eJOY dang gap phai.

---

## 3. Dinh Vi San Pham

### Cot loi gia tri

> **"Xem video tieng Anh that, hieu ngay khi bi, luu cai dang nho, luyen dung luc — tat ca tren dien thoai."**

Day la ban dich truc tiep cua JTBD loi duoc xac nhan tu nhieu nguon (research-summary.md, customer-signals.md, quote-bank.md).

### Dinh vi so voi doi thu

| Doi thu | Ho hoi | eUp khac biet |
|---------|--------|---------------|
| Duolingo | "Gamified language learning" | eUp: hoc tu noi dung that, khong phai bai tap nhau tao |
| eJOY | "YouTube thanh lesson EN-VI" | eUp: focus sac hon (khong loang thanh "ultimate knowledge tool"), progressive subtitle modes, review loop bam sat video moment |
| Trancy | "AI immersion tren nhieu platform" | eUp: EN-VI quality cao hon (khong chi dua vao AI translation chung chung), billing minh bach, mobile UX tot hon (Trancy iPad yeu — competitor-landscape.md, Muc 10) |
| Miraa | "Import media + AI subtitle + shadow" | eUp: review loop manh hon (Miraa khong co SRS — competitor-landscape.md, Feature Matrix), EN-VI native |
| FluentU | "Curated videos + full learning engine" | eUp: BYO media (khong bi gioi han catalog), gia phu hop VN ($4 vs $30/thang) |
| Language Reactor | "Dual sub mien phi tren Chrome" | eUp: mobile-first (LR hoan toan khong co mobile — competitor-landscape.md, Muc 11), co review loop |

### Positioning statement (cho internal alignment)

> Cho nguoi Viet hoc tieng Anh qua video, [ten san pham] la app mobile duy nhat ket hop phu de song ngu Anh-Viet chinh xac, progressive subtitle modes (blur/delayed reveal/target-only), va review loop bam sat video moment — de ban vua giai tri vua tien bo that su, khong lo billing bat ngo.

### Ngon ngu can dung (tu customer-signals.md, Muc 6):
- "hoc tieng Anh qua phim", "phu de song ngu Anh-Viet"
- "vua hoc vua giai tri", "moi luc moi noi"
- "xem di xem lai", "replay tung cau"
- "khong phai hoc bai nhu o truong"

### Ngon ngu KHONG dung (tu eup-context.md, Brand Voice):
- "Thanh thao ngay", "dam bao diem cao", "hoc khong can co gang"
- Bat ky con so ve user/download chua duoc phe duyet cong khai

---

## 4. Uu Tien Kenh Phan Phoi

Xep hang dua tren channel-scorecard.md (diem tong, CAC, phu hop san pham) ket hop voi competitor visibility va giai doan san pham.

### Thu tu uu tien: ASO > TikTok Organic > YouTube Organic > SEO > Referral > Paid UA (sau)

| Uu tien | Kenh | Diem | Ly do chinh | Hanh dong dau tien |
|---------|------|------|-------------|---------------------|
| 1 | **ASO** | 20/25 | 60-70% installs EdTech tu organic store search; cum tu khoa "hoc tieng Anh qua phim", "hoc tieng Anh qua video song ngu" chua bi chiem (channel-scorecard.md, Muc 2.1; ga4-insights.md keyword cluster) | Toi uu title/subtitle App Store voi keywords muc tieu; A/B test screenshots; video preview demo dual subtitle; localize metadata tieng Viet |
| 2 | **TikTok / Reels Organic** | 20/25 | Format ngan phu hop demo product; algorithm uu ai educational content; @duolingo da chung minh social organic drive millions downloads (channel-scorecard.md, Muc 2.4) | 3-5 posts/tuan; format "Hoc 1 tu tieng Anh tu clip [phim noi tieng]"; collab micro-influencers VN 50K-500K followers |
| 3 | **YouTube Organic** | 19/25 | YouTube la cong cu hoc tieng Anh so 1 tai VN; series "clip song ngu" chua ai lam bai ban (channel-scorecard.md, Muc 2.2); Dreaming Spanish 1.8M subs da chung minh model | Channel series 3-5 phut: clip thuc + breakdown tu vung song ngu; SEO YouTube title/description/chapters |
| 4 | **SEO (Organic Search)** | 18/25 | Khong ai so huu "hoc tieng Anh qua video song ngu" cluster (channel-scorecard.md, Muc 2.3; ga4-insights.md keyword signal) | Blog strategy: top-of-funnel content comprehensible input; comparison pages "App hoc tieng Anh tot nhat cho nguoi Viet 2026" |
| 5 | **Referral / Word-of-Mouth** | 19/25 | CAC = $0; LTV referred users cao hon 25-35%; viral coefficient language apps ~0.3-0.5 (channel-scorecard.md, Muc 2.5) | Thiet ke referral flow sau first_video_watched; "Gui clip song ngu cho ban" la viral loop tu nhien |
| 6 | **Paid UA (Meta/TikTok/Apple Search)** | 17-18/25 | Chi scale sau khi co LTV benchmark tu organic cohorts (30+ ngay data) | Test creative da proven viral tu TikTok organic; Apple Search Ads exact match cho top keywords truoc |

**Kenh KHONG uu tien giai doan dau:**
- B2B/Edu Partnerships (15/25) — sales cycle dai, can team/admin dashboard chua co, khong phu hop early stage (channel-scorecard.md, Muc 2.8). Defer den khi co 50K+ MAU.
- Paid UA lon — khong chi tieu lon truoc khi co LTV benchmark ro rang (channel-scorecard.md, Muc 6, canh bao quan trong).

**Trade-off:** TikTok organic can consistency cao (3-5x/tuan) va virality kho du doan. Nhung doi voi san pham video-first, noi dung TikTok chinh la product demo — chi phi san xuat thap vi co the tai su dung clip tu chinh app.

---

## 5. Thi Nghiem Uu Tien

Rut tu growth-opportunities.md (12 experiments), xep hang theo tac dong x toc do x do tin cay x do phuc tap. Chi P1 va P2 noi day; P3-P4 defer.

### P1 — Thang 1-2 (Can tracking infrastructure truoc)

| ID | Ten | Gia thuyet | Tieu chi thanh cong | Blocker |
|----|-----|-----------|---------------------|---------|
| EXP-01 | **Delay Signup — "Choi Truoc Dang Ky Sau"** | Cho xem 60 giay video + click 1 tu truoc khi yeu cau dang ky → tang `signup_completed` 15-25% | Signup completion rate tang >15% so voi control (gate ngay) | `video_preview_started`, `first_word_lookup` events chua co |
| EXP-02 | **Social Login Only (Google + Apple)** | Bo email/password form, chi giu Google & Apple sign-in → tang signup completion 20-30% | `signup_started` → `signup_completed` funnel tang >20% | Khong co blocker lon |
| EXP-03 | **Triggered Paywall sau First Review** | Hien paywall sau khi hoan thanh mini-review dau tien (khong phai ngau nhien) → tang paywall→subscription conversion 30% | `paywall_viewed` → `subscription_started` tang >25% theo trigger source | `paywall_viewed` + `trigger_source`, `first_review_completed` events can co |
| EXP-08 | **"3 Tu Sap Quen" Push Notification** | Push "Co 3 tu sap bi quen — on tap 2 phut" → tang daily active review rate 25% | Daily review rate tang >20%; D7 retention cai thien | `push_notification_opened` + `notification_type` event can co |

### P2 — Thang 2-3 (Habit + Monetization)

| ID | Ten | Gia thuyet | Tieu chi thanh cong |
|----|-----|-----------|---------------------|
| EXP-04 | **Streak Wager** | Dat cuoc premium credits vao streak (giu 7 ngay = thuong; mat = mat cuoc) → tang D14 retention 10-15% | D14 retention tang >10% o nhom thi nghiem |
| EXP-05 | **Word Cloud Progress** | Hien thi word cloud tren home screen → tang session frequency thang dau 20% | Monthly session frequency tang >15% |
| EXP-06 | **Annual Plan Spotlight** | Highlight goi nam "Chi 1.900 dong/ngay" o paywall → tang ti le chon annual 25% | Annual plan selection rate tang >20%; LTV trung binh tang |
| EXP-07 | **Content-Personalized Onboarding** | Chon 3 chu de video trong onboarding → tang `first_word_saved` rate 30% | `first_word_saved` rate tang >25% |

### Dieu kien tien quyet chung cho tat ca experiments

> **8 GA4 events can implement truoc khi bat ky experiment nao chay duoc** (growth-opportunities.md, Muc 7):
> `video_preview_started`, `first_word_lookup`, `first_word_saved`, `first_review_completed`, `paywall_viewed` (voi `trigger_source`), `subscription_started` (voi `plan_type`), `streak_day_achieved`, `push_notification_opened` (voi `notification_type`)

Day la **blocker so 1** cho toan bo growth stack.

---

## 6. Ghi Chu Do Luong

### Tinh trang hien tai

- **GA4 credentials chua co** — `GA4_ACCESS_TOKEN` va `GA4_PROPERTY_ID` chua duoc cau hinh (ga4-insights.md, Muc 1)
- Toan bo framework trong ga4-insights.md la benchmark-based, chua validate voi data thuc
- Khong co visibility vao subtitle preference journey, paywall impressions, notification opt-in rate (ga4-insights.md, Muc 5)

### Uu tien implement tracking (tu ga4-insights.md, Roadmap)

| Phase | Thoi gian | Noi dung |
|-------|-----------|----------|
| Phase 1 — Foundation | Tuan 1-2 | Firebase SDK, enhanced measurement, 5 core conversion events (`purchase_completed`, `trial_started`, `aha_moment_reached`, `first_video_watched`, `signup_completed`) |
| Phase 2 — Video + Vocab | Tuan 3-4 | `video_*`, `word_*`, `subtitle_*` events; validate voi event-breakdown preset |
| Phase 3 — Funnel + Review | Tuan 5-6 | Review events, funnel visualization; baseline measurement |
| Phase 4 — Monetization | Tuan 7-8 | Paywall events, purchase flow, trial tracking; first LTV cohort |
| Phase 5 — Optimization | Thang 3+ | A/B test integration, BigQuery export, notification attribution |

### Funnel chinh can do (tu ga4-insights.md, Muc 3.1)

```
Cai dat → Signup → Onboarding → First Video (>=50%) → First Word Saved → First Review → Subscription
```

**Benchmark nganh:** Install → paid subscription EdTech mobile: 2-5%. Muc tieu cho bilingual video voi SRS: 3-6%.

### Dinh nghia Aha Moment (tu ga4-insights.md, Muc 3.3)

> Nguoi dung xem it nhat 1 video (>=70% completion) + luu >=5 tu + hoan thanh it nhat 1 phien on tap **trong vong 72 gio dau**.

Nguoi dung dat milestone nay co xac suat retention tuan 2 cao hon ~3x.

### KPI muc tieu (tu ga4-insights.md, channel-scorecard.md)

| Chi so | Benchmark nganh | Muc tieu eUp |
|--------|-----------------|--------------|
| D1 Retention | 30-40% | >35% |
| D7 Retention | 15-25% | >20% |
| D30 Retention | 8-15% | >12% |
| Video completion rate (>=70%) | 40-60% | >55% |
| Word taps per video session | 3-8 | >5 |
| Install → Trial | 5-12% | >8% |
| Trial → Paid | 20-40% | >30% |
| Paywall → Subscription | — | >8% |

### Rui ro do luong

- **iOS ATT:** ~50-60% nguoi dung tu choi tracking → can server-side events hoac SKAdNetwork cho paid UA (ga4-insights.md, Muc 7.1)
- **Cross-platform dedup:** Neu dung ca Firebase (mobile) va gtag.js (web), can `client_id` mapping nhat quan (ga4-insights.md, Muc 7.1)
- **UTM convention:** Ap dung UTM taxonomy chuan tu channel-scorecard.md, Muc 4 de dam bao attribution sach

---

## 7. Yeu Cau Dev Cu The

Moi yeu cau ben duoi duoc rut tu bang chung nghien cuu va xep hang theo muc do anh huong den chien luoc.

### DEV-01: Tracking Infrastructure (BLOCKER — P0)

**Mo ta:** Implement 8 GA4 events P1 + Firebase SDK + enhanced measurement + conversion events.
**Ly do:** Khong co tracking, khong chay duoc bat ky experiment tang truong nao. Day la blocker so 1 cho toan bo growth stack (growth-opportunities.md, Muc 7; ga4-insights.md, Muc 5).
**Scope:** ga4-insights.md Roadmap Phase 1-2 (Tuan 1-4).
**Tieu chi chap nhan:** 8 events P1 firing chinh xac trong GA4 DebugView; funnel visualization hoat dong.

### DEV-02: AI Subtitle Engine voi AutoDub Resilience (P0)

**Mo ta:** Xay dung subtitle engine co the: (a) generate AI subtitle khi video khong co subtitle goc, (b) phat hien va xu ly YouTube AutoDub ghi de audio goc, (c) hien thi subtitle song ngu Anh-Viet voi do chinh xac cao.
**Ly do:** Subtitle accuracy la dealmaker/dealbreaker. YouTube AutoDub dang tao friction moi cho Miraa va cac app phu thuoc audio goc (research-summary.md, Muc 3c; customer-signals.md, Pain Nhom 1). Nguoi hoc Viet da co baseline cao tu Toomva — phu de sai la mat trust ngay (research-summary.md, Muc 7, diem 7).
**Tieu chi chap nhan:** AI subtitle accuracy >=95% tren 100 video test (mix co/khong co subtitle goc, co/khong co AutoDub); EN-VI translation quality duoc danh gia boi 5 nguoi dung Viet.
**Rui ro:** Day la yeu cau ky thuat kho nhat. Neu khong dat, core promise cua san pham se vo.

### DEV-03: Progressive Subtitle Modes (P1)

**Mo ta:** Implement 4 che do phu de: (1) Full dual (Anh-Viet), (2) Blur tieng Viet (hien khi tap), (3) Delayed reveal (hien sau 2-3 giay), (4) Target-only (chi tieng Anh).
**Ly do:** Khong ai co UX tot cho progressive subtitle tren mobile (competitor-landscape.md, Gap C). Day la differentiator ky thuat co the defend. Nguoi dung o level trung binh khong muon nhin 2 hang subtitle mai mai (customer-signals.md, Pain Nhom 3).
**Tieu chi chap nhan:** 4 modes hoat dong muot tren iOS va Android; chuyen doi giua cac mode khong gian doan video playback.

### DEV-04: Context-Rich Review Loop (P1)

**Mo ta:** Khi nguoi dung luu tu, save kem: tu + cau + ngu canh + audio moment + timestamp trong video. Review loop hien lai clip video khi on tap, khong chi flashcard text.
**Ly do:** Hau het app save word nhung mat context — hoc roi rac, khong bam sat video moment (competitor-landscape.md, Gap D; customer-signals.md, Pain Nhom 7). Day la khoang trong lon nhat trong category.
**Tieu chi chap nhan:** Khi on tap, nguoi dung thay lai clip video 5-10 giay tai thoi diem ho luu tu; accuracy recall test cho thay cai thien so voi text-only flashcard.

### DEV-05: Delay Signup Flow (P1)

**Mo ta:** Cho phep nguoi dung xem 60 giay video mau + click vao tu de tra nghia truoc khi yeu cau dang ky. Gate dang ky chi xuat hien khi nguoi dung muon "luu tu de on tap sau".
**Ly do:** Experiment EXP-01. Duolingo tang 20% next-day retention khi delay dang ky (growth-opportunities.md, Muc 1). 80-90% quyet dinh premium xay ra ngay Day 0.
**Tieu chi chap nhan:** Nguoi dung chua dang ky co the xem video va click tra tu; gate chi xuat hien o hanh dong luu tu.

### DEV-06: Smart Paywall Trigger System (P2)

**Mo ta:** Paywall hien thi dua tren trigger cu the (het quota review, het video mien phi/tuan, streak 7 ngay) thay vi ngau nhien. Moi trigger co copy rieng.
**Ly do:** Experiment EXP-03, EXP-06. Paywall trigger dung luc co conversion cao hon paywall ngau nhien. Dieu kien tien quyet: nguoi dung da activated (da luu it nhat 5 tu) truoc khi thay paywall — tranh paywall qua som (growth-opportunities.md, Rui ro 1).
**Tieu chi chap nhan:** It nhat 4 trigger types hoat dong; moi trigger co `trigger_source` parameter trong GA4 event.

### DEV-07: Referral Flow (P2)

**Mo ta:** Thiet ke "Gui clip song ngu cho ban" — share clip + deep link → ban nhan duoc clip voi phu de song ngu → app download/open.
**Ly do:** Referral CAC = $0, LTV referred users cao hon 25-35% (channel-scorecard.md, Muc 2.5). Viral loop tu nhien tu product experience.
**Tieu chi chap nhan:** Share flow hoat dong tren iOS va Android; deep link mo dung video + timestamp; track `invite_sent` va `referral_converted` events.

### DEV-08: Pricing/Billing Transparency Architecture (P1)

**Mo ta:** (a) Pricing page ro rang voi so sanh Thang/Quy/Nam, (b) Nhac truoc 3 ngay khi subscription sap tu gia han, (c) Huy don gian trong 2 buoc, (d) Quota su dung hien thi ro (bao nhieu video/review con lai).
**Ly do:** Trust la san pham. Cake bi than phien subscription tu gia han khong nhac; Trancy bi cam nhan paywall AI features; EWA dang co billing crisis (customer-signals.md, Pain Nhom 5; competitor-landscape.md, Muc 4). eUp co the win ve trust ngay tu ngay 1 (competitor-landscape.md, Gap E).
**Gia sach de xuat (doi chieu thi truong VN):** Thang: 99.000 VND (~$4), Quy: 240.000 VND (~$10, tiet kiem 20%), Nam: 699.000 VND (~$28, tiet kiem 40%) — growth-opportunities.md, Muc 3.
**Tieu chi chap nhan:** Khong co dark patterns; nguoi dung co the huy trong 2 tap; nhac gia han 3 ngay truoc; quota hien thi o home screen.

### Tom tat muc do uu tien dev

| Muc do | Yeu cau | Ly do |
|--------|---------|-------|
| **P0 (Blocker)** | DEV-01 Tracking, DEV-02 AI Subtitle Engine | Khong co 2 thu nay thi khong launch duoc va khong do duoc |
| **P1 (Launch)** | DEV-03 Progressive Subtitle, DEV-04 Review Loop, DEV-05 Delay Signup, DEV-08 Billing Transparency | Differentiators chinh va trust foundation |
| **P2 (Growth)** | DEV-06 Smart Paywall, DEV-07 Referral | Monetization va viral loop — can sau khi co data tu P1 experiments |

---

## 8. PM Intake Packet

### Scope

- **San pham:** App mobile (iOS + Android) hoc tieng Anh qua video song ngu Anh-Viet
- **Thi truong dau tien:** Viet Nam
- **Surface:** Learning-through-content (theo eup-context.md, Product Surfaces)
- **Business model:** Freemium + Content Gate + Triggered Paywall (growth-opportunities.md, Muc 3)

### Rang buoc

1. **Mobile-first bat buoc** — VN la thi truong mobile-heavy; desktop extension khong du de win (customer-signals.md, Pain Nhom 2)
2. **EN-VI la cap ngon ngu duy nhat giai doan 1** — khong ho tro ngon ngu khac de giu positioning sac (competitor-landscape.md, Muc 7 Insight 4)
3. **AI subtitle accuracy >= 95%** la dieu kien tien quyet truoc khi launch — neu khong dat, khong launch (research-summary.md, Muc 4 Cho San Pham)
4. **Tracking infrastructure xong truoc khi bat ky experiment nao chay** — 8 events P1 la blocker
5. **Khong co curated library** — BYO media (YouTube) la model chinh; tranh catalog fatigue (customer-signals.md, Pain Nhom 4)
6. **Pricing khong vuot $4/thang** cho goi thap nhat tai VN — competitive pressure tu Trancy $3.49 va Miraa $0.99 (competitor-landscape.md, Pricing)

### Phu thuoc

| Phu thuoc | Nguon | Tac dong |
|-----------|-------|---------|
| AI subtitle quality | Dev team | P0 — khong co thi khong launch |
| GA4 tracking | Dev team | P0 — khong co thi khong do duoc |
| YouTube API / subtitle extraction | External (YouTube) | Rui ro AutoDub; can fallback plan |
| EN-VI translation quality | AI model + human QA | Nguoi hoc Viet co baseline cao tu Toomva; sai la mat trust |
| App Store approval | Apple/Google | Timeline risk cho iOS review |

### Timeline de xuat

| Phase | Noi dung | Thoi gian |
|-------|----------|-----------|
| Phase 0 | Tracking infrastructure + AI subtitle prototype | Tuan 1-4 |
| Phase 1 | Core app (video player + dual subtitle + word save + basic review) | Tuan 5-10 |
| Phase 2 | Progressive subtitle modes + delay signup flow + billing transparency | Tuan 8-12 |
| Phase 3 | P1 experiments chay (EXP-01 to EXP-03) + ASO/TikTok launch | Tuan 10-14 |
| Phase 4 | Smart paywall + referral + P2 experiments | Tuan 14-20 |

### Rui ro va phuong an du phong

| Rui ro | Xac suat | Tac dong | Phuong an |
|--------|----------|---------|-----------|
| AI subtitle accuracy < 95% | Trung binh | Launch bi delay hoac core promise vo | Test som (tuan 1-2) voi 100 video; neu fail, pivot sang curated subtitle model |
| YouTube AutoDub pha subtitle extraction | Cao | BYO YouTube model bi anh huong | Xay AI subtitle fallback khong phu thuoc audio goc YouTube |
| eJOY focus lai vao EN-VI | Thap-Trung binh | Mat first-mover advantage | Toc do la moat tam thoi; ship truoc va build habit loop |
| Trancy giam gia tiep va tung tinh nang EN-VI | Cao | Competitive pressure tang | Differentiate bang progressive subtitle + review loop depth, khong bang gia |
| Pricing qua thap de sustain | Trung binh | Unit economics am | Monitor LTV/CAC ratio tu thang 2; san sang dieu chinh pricing hoac tinh nang free/premium boundary |

---

## 9. Ban Giao Vai Tro

| Vai tro | Nhiem vu tiep theo | Artifact can doc |
|---------|--------------------|--------------------|
| **project-manager** | Chuyen strategy memo nay thanh backlog items, dependencies, file ownership → viet `dev-intake.md` | Strategy memo nay + growth-opportunities.md + ga4-insights.md |
| **codebase-scout** | Map codebase hien tai de xac dinh foundation cho video player, subtitle engine, tracking | Strategy memo nay (Muc 7 Dev Asks) |
| **technical-brainstormer** | Evaluate phuong an ky thuat cho AI subtitle engine (Whisper vs GPT-4o vs Gemini), progressive subtitle UX, va YouTube API dependency | DEV-02, DEV-03 trong strategy memo |
| **implementation-planner** | Viet plan.md + task-graph.json + ownership-matrix.md sau khi dev-intake xong | Dev-intake.md (chua co) |
| **ga4-analyst** | Validate tracking plan khi GA4 credentials duoc cau hinh | ga4-insights.md + 8 events P1 tu growth-opportunities.md |
| **growth-manager** | Chay va do luong experiments P1 khi tracking infrastructure san sang | growth-opportunities.md + strategy memo Muc 5 |

---

## Phu Luc A: Tham Chieu Bang Chung

| Nhan dinh chinh | Artifact nguon | Muc do tin cay |
|-----------------|----------------|----------------|
| JTBD loi: xem that → hieu ngay → luu → luyen | research-summary.md Muc 7; customer-signals.md JTBD | High |
| Subtitle coverage la diem chet | customer-signals.md Pain Nhom 1; research-summary.md Muc 3c | High |
| Nguoi hoc Viet co ky vong cao ve phu de Anh-Viet | research-summary.md Muc 3a; quote-bank.md Phan 2 | High |
| Trust/billing la pain that | customer-signals.md Pain Nhom 5; competitor-landscape.md Muc 4 | High |
| Mobile-first gap chua duoc lap day | customer-signals.md Pain Nhom 2; competitor-landscape.md Gap A | High |
| Gap EN-VI quality chua ai khai thac | competitor-landscape.md Gap F, Muc 7 | Medium-High |
| Trancy la moi de doa tier-1 | competitor-landscape.md Muc 12 Threats | Medium-High |
| YouTube AutoDub pha subtitle extraction | research-summary.md Muc 3c; quote-bank.md Phan 2 Miraa | Medium-High |
| Willingness-to-pay phan khuc VN | research-summary.md Muc 5 | Low — can validate |
| Retention/revenue thuc te cua doi thu | research-summary.md Muc 5 | Low |

## Phu Luc B: Cum Tu Khoa ASO/SEO Chua Bi Chiem

Tu ga4-insights.md keyword cluster va channel-scorecard.md Muc 2.1, 2.3:

**Tieng Viet (ASO + SEO):**
- "hoc tieng Anh qua video phu de song ngu" — unclaimed
- "hoc tieng Anh qua phim" — competitive nhung eJOY khong dominant
- "xem YouTube hoc tieng Anh" — co the win bang content
- "ung dung hoc tieng Anh qua video" — medium competition
- "phu de song ngu Anh Viet" — unclaimed

**Tieng Anh (cho ASO quoc te sau nay):**
- "bilingual subtitle English learning app" — low competition
- "learn English with real videos" — medium competition

---

**Status:** DONE
**Summary:** Strategy memo da duoc tong hop tu 8 artifacts nghien cuu, bao gom doi tuong muc tieu, dinh vi, 6 kenh uu tien (ASO > TikTok > YouTube > SEO > Referral > Paid UA), 8 experiments (4 P1 + 4 P2), 8 yeu cau dev cu the (2 P0 blockers: tracking infrastructure va AI subtitle engine), va PM intake packet day du. Blocker lon nhat: tracking infrastructure va AI subtitle accuracy can giai quyet truoc khi launch hoac chay bat ky experiment nao.
**Next Handoff:** project-manager
