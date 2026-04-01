# Bản Đồ Cạnh Tranh: Ứng Dụng Học Tiếng Anh Qua Video Với Phụ Đề Song Ngữ

**Ngày cập nhật:** 01/04/2026
**Dựa trên:** Nghiên cứu trước tại `reports/research/20260331-english-video-bilingual-apps/` + dữ liệu mới thu thập 04/2026

---

## Kết Luận Nhanh

- Phân khúc học tiếng Anh qua video phụ đề song ngữ đang tăng tốc: các đối thủ tier 1 (Trancy, Miraa) cập nhật sản phẩm nhanh và giảm giá aggressive.
- Pricing gap đang mở: Language Reactor ($5/tháng), Trancy ($3.49–5.99/tháng), Miraa ($0.99–5.99/tháng) đặt bar giá kỳ vọng của người dùng rất thấp.
- Không có app nào sở hữu hoàn toàn kết hợp: **mobile-first + BYO media + AI subtitle chính xác + tight review loop + trust tốt**.
- Thị trường Việt Nam: eJOY là đối thủ địa phương duy nhất có traction thật (tích hợp tiếng Việt, có community), nhưng product thesis đang loãng dần.
- **Mối đe dọa lớn nhất mới nổi:** Trancy đang positioning chính mình như "Language Reactor Pro" — tích cực kéo user của Language Reactor và mở rộng sang mobile.

---

## 1. Bản Đồ Thị Trường

| Nhóm | Đối thủ | ICP chính | Lý do người dùng cân nhắc | Nền tảng |
|------|---------|-----------|---------------------------|----------|
| **Direct** | eJOY English | Người Việt học tiếng Anh qua YouTube + muốn full loop | Dual subtitle EN-VI, YouTube Connect, review game, AI speaking | iOS / Android / Chrome |
| **Direct** | Miraa | Người học muốn import media riêng + shadowing | AI transcribe, bilingual sub, echo method, pricing nhỏ dễ thử | iOS / Android |
| **Direct** | Trancy | Người học muốn AI immersion nhiều platform + giá thấp | AI bilingual sub, speaking practice, GPT integration, multi-platform | iOS / Android / Chrome / Web |
| **Direct** | FluentU | Người học nghiêm túc chấp nhận trả cao hơn | Curated library, interactive captions, SRS quiz, cross-device | iOS / Android / Web |
| **Emerging** | Video Lingo | Người học muốn app đơn giản BYO YouTube + dual sub | Import YouTube, dual subtitle, quiz, 27 ngôn ngữ | iOS / Android |
| **Emerging** | English Subtitle: Learn Engvid | Người học muốn library lớn + subtitle practice | 10K+ videos, sentence practice, speech recognition | iOS |
| **Secondary** | Linglass | Power user muốn dual sub nhẹ, miễn phí trên YouTube | Browser extension, dual sub, click translation | Chrome |
| **Secondary** | Lingopie | Người học thích học qua show/phim | Exclusive library, dual sub, flashcard, live classes | iOS / Android / TV / Web |
| **Secondary** | Cake | Người học muốn habit nhỏ, daily clip ngắn | 20K+ content clips, AI pronunciation, daily habit | iOS / Android |
| **Secondary** | EWA | Người học muốn learn qua movie/TV clips + books | 10K+ books, movie snippets, 40K+ flashcards, 60M users | iOS / Android |
| **Substitute** | Language Reactor | Power user, desktop-first, Netflix/YouTube | Dual sub, blur/hide, PhrasePump, AI chatbot, $5/tháng | Chrome (chỉ desktop) |
| **Substitute** | Migaku | Serious immersion learner, flashcard mining | One-click flashcard, SRS, comprehension scoring, $199/năm | iOS / Android / Chrome |

---

## 2. Feature Matrix

### Chú thích
- `Y` = Có, là core feature
- `P` = Có nhưng sau paywall hoặc premium tier
- `L` = Giới hạn / limited
- `N` = Không có
- `?` = Không xác nhận được từ nguồn công khai

