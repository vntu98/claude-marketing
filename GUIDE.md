# Hướng Dẫn Sử Dụng Hệ Thống Orchestrate Team

Tài liệu này giải thích cách dùng workflow mới sau khi repo được nâng cấp sang hướng `Agent Teams first`.

Mục tiêu:

- giúp anh biết nên gọi lệnh nào cho từng giai đoạn
- rút ngắn flow cũ `/eup-research -> /eup-strategy -> /eup-pm -> ...`
- vẫn giữ được approval gate trước khi dev implement
- hiểu được các guardrail mới của runtime sau Phase 1

## 1. Tư duy mới

Trước đây anh thường điều phối theo từng specialist command:

1. `/eup-research`
2. `/eup-strategy`
3. `/eup-pm`
4. `/eup-scout`
5. `/eup-brainstorm`
6. `/eup-plan`
7. approve
8. `/eup-pm` hoặc engineer skills để implement

Bây giờ hệ thống có thêm các command cấp "phòng ban":

- `/eup-market-cycle`
- `/eup-dev-intake`
- `/eup-implement`
- `/eup-company-status`

Hiểu ngắn gọn:

- command cũ = gọi từng specialist
- command mới = gọi cả team theo một orchestration lớn hơn
- runtime mới = chặn task packet sai, lưu session state, và siết parallel execution

## 2. Flow ngắn nhất cho một task đi qua cả marketing và dev

Nếu task cần:

- research thị trường
- phân tích đối thủ
- xem GA4 / channel signal
- viết chiến lược
- chuyển qua PM/dev
- lên plan
- implement sau khi anh duyệt

thì flow ngắn nhất là:

1. `/eup-context` nếu chưa setup context cho repo
2. `/eup-market-cycle "<brief>"`
3. `/eup-dev-intake "<strategy-memo-path>"`
4. anh review và approve `plan.md`
5. `/eup-implement "<plan-path>"`

Command kiểm tra trạng thái:

- `/eup-company-status`

## 3. Command nào dùng khi nào

### `/eup-market-cycle`

Dùng khi anh muốn cả đội marketing làm việc như một phòng ban.

Nó phù hợp cho:

- market research
- competitor analysis
- GA4 / channel analysis
- SEO/growth support
- tổng hợp thành strategy memo

Kết quả mong đợi:

- folder `reports/research/YYYYMMDD-<slug>/`
- file `reports/strategy/YYYYMMDD-<slug>/strategy-memo.md`

Ví dụ:

```text
/eup-market-cycle "Research thị trường app học tiếng Anh qua video ngắn, phân tích đối thủ chính, xem tín hiệu GA4 cho acquisition và activation, rồi đề xuất chiến lược tăng signup chất lượng."
```

### `/eup-dev-intake`

Dùng khi đã có strategy memo và muốn chuyển qua đội PM + scout + brainstorm + planning.

Nó phù hợp cho:

- chuyển strategy thành dev intake packet
- scout codebase
- phân tích trade-off kỹ thuật
- chuẩn bị planning artifacts

Kết quả mong đợi:

- `reports/strategy/YYYYMMDD-<slug>/dev-intake.md`
- `plans/<slug>/plan.md`
- `plans/<slug>/task-graph.json`
- `plans/<slug>/ownership-matrix.md`

Ví dụ:

```text
/eup-dev-intake "reports/strategy/20260401-english-video-growth/strategy-memo.md"
```

### `/eup-implement`

Dùng sau khi plan đã được approve rõ ràng.

Nó phù hợp cho:

- dispatch engineering team
- chạy parallel implementation theo ownership matrix
- dùng task graph và `worktree` isolation
- sau đó đi qua review và test gate

Ví dụ:

```text
/eup-implement "plans/english-video-growth/plan.md"
```

### `/eup-company-status`

Dùng khi muốn biết:

- đang ở stage nào
- strategy memo đã xong chưa
- plan đang pending hay approved
- team nào đang chạy
- task progress đang tới đâu

Ví dụ:

```text
/eup-company-status
```

## 4. Guardrail mới của runtime

Sau Phase 1, hệ thống không chỉ có thêm command, mà còn có thêm runtime guardrails.

### 4.1 `TaskCreated` gate

Mọi team task phải có task packet đủ rõ. Nếu thiếu các trường bắt buộc, hook sẽ chặn task trước khi teammate làm việc.

Tối thiểu task packet phải có:

- `Phase:`
- `Owner Role:`
- `Depends On:`
- một trong `Artifacts:` hoặc `Read Scope:` hoặc `File Ownership:`
- `Acceptance Criteria:`
- `Validation:`

Nếu là task implementation thì phải có thêm:

- `Isolation: worktree`

### 4.2 Session recovery

Hệ thống sẽ lưu snapshot workflow vào:

