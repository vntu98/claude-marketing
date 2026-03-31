# Tóm Tắt Nghiên Cứu

## Tóm Tắt Điều Hành
- Chủ đề test: nhóm app học tiếng Anh qua video có song ngữ, tra nghĩa ngay trên subtitle, và/hoặc lưu từ để ôn lại.
- Kết luận chính: thị trường đang tách thành 3 cụm vận hành rõ rệt.
  - Cụm **BYO video / import media**: Miraa, Trancy, eJOY, Video Lingo
  - Cụm **curated library / structured engine**: FluentU, Lingopie, English Subtitle
  - Cụm **browser overlay / power tools**: Language Reactor, Migaku, Linglass
- Khoảng trống chiến lược hấp dẫn nhất: **mobile-first dual subtitle + inline meaning + AI subtitle fallback + review loop + billing minh bạch**.
- Mức độ tin cậy: **Medium**.
  - Điểm mạnh: có dữ liệu trực tiếp từ App Store / Google Play / website chính thức / Reddit.
  - Hạn chế: chưa có phỏng vấn người dùng riêng, chưa crawl hàng loạt review app store, chưa có dữ liệu doanh thu hay retention nội bộ của đối thủ.

## Chủ Đề Nổi Bật
1. Người học muốn biến **video thật họ thích** thành bài học tiếng Anh, không muốn chỉ học từ lesson đóng gói sẵn.
2. **Subtitle coverage** là yếu tố sống còn. Nếu video thiếu subtitle hoặc subtitle lỗi, trải nghiệm đổ vỡ ngay.
3. **Mobile portability** là khoảng trống rõ rệt. Nhiều giải pháp mạnh vẫn bị lệ thuộc vào desktop/browser extension.
4. Dual subtitle chỉ là **scaffold**, không phải trạng thái cuối. Người dùng cần blur / hide native subtitle khi trình độ tăng.
5. **Trust** là đòn bẩy khác biệt: lỗi app, billing khó hủy, sync kém, hoặc content library mỏng đều làm người dùng bỏ đi nhanh.
6. Đối thủ mạnh nhất không hẳn là app có nhiều video nhất; thường là app nào nối được **subtitle -> meaning -> repetition -> speaking** ít friction nhất.

## Hàm Ý Chiến Lược
- Hàm ý cho positioning:
  - Không nên chỉ bán “learn English with videos”.
  - Nên bán rõ hơn: “xem video thật, chạm để hiểu ngay, lưu từ và quay lại luyện đúng lúc”.
- Hàm ý cho sản phẩm:
  - Cần hỗ trợ 3 lớp: xem hiểu ngay, lưu nghĩa theo ngữ cảnh, ôn lại không rời khỏi flow.
  - Cần có chế độ dual subtitle linh hoạt: full dual, blur native, target-only, click-to-reveal.
  - AI-generated subtitle fallback hoặc subtitle rescue là khác biệt đáng giá.
  - Speaking/shadowing không nên là add-on rời. Nó nên bám vào đúng câu hoặc từ vừa xem.
- Hàm ý cho GTM:
  - Search intent mạnh quanh các cụm “learn English with videos”, “dual subtitles”, “YouTube English learning”, “English subtitles meaning”.
  - Social angle nên xoay quanh “học từ video bạn đang xem”, “không cần mở từ điển app khác”, “10 phút mỗi ngày”.
- Hàm ý cho dev:
  - Nếu xây sản phẩm này, tracking phải đo được: import video, click word, save word, replay line, quiz completion, review return, subtitle mode usage.

## Hành Động Đề Xuất
- Ưu tiên 1: xác định rõ wedge sản phẩm.
  - Chọn giữa: mobile-first BYO video hay curated English video library.
- Ưu tiên 2: prototype luồng khác biệt.
  - Import YouTube/video URL
  - dual subtitle
  - tap word -> nghĩa + ví dụ + phát âm
  - save to wordbook
  - review later
- Ưu tiên 3: validate pain bằng research sâu hơn.
  - Thu thập review Google Play/App Store theo batch
  - Phỏng vấn 8-12 người dùng đang học tiếng Anh bằng YouTube / short video / drama clip
- Ưu tiên 4: chuẩn bị tracking plan riêng cho flow video-learning nếu muốn bước tiếp sang planning/implementation.

## Mức Độ Tin Cậy Và Bias
- **High**:
  - Nhu cầu “video thật + subtitle + tra nghĩa nhanh”
  - Pain về thiếu subtitle và mobile gap
- **Medium**:
  - Pain về curated library bị chê nhanh chán hoặc mỏng
  - Opportunity cho blur / progressive subtitle modes
- **Low**:
  - Quy mô doanh thu hay retention của từng app
  - Khả năng willingness-to-pay cụ thể theo phân khúc

## Bước Tiếp Theo Khuyến Nghị
- Nếu mục tiêu là **market validation**:
  - chạy competitor review mining sâu hơn
  - tách persona theo beginner / lower-intermediate / exam / entertainment-first
  - xác định rõ benchmark set: Miraa, Trancy, FluentU, Migaku/LR, eJOY
- Nếu mục tiêu là **build sản phẩm**:
  - handoff sang `marketing-strategist` để chốt positioning memo
  - handoff sang `project-manager` để scope demo flow và tracking needs
  - dùng thêm [competitor-battlecards.md](/Users/vutu/Documents/claude-marketing/reports/research/20260331-english-video-bilingual-apps/competitor-battlecards.md) như input chiến lược