| Đối thủ | Dual subtitle | Single subtitle | Blur/hide native sub | Click-to-reveal delayed | Tap word / context | Save từ | SRS review | Shadowing / speaking | Mobile | BYO YouTube | BYO upload | Curated library | AI subtitle fallback | Giá khởi điểm/tháng |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **eJOY** | Y | Y | Y | L | Y | Y | Y | Y | Y | Y | N | Y | Y | ~$8–12 (App Store) |
| **Miraa** | Y | Y | N | Y (delayed reveal) | Y | L | N | Y (echo) | Y | Y | Y | N | Y (AI core) | $0.99–5.99 |
| **Trancy** | Y | Y | N | N | Y | Y | Y | Y | Y | Y | N | N | Y (AI core) | $3.49–5.99 |
| **FluentU** | Y | Y | N | N | Y | Y | Y | L | Y | L | N | Y (strong) | Y | ~$20–30 |
| **Migaku** | Y | Y | Y (blur) | Y | Y | Y | Y (strong) | L | Y | Y | Y | L | L | ~$16.67–19.99 |
| **Language Reactor** | Y | Y | Y (blur) | Y | Y | Y | L | N | N | Y | N | N | N | $5 |
| **Lingopie** | Y | Y | N | N | Y | Y | Y | L | Y | N | N | Y (exclusive) | L | $5.99–12/tháng |
| **Linglass** | Y | Y | N | N | Y | Y | N | N | L | Y | N | N | N | Free / unknown |
| **Cake** | N | Y | N | N | N | L | L | Y | Y | N | N | Y | N | $6–13.99 |
| **EWA** | N | Y | N | N | Y | Y | Y | N | Y | N | N | Y | N | ~$10 |
| **Video Lingo** | Y | Y | N | N | N | N | N | N | Y | Y | N | N | Y (AI) | Unknown / freemium |
| **English Subtitle** | Y | Y | N | N | Y | Y | N | Y | Y | N | N | Y | N | Free / unknown |

---

## 3. Pricing & Packaging Overview

| Đối thủ | Freemium | Giá tháng | Giá năm (quy tháng) | Lifetime | Ghi chú |
|---------|:--------:|:---------:|:-------------------:|:--------:|---------|
| eJOY | Y (giới hạn) | ~$8–12 | ~$5–8 | N | App Store pricing phức tạp, nhiều gói |
| Miraa | Y (quota AI) | $0.99 (Basic) / $5.99 (Pro) | $49.99/năm (Pro) | N | Pricing dễ thử nhất trong nhóm |
| Trancy | Y (40 AI video/ngày) | $3.49–5.99 | Có | N | Có gói GPT-5-mini add-on |
| FluentU | N (14-ngày trial) | ~$30 | ~$20 (~$240/năm) | N | Đắt nhất, nhưng money-back rõ |
| Migaku | N | $19.99 | $16.67 (~$199/năm) | Y | Lifetime dành cho committed users |
| Language Reactor | Y | $5 | €37.50/năm | N | Desktop-only, không có mobile |
| Lingopie | Y (7-ngày trial) | $12 (3-tháng gói) | $5.99 | $199 | Family plan $9.92/tháng/4 tài khoản |
| Cake | Y (5 hearts/ngày) | $13.99 | ~$6 | N | Free có ads |
| EWA | Y | ~$10 | Có (hay discount 30–50%) | N | Billing complaints nhiều trên Trustpilot |
| Video Lingo | ? | ? | ? | ? | Ít dữ liệu công khai |
| Linglass | ? | ? | ? | ? | Ít dữ liệu công khai |
| English Subtitle | ? | ? | ? | ? | Ít dữ liệu công khai |

---

## 4. Trust & Risk Matrix

| Đối thủ | Điểm mạnh về trust | Rủi ro trust | App Store rating (ước tính) |
|---------|-------------------|-------------|:---------------------------:|
| eJOY | Vietnamese community, startup credential (TECHFEST 2019, STARTUP Vietnam 2022), feature updates | Pricing rối; reliability past issues; product thesis loãng | 4.5 (VN App Store) |
| Miraa | Pricing minh bạch, nhiều tier nhỏ, cập nhật liên tục | AI subtitle sai gây distrust nhanh; sync multi-device còn pain | 4.4 |
| Trancy | Rating tốt (Product Hunt), feature velocity cao, claimed 10M+ users | Paywall quanh AI-generated subs bị user phản ứng; iPad UX chưa tốt | 4.5 |
| FluentU | Brand trust lâu năm, pricing page rõ, money-back signal | Giá cao nhất nhóm; bug reports về device dependency | 4.3 |
| Migaku | Power-user trust mạnh, pricing rõ, lifetime option | Technical feel, mainstream onboarding khó | 4.6 |
| Language Reactor | Community trust, free tier rõ | Mobile hoàn toàn không có; phụ thuộc subtitle sẵn có trên platform | 4.3 |
| Lingopie | Trustpilot 4.7/5 (2,010 reviews), free trial rõ | Billing reputation (refund policy strict); catalog complaints | 4.7 |
| Cake | Rating cao, 20M+ downloads | Mature content concerns (sexual vocabulary) cho một số market | 4.7 |
| EWA | 4.7 App Store, $500K/tháng doanh thu iOS | **Billing crisis**: unexpected charges, cancel difficulty — Trustpilot toxic | 4.7 (App Store) / ~3.x Trustpilot |
| Video Lingo | Ít thông tin | Social proof mỏng | ? |
| Linglass | Tiện ích rõ | Ít thông tin về stability | ? |
| English Subtitle | Library rộng | Feature & reliability unclear | ? |

