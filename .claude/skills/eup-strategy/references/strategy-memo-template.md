# Mẫu Strategy Memo

Use cấu trúc này cho mọi strategy handoff được lưu tại:

`reports/strategy/YYYYMMDD-[slug]/strategy-memo.md`

Rules:
- Phần phân tích, quyết định, và khuyến nghị phải viết bằng tiếng Việt vì artifact nằm dưới `reports/**`
- Một memo chỉ nên chốt một quyết định chiến lược hoặc một initiative gần nhau
- Nếu downstream là PM hoặc implementation planning, phải điền đầy đủ `Yêu Cầu Cho Dev`, `Gói Bàn Giao PM`, và `Bàn Giao Vai Trò`

## strategy-memo.md

```markdown
# Strategy Memo

## Tóm Tắt Điều Hành
- Bối cảnh và mục tiêu kinh doanh
- Quyết định cần chốt
- Confidence level

## Đối Tượng Ưu Tiên (Target Audience)
- ICP / segment ưu tiên
- Pain hoặc job quan trọng nhất
- Evidence reference chính

## Định Vị (Positioning)
- Problem để lead
- Promise cần đưa ra
- Message cần tránh hoặc frame đối thủ cần reject

## Wedge Chiến Lược
- Vì sao chọn wedge này ngay bây giờ
- Vì sao không chọn các wedge còn lại
- Non-goals rõ ràng

## Ưu Tiên Kênh (Channel Priorities)
| Kênh | Vai trò | Lý do ưu tiên | Điều kiện để thắng |
|------|---------|---------------|--------------------|
| Search / SEO | ... | ... | ... |
| Social | ... | ... | ... |

## Thí Nghiệm Ưu Tiên (Priority Experiments)
| Thí nghiệm | Mục tiêu | Confidence | Owner | Gating |
|------------|----------|------------|-------|--------|
| ... | ... | High / Medium / Low | ... | ... |

## Ghi Chú Đo Lường (Measurement Notes)
- KPI chính
- Instrumentation gap
- Success criteria
- Owner theo dõi

## Yêu Cầu Cho Dev (Concrete Dev Asks)
- Surface hoặc flow cần build/chỉnh
- Tracking / analytics requirements
- Automation / CMS / integration needs
- Phụ thuộc hoặc preconditions

## Gói Bàn Giao PM (PM Intake Packet)
- Business outcome cần technical support
- User flow hoặc ops flow nằm trong scope
- Required surfaces
- Tracking requirements
- Dependencies
- Risks / unknowns
- Out of scope

## Bàn Giao Vai Trò (Role Handoffs)
- `project-manager`: scope backlog nào trước
- `social-media-manager`: cần làm gì tiếp theo
- `seo-specialist`: cần refine IA / content / discoverability gì
- `revops-manager`: lifecycle / CRM / routing nào cần chuẩn bị
- `growth-manager`: funnel hoặc monetization hypothesis nào cần nhận tiếp
```