- `.claude/session-state/latest.md`
- `.claude/session-state/archive/*.md`

Nghĩa là:

- khi anh `startup`, `resume`, hoặc session bị `compact`
- Claude có thể đọc lại workflow snapshot
- không cần suy luận lại từ đầu repo đang ở stage nào

Snapshot này ghi lại:

- strategy memo active
- plan active và approval status
- team nào đang chạy
- phase hiện tại
- progress task

### 4.3 Rich teammate context

Khi teammate được spawn, nó nhận thêm:

- peers trong team
- assigned tasks
- active strategy artifact
- active plan artifact
- tiến độ team hiện tại

Điểm này giúp subagent bớt “mù” context khi chạy theo team mode.

### 4.4 `worktree` isolation cho implementation

Các role có thể sửa code thật giờ phải chạy theo `worktree` isolation:

- `database-engineer`
- `backend-engineer`
- `frontend-engineer`
- `mobile-engineer`
- `fullstack-developer`
- `qa-tester`
- `devops-engineer`

Mục tiêu là:

- giảm conflict khi chạy song song
- tách file ownership rõ ràng
- tránh 2 engineer giẫm lên cùng một checkout

## 5. Ví dụ end-to-end cụ thể

### Bài toán

Anh muốn:

- đội marketing research thị trường app học tiếng Anh qua video
- xem đối thủ đang làm gì
- xem dữ liệu GA4 acquisition/activation
- ra chiến lược phản ứng
- chuyển qua dev để build landing page + tracking + onboarding tweak

### Bước 1: chạy market cycle

```text
/eup-market-cycle "Research nhóm app học tiếng Anh qua video, phân tích competitor, xem GA4 acquisition và activation, rồi tổng hợp thành strategy memo với concrete dev asks cho landing page, tracking và onboarding."
```

Sau bước này, anh kỳ vọng có:

- `reports/research/20260401-english-video-growth/research-summary.md`
- `reports/research/20260401-english-video-growth/competitor-landscape.md`
- `reports/research/20260401-english-video-growth/ga4-insights.md`
- `reports/research/20260401-english-video-growth/channel-scorecard.md`
- `reports/strategy/20260401-english-video-growth/strategy-memo.md`

### Bước 2: chuyển sang dev intake

```text
/eup-dev-intake "reports/strategy/20260401-english-video-growth/strategy-memo.md"
```

Sau bước này, anh kỳ vọng có:

- `reports/strategy/20260401-english-video-growth/dev-intake.md`
- `plans/english-video-growth/plan.md`
- `plans/english-video-growth/task-graph.json`
- `plans/english-video-growth/ownership-matrix.md`

### Bước 3: review và approve

Lúc này chưa implement ngay. Anh cần review `plan.md`.

Ví dụ phản hồi:

```text
Tôi approve plan english-video-growth. Giữ phạm vi MVP như hiện tại.
```

Hoặc:

```text
Chưa approve. Bỏ paywall experiment ra khỏi phase đầu, chỉ giữ landing page + tracking + onboarding copy.
```

### Bước 4: chạy implementation

Sau khi plan đã approved:

```text
/eup-implement "plans/english-video-growth/plan.md"
```

Lúc này hệ thống sẽ dùng:

- `task-graph.json`
- `ownership-matrix.md`

để dispatch engineer roles theo ownership tách biệt.

### Bước 5: kiểm tra tiến độ

```text
/eup-company-status
```

Command này hữu ích khi:

- anh quay lại giữa chừng
- muốn biết task nào đang blocked
- muốn biết đã tới phase review/test chưa

## 6. Task packet contract nên hiểu như thế nào

Phần này quan trọng nếu anh review plan, review task graph, hoặc yêu cầu orchestration custom.

Ví dụ task implementation hợp lệ:

```text
Phase: implementation
Owner Role: backend-engineer
Depends On: task-db-schema
File Ownership:
- src/api/**
- src/services/tracking/**
Isolation: worktree
Acceptance Criteria:
- approved API contract is implemented
- error handling rõ ràng
Validation:
- npm test -- tracking
- npm run build
```

Ví dụ task research hoặc planning:

```text
Phase: dev-intake
Owner Role: codebase-scout
Depends On: none
Read Scope:
- app/**
- src/**
Acceptance Criteria:
- entry points, risks, và smallest safe change surface được nêu rõ
Validation:
- report findings back to lead with file references
```

Ví dụ task PM hoặc strategist:

```text
Phase: dev-intake
Owner Role: project-manager
Depends On: none
Artifacts:
- reports/strategy/YYYYMMDD-<slug>/dev-intake.md
Acceptance Criteria:
- backlog, dependency, ownership, validation needs đều rõ
Validation:
- confirm artifact đã được save đúng path
```