---

## 5. Switching Triggers (Lý Do Người Dùng Rời Đi)

### eJOY
- **Rời vào:** muốn all-in-one học tiếng Anh qua YouTube, guided flow, Vietnamese-English dual subtitle
- **Rời đi:** pricing App Store phức tạp và cao; product thesis "ultimate knowledge tool" quá rộng; reliability/subtitle sync không ổn; không có offshore content ngoài YouTube

### Miraa
- **Rời vào:** muốn import media riêng + shadowing nghiêm túc + AI subtitle cho content không có subtitle sẵn
- **Rời đi:** AI subtitle sai gây frustration; lookup/review loop yếu hơn app vocab-first; sync multi-device còn friction

### Trancy
- **Rời vào:** muốn AI immersion trên nhiều platform (YouTube, Netflix, Disney+, Udemy), giá thấp, tích hợp GPT
- **Rời đi:** cảm giác bị "paywall" AI subtitle — core utility bị chặn; iPad UX kém; một số user thấy app chưa stable

### FluentU
- **Rời vào:** muốn learning engine trưởng thành, curated content, quiz/SRS chất lượng cao
- **Rời đi:** giá cao (~$30/tháng) không justify value với nhiều user; curated library DNA cản freedom; bugs device dependency

### Migaku
- **Rời vào:** committed learner muốn sentence mining + SRS + comprehension tracking nghiêm túc
- **Rời đi:** quá technical cho mainstream; cần setup nhiều; thiếu sentence translation cho advanced learners

### Language Reactor
- **Rời vào:** desktop user muốn dual subtitle + blur + lookup miễn phí trên YouTube/Netflix
- **Rời đi:** hoàn toàn không có mobile; phụ thuộc subtitle sẵn có; không đủ full learning loop

### Lingopie
- **Rời vào:** muốn "Netflix nhưng để học", exclusive show library
- **Rời đi:** catalog không đủ match sở thích; billing complaints (auto-renew, cancel friction); giá thực tế không minh bạch

### Cake
- **Rời vào:** muốn daily habit nhẹ nhàng, clip ngắn, AI pronunciation
- **Rời đi:** không phải immersion learning; không có dual subtitle; content mature không phù hợp một số user (Vietnam)

### EWA
- **Rời vào:** user muốn learn qua movie clips + books, 60M user social proof
- **Rời đi:** **billing complaints toxic** — unexpected charges, difficult cancellation là điểm yếu chết người về trust

---

## 6. Moat Analysis

| Đối thủ | Moat thật sự là gì | Dễ tái tạo không | Nhận xét |
|---------|-------------------|:----------------:|---------|
| FluentU | Curated library + learning engine depth + brand trust lâu năm | Khó | Tốn nhiều năm và tiền để build; nhưng "curated" trở thành điểm yếu khi user muốn freedom |
| Lingopie | Exclusive content catalog + multi-device distribution (TV, app) | Khó vừa | Catalog licensing tốn kém; nếu catalog không match preference thì moat không giữ được |
| Migaku | Power-user trust + SRS integration + community toolchain | Vừa | Technical community lock-in mạnh, nhưng không scale sang mainstream |
| Language Reactor | Community familiarity + miễn phí | Thấp | Utility moat dễ bị thay thế bởi app có UX tốt hơn |
| eJOY | Vietnamese market fit + full loop cho EN-VI learner | Vừa | Nếu không maintain product focus, sẽ mất moat về user habit |
| Trancy | Feature velocity + pricing + multi-platform coverage | Thấp-vừa | Tốc độ build nhanh nhưng không có content moat; dễ bị copy |
| Miraa | Echo method + import media + AI subtitle speed | Vừa | Nếu AI subtitle quality được cải thiện, moat mạnh hơn; nếu không thì ngược lại |
| Cake | Brand + daily habit UX + social proof (20M+) | Khó vừa | Daily habit flywheel mạnh, nhưng không phải immersion tool |
| EWA | Scale (60M users) + book library | Khó sao chép quy mô | Billing crisis có thể phá moat nhanh nếu không fix |

