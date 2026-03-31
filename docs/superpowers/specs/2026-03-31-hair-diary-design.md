# Hair Diary Feature Design Spec

## Overview

게시판을 완전 제거하고, "탈모 다이어리"를 앱의 핵심 기능으로 교체한다. 사용자는 매일 두피 사진을 촬영하고 AI 분석을 받으며, 약물/시술/생활습관 체크리스트와 자유 메모를 기록한다. 공개 설정을 통해 다른 유저와 기록을 공유할 수 있고, 프리미엄 기능(리포트/비교/통계)은 가입 후 30일간 무료 체험 후 유료 전환한다.

## 제거 대상

### 게시판 전체 삭제

- `/board` 라우트 전체 (page, layout, [id])
- `/api/board/*` API 라우트 전체 (posts, comments, votes, images)
- board 관련 hooks (`useBoardPosts`, `usePostDetail`, `useVote`)
- board 관련 컴포넌트 (`WritePostModal`, `ShareAnalysisModal`)
- board 관련 타입/상수 (`BoardType`, `BOARD_NAME` 등)
- DB 테이블: `posts`, `comments`, `votes`

### Q&A → 메일 문의로 대체

- Q&A 게시판 제거
- `/contact` 또는 모달로 메일 문의 폼 제공

---

## 신규 라우트

| 라우트 | 설명 |
|--------|------|
| `/diary` | 내 다이어리 (캘린더뷰) |
| `/diary/[id]` | 개별 기록 상세 |
| `/diary/new` | 새 기록 작성 |
| `/diary/public` | 공개 다이어리 피드 |
| `/diary/report` | 리포트 (추이/비교/통계) |
| `/api/diary/*` | 다이어리 CRUD + 리포트 API |
| `/api/contact` | 메일 문의 API |
| `/privacy` | 개인정보처리방침 페이지 |
| `/terms` | 이용약관 페이지 |

---

## DB 스키마

### 새 테이블: `diary_entries`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| user_id | UUID (FK → auth.users) | RLS 기준 |
| scan_id | UUID (FK → scans, nullable) | AI 분석 연결 |
| date | DATE | 하루 1회 제약 (user_id + date UNIQUE) |
| memo | TEXT (nullable) | 자유 메모 |
| is_public | BOOLEAN (default false) | 기록 공개 여부 |
| is_photo_public | BOOLEAN (default false) | 사진 원본 공개 여부 (is_public=true일 때만 의미) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 새 테이블: `diary_checklists`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | |
| entry_id | UUID (FK → diary_entries) | |
| category | TEXT | `medication` / `treatment` / `lifestyle` |
| item | TEXT | `finasteride`, `minoxidil`, `dutasteride`, `mesotherapy`, `prp`, `transplant`, `sleep_7h`, `exercise`, `stress_low`, `stress_mid`, `stress_high` 등 |
| checked | BOOLEAN | |

### 기존 테이블 변경: `profiles`

| 추가 컬럼 | 타입 | 설명 |
|-----------|------|------|
| diary_premium_until | TIMESTAMPTZ (nullable) | 프리미엄 구독 만료일. 가입 시 `now() + 30일` 자동 설정 |
| terms_agreed_at | TIMESTAMPTZ (nullable) | 약관 동의 시점 |

### 삭제 대상 테이블

- `posts`
- `comments`
- `votes`

### RLS 정책

- `diary_entries` SELECT: `user_id = auth.uid() OR is_public = true`
- `diary_entries` INSERT/UPDATE/DELETE: `user_id = auth.uid()`
- `diary_checklists`: entry 소유자만 전체 CRUD (entry의 user_id = auth.uid())

---

## 다이어리 작성 플로우

### 진입

- `/diary/new` 직접 접근
- 캘린더에서 오늘 날짜 클릭 (기록 없을 때)

### Step 1 — 사진 촬영/업로드

- 기존 `ScanSession` 컴포넌트 재활용 (정수리/전면/측면 3장)
- 촬영 완료 → 자동 AI 분석 시작 (기존 Gemini 파이프라인)
- EXIF 제거, 이미지 압축 동일 적용

### Step 2 — 체크리스트 작성 (AI 분석 중 병렬 입력 가능)

- **약물 (medication)**: 피나스테리드, 미녹시딜, 두타스테리드, 기타 — 토글
- **시술 (treatment)**: 메조테라피, PRP, 모발이식, 기타 — 토글
- **생활 (lifestyle)**: 수면 7시간+, 운동, 스트레스(낮음/보통/높음) — 토글/선택

### Step 3 — 메모 + 공개 설정

- 자유 메모 텍스트 입력
- `☐ 모두에게 공개` 체크박스 (기본: 비공개)
- `☐ 사진도 공개` 체크박스 (공개 체크 시에만 활성화, 기본: 비공개)

### Step 4 — AI 분석 결과 확인 + 저장

- 분석 완료되면 등급/점수 표시
- "저장" 버튼 → `diary_entries` + `diary_checklists` + `scans` + `analyses` 트랜잭션 저장

### 제약