Nếu packet thiếu format này, `TaskCreated` hook có thể chặn task.

## 7. Mapping từ workflow cũ sang workflow mới

### Cũ

```text
/eup-research
/eup-strategy
/eup-pm
/eup-scout
/eup-brainstorm
/eup-plan
approve
/eup-pm hoặc engineer skills để implement
```

### Mới

```text
/eup-market-cycle
/eup-dev-intake
approve
/eup-implement
```

### Mapping chi tiết

- `/eup-research + /eup-strategy` -> `/eup-market-cycle`
- `/eup-pm + /eup-scout + /eup-brainstorm` -> `/eup-dev-intake`
- `/eup-pm sau approval để điều phối dev` -> `/eup-implement`
- check trạng thái thủ công -> `/eup-company-status`

## 8. Khi nào vẫn nên dùng command cũ

Workflow mới không loại bỏ command cũ.

Anh vẫn nên dùng command cũ khi muốn điều khiển rất chi tiết.

Ví dụ:

- chỉ muốn research, chưa cần strategy:
  - `/eup-research`
- đã có research, chỉ muốn strategist tổng hợp lại:
  - `/eup-strategy`
- chỉ muốn scout codebase, chưa cần cả PM intake:
  - `/eup-scout`
- chỉ muốn brainstorm trade-off kỹ thuật:
  - `/eup-brainstorm`
- chỉ muốn planner viết lại plan:
  - `/eup-plan`

Nói ngắn gọn:

- muốn cả phòng ban làm việc -> dùng command mới
- muốn điều khiển từng specialist -> dùng command cũ

## 9. Flow khuyến nghị theo tình huống

### Tình huống A: chỉ cần đội marketing

```text
/eup-market-cycle "<brief>"
```

Dừng ở strategy memo.

### Tình huống B: marketing xong, chuyển sang PM/planning, chưa implement

```text
/eup-market-cycle "<brief>"
/eup-dev-intake "<strategy-memo-path>"
```

Dừng ở `plan.md`, chờ anh approve.

### Tình huống C: đã có strategy memo từ trước, muốn vào dev luôn

```text
/eup-dev-intake "<strategy-memo-path>"
```

Sau khi approve:

```text
/eup-implement "<plan-path>"
```

### Tình huống D: đã có plan approved, chỉ muốn chạy engineering

```text
/eup-implement "<plan-path>"
```

### Tình huống E: muốn biết hệ thống đang ở đâu

```text
/eup-company-status
```

## 10. Khi quay lại giữa chừng thì nên làm gì

Nếu anh mở lại repo sau một khoảng nghỉ:

1. mở `claude`
2. để Claude đọc session snapshot đã được inject
3. chạy `/eup-company-status`
4. mở lại `strategy-memo.md` và `plan.md` active nếu task đã vào dev

Không nên:

- bắt đầu lại `/eup-market-cycle` nếu research/strategy đã xong
- gọi `/eup-implement` khi plan vẫn pending
- bỏ qua `ownership-matrix.md` rồi yêu cầu nhiều engineer chạy song song

## 11. Lỗi thường gặp và cách hiểu

### Task bị chặn ngay khi tạo

Nguyên nhân thường là task packet thiếu:

- `Acceptance Criteria`
- `Validation`
- `Artifacts` / `Read Scope` / `File Ownership`
- `Isolation: worktree` với implementation lane

### Claude nhắc về session state khi startup/resume

Đây là hành vi đúng. Mục tiêu là kéo repo quay lại đúng workflow stage trước đó.

### Không cho implement dù đã có plan folder

Chỉ có `plan.md` là chưa đủ. Plan active phải chứa đúng dòng:

```text
Approval Status: approved
```

### Team chạy song song nhưng vẫn bị chặn

Khả năng cao:

- ownership đang overlap
- dependency chưa clear
- task packet chưa đủ rõ
- reviewer/tester đang chờ lane implementation xong

## 8. Checklist dùng hằng ngày

Mỗi repo hoặc initiative mới:

1. chạy `/eup-context` nếu context chưa rõ
2. chạy `/eup-market-cycle` để tạo evidence + strategy memo
3. chạy `/eup-dev-intake` để tạo intake + plan artifacts
4. review `plan.md`
5. approve rõ ràng
6. chạy `/eup-implement`
7. khi cần, dùng `/eup-company-status`

## 9. Một lưu ý quan trọng

Workflow mới vẫn không cố gộp mọi thứ vào một command duy nhất từ đầu đến cuối, vì có approval gate bắt buộc.

Nói cách khác:

- command orchestration đã ít hơn
- flow đã gọn hơn
- nhưng vẫn phải dừng ở bước approve plan trước khi dev implement

Đó là chủ đích của hệ thống, không phải thiếu sót.