---

## 7. Phân Tích Thị Trường Việt Nam

### Bối cảnh
- Việt Nam là thị trường học tiếng Anh lớn với nhu cầu cao (English không phổ biến như ngôn ngữ thứ hai); EdTech toàn cầu dự kiến vượt $181B vào 2025.
- Monkey (10M+ users VN) và ELSA Speak là các app phổ biến nhất trong nước, nhưng không focus vào video bilingual.
- English Education Market Việt Nam được xếp loại "Prime Investment Opportunity" (Vietnam Briefing 2023).

### Vị thế của từng đối thủ tại VN
| Đối thủ | Mức độ liên quan VN | Ghi chú |
|---------|:-------------------:|---------|
| eJOY | **Cao nhất** | Startup Việt Nam, tích hợp EN-VI, community VN, dual subtitle EN-VI native |
| Trancy | **Cao** | Hỗ trợ tiếng Việt, giá rất phù hợp với purchasing power VN ($3.49/tháng) |
| Miraa | **Trung bình-Cao** | Giá thấp, mobile-first, nhưng không có positioning đặc thù cho VN |
| FluentU | **Thấp-Trung bình** | Giá cao ($20–30/tháng) không phù hợp mass market VN; không có VN language pair rõ |
| Language Reactor | **Trung bình** | Desktop-only = hạn chế lớn với mobile-heavy VN user |
| Lingopie | **Thấp** | Không có tiếng Việt nổi bật; catalog không match; giá trung bình |
| Cake | **Trung bình** | Có user VN nhưng không dual-subtitle; daily habit clip |
| EWA | **Thấp** | Billing reputation toxic, mature content concerns |
| Migaku | **Thấp** | Quá technical; power user niche |

### Insight cho thị trường VN
1. **eJOY đang chiếm narrative "học tiếng Anh qua video = eJOY"** trong tâm trí người dùng Việt — đây là kẻ thù trực tiếp nhất.
2. **Pricing kỳ vọng tại VN thấp hơn Mỹ**: các app $3–6/tháng sẽ có conversion tốt hơn nhiều so với $20–30.
3. **Mobile-first là bắt buộc**: VN là thị trường mobile-heavy; desktop extension không đủ để win.
4. **EN-VI subtitle quality là differentiator**: người dùng Việt muốn bản dịch tiếng Việt chính xác, không chỉ EN-EN.
5. **Trust signal khác**: user VN nhạy cảm với billing surprises hơn, và word-of-mouth (Facebook, TikTok) mạnh hơn App Store ratings.

---

## 8. Positioning Gaps và White Space

### Gap A: Mobile-first immersion chất lượng cao (CHƯA AI THẮNG)
- Miraa và Trancy gần nhất, nhưng cả hai vẫn có UX issues trên mobile.
- FluentU có mobile app nhưng learning depth là của desktop-born product.
- **Cơ hội**: app được thiết kế mobile-first từ đầu, không phải port từ desktop.

### Gap B: Subtitle resilience đáng tin — AI subtitle KHÔNG lỗi
- Miraa và Trancy đều có AI subtitle nhưng accuracy chưa đủ để không gây distrust.
- Nếu subtitle AI sai, user sẽ quay về Language Reactor hoặc cảm thấy bị lừa.
- **Cơ hội**: nếu AI subtitle accuracy được đảm bảo, đây là moat thật sự.

### Gap C: Progressive subtitle modes thật sự hoạt động tốt
- Language Reactor và Migaku có blur/hide nhưng không mobile-native.
- Không ai có UX tốt cho: dual → blur native → delayed reveal → target-only mode trên mobile.
- **Cơ hội**: progressive subtitle UX như một học cụ trưởng thành, không chỉ là "toggle dual sub".

### Gap D: Review loop tight từ exact video moment
- Hầu hết app save word nhưng mất context (câu, clip, timing trong video).
- **Cơ hội**: save word + sentence + audio/video clip + timestamp + context meaning = review loop thật sự gắn với nội dung.