- 오늘 이미 기록 존재 시 → "오늘은 이미 기록했어요" + 수정 버튼 제공
- 하루 1회 신규 작성, 수정은 자유

---

## 캘린더뷰 (`/diary`)

- 월간 캘린더 그리드
- 기록 있는 날짜: AI 등급 색상 도트 표시 (1=🟢 #22C55E, 2=🟡 #EAB308, 3=🟠 #F97316, 4=🔴 #EF4444, 5=🟣 #A855F7)
- 날짜 클릭 → 해당 기록 상세 슬라이드업 (사진, 점수, 체크리스트, 메모)
- 오늘 날짜에 기록 없으면 "+" 버튼 강조
- 상단: 현재 스트릭 표시 ("연속 12일 기록 중!")
- 월 이동 네비게이션 (< 2026년 3월 >)

---

## 공개 다이어리 피드 (`/diary/public`)

- 최신순 카드 피드 (무한 스크롤)
- 카드 구성: 닉네임, AI 등급 뱃지, 대표 사진 1장, 메모 미리보기, 날짜
- `is_photo_public = false`인 경우 → 사진 블러 처리
- `is_photo_public = true`인 경우 → 사진 원본 표시

---

## 리포트 + 프리미엄 (`/diary/report`)

### 무료 (항상)

- 다이어리 기록, AI 분석, 캘린더뷰
- 공개 다이어리 피드 열람/작성

### 프리미엄 (가입 후 30일 무료 체험 → 이후 유료)

- **월간/주간 리포트**: AI 점수 추이 그래프, 등급 변화 시각화
- **Before/After 비교**: 두 날짜 선택하여 사진 나란히 비교
- **체크리스트 통계**: 약 복용률, 생활습관 달성률, "약 먹은 날 vs 안 먹은 날 점수 차이" 인사이트

### 프리미엄 구현

- `profiles.diary_premium_until`: 가입 시 `now() + 30일` 자동 설정
- API에서 만료일 체크하여 프리미엄 기능 접근 제어
- 만료 후 접근 시 → 구독 유도 화면 (잠금 UI)
- 결제 API 연동은 후일 별도 작업

---

## 메일 문의

- `/contact` 페이지 또는 모달
- 폼 필드: 제목, 내용, 답변받을 이메일 (로그인 시 자동채움)
- `/api/contact` → 지정 이메일로 발송 (Resend 또는 Nodemailer)
- 전송 후 토스트: "문의가 접수되었어요"

---

## 개인정보처리방침 + 이용약관

### 개인정보처리방침 (`/privacy`)

정적 페이지. 주요 항목:

- **수집 항목**: 두피 사진, AI 분석 결과, 약물/시술/생활습관 기록, 이메일
- **수집 목적**: AI 기반 두피 상태 분석 및 변화 추적 서비스 제공
- **보관 기간**: 회원 탈퇴 시 즉시 삭제
- **민감정보 고지**: 건강정보(두피 상태) 수집에 대한 별도 고지
- **제3자 제공**: 공개 설정한 다이어리에 한해 타 이용자 열람 가능
- **이미지 처리**: EXIF 메타데이터(GPS, 디바이스 정보) 서버에서 자동 제거

### 이용약관 (`/terms`)

정적 페이지. 주요 항목:

- 서비스 이용 규칙
- 의료 면책 조항: "AI 참고용 분석 · 의료 진단 아님"
- 콘텐츠 책임 (공개 다이어리)
- 프리미엄 서비스 및 환불 정책

### 동의 플로우

- 회원가입 화면에 체크박스: `☑ 이용약관 동의 (필수)` + `☑ 개인정보처리방침 동의 (필수)`
- 동의 시 `profiles.terms_agreed_at = now()` 저장
- 미동의 시 가입 불가

---

## Footer

- 가벼운 글로벌 footer: 로고 + 이용약관 | 개인정보처리방침
- 모든 페이지 하단에 노출 (FloatingMenu 위)
- 추가 노출: 회원가입 화면, 설정 페이지

---

## 네비게이션 변경

- FloatingMenu: 게시판 → "다이어리"로 교체
- Dashboard 퀵액션: "커뮤니티" → "다이어리" 교체, "공개 다이어리" 링크 추가

---

## 기존 인프라 재활용

| 기존 | 재활용 방식 |
|------|-------------|
| `ScanSession` 컴포넌트 | 다이어리 작성 Step 1 사진 촬영 |
| Gemini AI 파이프라인 | 다이어리 작성 시 자동 AI 분석 |
| 이미지 처리 (Sharp, EXIF, 압축) | 동일 적용 |
| Supabase Storage | 다이어리 사진 저장 |
| RLS 패턴 | diary_entries, diary_checklists에 적용 |
| 스트릭 시스템 (profiles) | 다이어리 연속 기록에 연동 |
| React Query 패턴 | 다이어리 CRUD hooks |

---

## 스코프 외 (후일 작업)

- 결제 API 연동 (Toss Payments, Stripe 등)
- 공개 다이어리 좋아요/응원 기능
- 다이어리 기반 게이미피케이션 확장
- 푸시 알림 ("오늘 기록을 남겨보세요")