### Gap E: Trust as product — billing minh bạch, pricing clean
- EWA: billing crisis.
- Lingopie: pricing opacity + refund friction.
- Trancy: paywall around AI sub perception.
- **Cơ hội**: product với pricing minh bạch, không có dark patterns, và quota rõ ràng sẽ thắng về trust.

### Gap F: EN-VI quality cho thị trường Việt Nam
- eJOY có EN-VI nhưng product focus đang loãng.
- Không ai khác có EN-VI bilingual subtitle chất lượng cao + tight learning loop.
- **Cơ hội lớn nhất cho sản phẩm Việt**: nếu quality đủ tốt, eJOY không có đủ focus để defend.

---

## 9. SEO & Distribution Posture

| Đối thủ | SEO footprint | Phân phối chính | Điểm nổi bật |
|---------|:-------------:|----------------|-------------|
| FluentU | Rất mạnh | Organic content / blog / App Store | Blog đa ngôn ngữ, content marketing mạnh |
| Lingopie | Mạnh | Content marketing / App Store / live classes | Help center bài bản, comparison pages |
| Trancy | Đang xây dựng nhanh | App Store / Chrome Store / blog so sánh | Đang tích cực viết "Trancy vs X" comparison pages |
| Migaku | Mạnh trong niche | Community / blog / YouTube content | Power-user community trust |
| eJOY | Mạnh tại VN | Facebook VN / App Store VN | Community VN là distribution chính |
| Miraa | Vừa | App Store-first | Ít content marketing |
| Language Reactor | Community-driven | Chrome Store / Reddit / word-of-mouth | Community recommendations mạnh |
| Cake | Mạnh | App Store / content blog | Organic keyword về English speaking |
| EWA | Vừa | App Store | Paid UA nhiều, organic kém hơn |

**SEO opportunity gaps:**
- "học tiếng Anh qua video phụ đề song ngữ" — eJOY chiếm nhưng không dominant
- "xem YouTube học tiếng Anh" — nhiều competition, nhưng có thể win bằng content
- "app học tiếng Anh không cần cố gắng" / "học tiếng Anh qua phim" — underserved với app mới

---

## 10. So Sánh Sâu: Direct Competitors

| Dimension | eJOY | Miraa | Trancy | FluentU |
|-----------|------|-------|--------|---------|
| **Core promise** | "YouTube thành lesson EN-VI" | "Import media + AI subtitle + shadow" | "AI immersion trên YouTube/Netflix/web" | "Curated videos + full learning engine" |
| **Biggest strength** | Vietnamese market fit + full loop | Mobile-first AI subtitle + echo method | Multi-platform + pricing + feature velocity | Learning engine depth + SRS quality |
| **Biggest weakness** | Product thesis loãng; pricing phức tạp | AI subtitle accuracy không đảm bảo | Paywall perception quanh AI sub; iPad UX | Giá cao; library-first = freedom bị giới hạn |
| **Pricing accessibility** | Trung bình-thấp (cao với mobile) | Cao (dễ vào nhất) | Cao (giá thấp nhất) | Thấp (giá cao nhất) |
| **Vietnamese relevance** | Rất cao (product made for VN) | Trung bình | Cao (support VN, giá phù hợp) | Thấp |
| **Mobile readiness** | Có (nhưng App Store pricing issues) | Rất tốt | Tốt (nhưng iPad còn yếu) | Có (nhưng desktop-born) |
| **Trust posture** | Trung bình (reliability past issues) | Tốt (transparent pricing) | Trung bình (paywall perception) | Tốt (but high price point) |

---

## 11. Khi Nào Nên — Và Không Nên — Cạnh Tranh Trực Tiếp

### Nên cạnh tranh trực tiếp
- **Miraa và Trancy**: nếu sản phẩm chọn hướng mobile-first + BYO media + AI subtitle. Đây là battle có thể thắng nếu AI subtitle quality cao hơn và UX tốt hơn.
- **eJOY**: đặc biệt tại thị trường Việt Nam. eJOY đang defend nhiều mặt trận cùng lúc — một app với focus sắc hơn có thể cherry-pick user segment mà eJOY chưa phục vụ tốt.
- **Language Reactor**: ở phân khúc mobile (LR hoàn toàn không có mobile, đây là gap rõ ràng).

### Không nên cạnh tranh trực tiếp ở narrative
- **"Curated entertainment library"** của Lingopie — chi phí catalog licensing quá cao.
- **"Most complete pedagogy engine"** của FluentU — cần nhiều năm và capital để build.
- **"Power-user mining system"** của Migaku — niche quá nhỏ và đòi hỏi technical DNA.
- **"60M user social proof"** của EWA — nhưng billing reputation xấu là điểm có thể tấn công.

---

## 12. SWOT Của Sản Phẩm Chúng Ta

### Strengths (Điểm Mạnh Tiềm Năng)
- Có thể thiết kế **mobile-first từ đầu** — không bị legacy desktop architecture cản.
- Có thể tập trung hoàn toàn vào **English-Vietnamese** — positioning sắc hơn multi-language generalist.
- Có thể kết hợp **AI subtitle accuracy + progressive subtitle modes + tight review loop** trong một app.
- Có thể xây **pricing/trust architecture rõ ràng** ngay từ ngày 1 — không có legacy billing dark patterns.
- **Thị trường VN** chưa có winner thuyết phục ngoài eJOY (đang loãng dần).

### Weaknesses (Điểm Yếu Cần Thừa Nhận)
- **Chưa có social proof**: mọi đối thủ đều có rating, download counts, testimonials — startup mới bắt đầu từ 0.
- **AI subtitle accuracy là điều kiện cần, không phải điều kiện đủ**: nếu AI subtitle sai nhiều, core promise vỡ ngay.
- **Content moat = 0**: không có curated library, không có exclusive content — phải win bằng utility và UX.
- **Pricing kỳ vọng thấp**: thị trường bị anchor ở $3–5/tháng (Trancy, LR), khó charge cao hơn nếu không có differentiator rõ.

### Opportunities (Cơ Hội)
- **Gap EN-VI quality**: chưa ai làm tốt EN-VI bilingual subtitle + review loop đúng nghĩa — đây là wedge tốt nhất cho VN market.
- **Progressive subtitle UX chưa ai làm tốt trên mobile**: dual → blur → delayed reveal → target-only — đây là differentiator kỹ thuật có thể defend.
- **EWA trust collapse**: 60M users nhưng billing crisis = user base đang mất trust, cơ hội capture switchers.
- **Language Reactor users muốn mobile**: LR có community lớn nhưng zero mobile — đây là migration path rõ ràng.
- **Thị trường VN đang tăng trưởng**: English EdTech VN là "Prime Investment Opportunity" — timing tốt.

### Threats (Mối Đe Dọa)
- **Trancy đang tích cực positioning như "Language Reactor Pro + mobile"**: đang kéo đúng user segment tương tự, với feature velocity cao.
- **AI subtitle đang bị commodity hóa nhanh**: Whisper, GPT-4o, Gemini — barrier to entry thấp và tiếp tục giảm.
- **Extension substitutes**: Language Reactor $5/tháng luôn tạo áp lực giá; user có thể tự lắp stack rẻ.
- **eJOY có thể focus lại**: nếu eJOY quyết định narrow product thesis về EN-VI video learning, họ có unfair advantage với VN community.
- **Migaku mở rộng sang mainstream**: nếu Migaku simplify onboarding thành công, đây là đối thủ nguy hiểm.

---

## Phụ Lục: Nguồn Dữ Liệu

Nghiên cứu này kết hợp:
- Nghiên cứu gốc từ `reports/research/20260331-english-video-bilingual-apps/` (competitor-landscape.md, competitor-battlecards.md)
- Dữ liệu mới thu thập 04/2026: App Store listings, pricing pages, user reviews (Product Hunt, Trustpilot, Common Sense Media), và search results từ các nguồn: linguasteps.com, edureviewer.com, lingtuitive.com, eppika.com, aichief.com, slashdot.org, sourceforge.net, trancy.org, migaku.com

---

**Status:** DONE
**Summary:** Đã xây dựng bản đồ cạnh tranh đầy đủ cho 12 đối thủ với feature matrix, pricing, switching triggers, moat analysis, Vietnam market positioning, và white space opportunities — dựa trên nghiên cứu 20260331 và dữ liệu mới nhất 04/2026. Phát hiện quan trọng mới: Trancy đang aggressive positioning như "Language Reactor Pro + mobile", EWA có billing crisis ảnh hưởng trust, và gap EN-VI quality cho VN market vẫn chưa được ai khai thác tốt.
**Next Handoff:** marketing-strategist
