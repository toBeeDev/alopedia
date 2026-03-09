# ScalpCheck — 프로덕트 기획서 (PRD) v1.1

> "당신의 두피를 기록하세요" — AI 탈모 진단 & 치료 후기 커뮤니티

---

## 1. 프로젝트 개요

### 1.1 비전

BrownFeed가 배변 사진을 AI로 분석하고 커뮤니티화한 것처럼, **두피/이마라인 사진을 AI(Gemini)로 분석**하여 탈모 진행도를 추적하고, 치료 경험을 공유하는 **익명 커뮤니티 플랫폼**을 구축한다.

### 1.2 핵심 밸류 프로포지션

- **자가 진단의 문턱 낮추기**: 병원 가기 전 AI 기반 1차 스크리닝
- **변화 추적의 시각화**: 타임라인으로 두피 상태 변화를 한눈에
- **치료 정보의 민주화**: 익명으로 약물/시술 후기를 공유하는 안전한 공간
- **게이미피케이션**: 꾸준한 기록을 유도하는 레벨·미션·랭킹 시스템

### 1.3 타겟 유저 페르소나

| 페르소나              | 설명                          | 핵심 니즈            |
| --------------------- | ----------------------------- | -------------------- |
| 초기 의심자 (25~35세) | "이마가 넓어진 것 같은데…"    | 객관적 진단, 익명성  |
| 치료 진행자 (30~45세) | 피나스테리드/미녹시딜 복용 중 | 변화 추적, 경험 공유 |
| 시술 검토자 (30~50세) | 모발이식/메조테라피 고려 중   | 리얼 후기, 비용 정보 |

### 1.4 BrownFeed 벤치마크 맵핑

| BrownFeed 패턴            | ScalpCheck 적용                            |
| ------------------------- | ------------------------------------------ |
| 유머러스한 톤 ("똥 자랑") | 친근하지만 진지한 톤 ("두피를 기록하세요") |
| 실시간 동접 표시          | "지금 OOO명이 두피를 확인하고 있어요"      |
| 쾌변킹 투표               | 이번 주 최고 개선 사례 투표                |
| 배설 캘린더               | 두피 캘린더 (촬영 스트릭)                  |
| AI 똥 분석 결과 카드      | AI 두피 분석 결과 카드                     |
| 레벨/뱃지 시스템          | 동일 구조                                  |
| 다크 유머 톤              | 밝고 희망적인 톤 ("회복은 시작됐어요")     |

---

## 2. 기능 아키텍처

### 2.1 Core Feature Map

```
┌──────────────────────────────────────────────────────────┐
│                     ScalpCheck App                        │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│  📸 촬영  │  🤖 AI   │  📊 기록  │  💬 커뮤  │  🏆 게이미   │
│  & 업로드 │  분석    │  & 추적  │  니티     │  피케이션    │
├──────────┼──────────┼──────────┼──────────┼──────────────┤
│ 정수리   │ Gemini   │ 타임라인 │ 자유게시판│ 레벨시스템   │
│ 전면이마 │ Vision   │ 캘린더   │ 약물후기 │ 연속기록     │
│ 측면이마 │ API      │ 비교뷰   │ 시술후기 │ 챌린지       │
│ 가이드   │ 노우드   │ 리포트   │ Q&A      │ 명예의전당   │
│ 오버레이 │ 스케일   │ PDF      │ 댓글/추천│ 배지         │
│ EXIF검증 │ 점수화   │ 내보내기 │ 익명     │              │
└──────────┴──────────┴──────────┴──────────┴──────────────┘
```

### 2.2 Feature Detail

#### F1. 촬영 & 업로드 모듈

- **카메라 가이드 오버레이**: 정수리/전면이마/측면이마 각각에 대한 실루엣 가이드
- **촬영 프로토콜**: 3장 세트(정수리·전면·측면) 필수, 최대 6장
- **검증 로직**:
  - EXIF 메타데이터 확인 (기본 카메라 촬영 여부)
  - 해상도 최소 기준 (1280×720 이상)
  - AI 사전 필터링 (두피/이마 영역이 아닌 사진 reject)
  - 스크린샷/캡처 이미지 차단
- **업로드 UX**: 프로그레스바 + "페이지 이동 금지" 안내

#### F2. AI 분석 엔진 (Gemini Vision)

- **분석 파이프라인**:
  ```
  사진 업로드 → 전처리(리사이즈, 정규화)
    → Gemini Vision API 호출
    → 구조화된 JSON 응답 파싱
    → 점수 산출 & 등급 분류
    → 결과 저장 & UI 렌더링
  ```
- **분석 척도 — 노우드-해밀턴 스케일 기반 5등급**:

  | 등급 | 라벨       | 설명                           | 컬러코드 |
  | ---- | ---------- | ------------------------------ | -------- |
  | 1    | 🟢 정상    | 뚜렷한 탈모 징후 없음          | #22C55E  |
  | 2    | 🟡 경미    | 이마라인 미세 후퇴 (Type II)   | #EAB308  |
  | 3    | 🟠 주의    | M자 형태 진행 (Type III)       | #F97316  |
  | 4    | 🔴 경고    | 정수리 탈모 동반 (Type IV~V)   | #EF4444  |
  | 5    | 🟣 심각    | 광범위 탈모 (Type VI~VII)      | #A855F7  |

- **면책 고지**: "본 분석은 의료 진단이 아닌 참고용 AI 스크리닝입니다"

#### F3. 개인 기록 & 추적 대시보드

- **타임라인 뷰**: 날짜별 촬영 기록 + AI 점수 변화 그래프
- **Before/After 비교 슬라이더**: 두 시점의 동일 부위 사진 오버레이
- **두피 캘린더**: 촬영일 마킹, 연속 기록 스트릭
- **치료 로그**: 현재 복용약, 사용 샴푸, 시술 이력 태깅
- **PDF 리포트 내보내기**: 병원 방문 시 의사에게 보여줄 수 있는 요약본

#### F4. 커뮤니티 게시판

| 게시판        | 용도                        | 특이사항                          |
| ------------- | --------------------------- | --------------------------------- |
| 💊 약물 후기  | 피나/미녹/두타 등 약물 리뷰 | 약물명 태그 필수, 복용기간 표시   |
| 🏥 시술 후기  | 모발이식/메조/PRP 등        | 비용·병원 태그, Before/After 필수 |
| ❓ Q&A        | 탈모 관련 질문              | 채택 시스템                       |
| 🗣️ 자유게시판 | 잡담·고민                   | 라운지 스타일                     |
| 🏆 명예의전당 | 가장 극적인 개선 사례       | 투표 기반 선정                    |

- **익명 시스템**: 닉네임 자동 생성 ("두피전사\_384721"), 프로필은 레벨·뱃지만 노출
- **반응**: 추천 / 공감

#### F5. 게이미피케이션

- **레벨 시스템**: 기록 횟수, 게시글, 댓글 활동 기반 EXP
- **연속 기록 챌린지**: 7일/30일/90일 연속 기록 시 뱃지
- **주간 MVP**: 가장 도움이 된 후기 작성자 선정
- **업적 뱃지**: "첫 분석", "100일 기록", "후기왕" 등

---

## 3. 기술 아키텍처

### 3.1 시스템 다이어그램

```
[Mobile Client (PWA)]
    │
    ├── Camera API (MediaDevices)
    ├── React / Next.js (App Router)
    ├── TailwindCSS + Framer Motion
    └── IndexedDB (오프라인 캐시)
        │
        ▼
[API Gateway (Next.js Route Handlers)]
    │
    ├── Auth: Supabase Auth (소셜 로그인 + 익명)
    ├── Storage: Supabase Storage (이미지)
    ├── DB: Supabase PostgreSQL
    │     ├── users, profiles
    │     ├── scans (촬영 기록)
    │     ├── analyses (AI 분석 결과)
    │     ├── treatments (치료 로그)
    │     ├── posts, comments, votes
    │     └── achievements, streaks
    │
    ├── AI: Google Gemini Vision API
    │     └── gemini-2.0-flash / gemini-2.0-pro
    │
    ├── Image Processing: Sharp (리사이즈/압축)
    ├── Queue: Supabase Edge Functions (비동기 분석)
    └── CDN: Cloudflare (이미지 딜리버리)
```

### 3.2 핵심 기술 스택

| 레이어     | 기술                              | 선정 이유                       |
| ---------- | --------------------------------- | ------------------------------- |
| Frontend   | Next.js 16 (App Router) + PWA     | SSR + 모바일 최적화             |
| UI         | TailwindCSS + shadcn/ui           | 빠른 개발, 일관된 디자인 시스템 |
| Animation  | Framer Motion                     | 인터랙션 구현                   |
| Backend    | Next.js Route Handlers + Supabase | 서버리스, 빠른 프로토타이핑     |
| DB         | PostgreSQL (Supabase)             | RLS 기반 보안, 실시간 구독      |
| Auth       | Supabase Auth                     | 카카오/구글 소셜 로그인         |
| Storage    | Supabase Storage + Cloudflare CDN | 이미지 최적화 딜리버리          |
| AI         | Google Gemini Vision API          | 멀티모달 분석, 한국어 지원      |
| Monitoring | Sentry + Vercel Analytics         | 에러 추적, 성능 모니터링        |

### 3.3 데이터 모델 (핵심 테이블)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  nickname TEXT UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  streak_current INTEGER DEFAULT 0,
  streak_best INTEGER DEFAULT 0,
  avatar_seed TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  images JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  is_public BOOLEAN DEFAULT false
);

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans NOT NULL,
  norwood_grade INTEGER CHECK (norwood_grade BETWEEN 1 AND 5),
  score DECIMAL(4,1),
  details JSONB NOT NULL,
  gemini_raw_response JSONB,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  started_at DATE,
  ended_at DATE,
  dosage TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  board TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  images JSONB,
  scan_id UUID REFERENCES scans,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_adopted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  parent_id UUID REFERENCES comments,
  content TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  vote_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_code TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_code)
);
```

### 3.4 API 엔드포인트 맵

```
Auth:
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout

Scans:
  POST   /api/scans
  GET    /api/scans
  GET    /api/scans/:id
  DELETE /api/scans/:id
  PATCH  /api/scans/:id/visibility

Analysis:
  POST   /api/scans/:id/analyze
  GET    /api/scans/:id/analysis

Dashboard:
  GET    /api/dashboard/timeline
  GET    /api/dashboard/compare
  GET    /api/dashboard/calendar
  GET    /api/dashboard/report

Treatments:
  POST   /api/treatments
  GET    /api/treatments
  PATCH  /api/treatments/:id
  DELETE /api/treatments/:id

Posts:
  GET    /api/posts?board=
  POST   /api/posts
  GET    /api/posts/:id
  PATCH  /api/posts/:id
  DELETE /api/posts/:id
  POST   /api/posts/:id/vote

Comments:
  GET    /api/posts/:id/comments
  POST   /api/posts/:id/comments
  DELETE /api/comments/:id
  POST   /api/comments/:id/vote

Feed:
  GET    /api/feed
  GET    /api/feed/best

Profile:
  GET    /api/profile
  PATCH  /api/profile
  GET    /api/profile/achievements
  GET    /api/profile/stats
```

---

## 4. 보안 & 개인정보 보호

### 4.1 민감 데이터 분류

| 데이터       | 등급             | 처리 방침                           |
| ------------ | ---------------- | ----------------------------------- |
| 두피 사진    | 고위험 (생체)    | 암호화 저장, 접근 로그, 유저 삭제권 |
| AI 분석 결과 | 중위험 (건강)    | RLS 격리, 본인만 접근               |
| 치료 기록    | 중위험 (의료)    | 암호화, 익명화 처리 후 통계만 공개  |
| 게시글       | 일반             | 익명 처리, 사진은 옵트인            |

### 4.2 보안 정책 요약

- **이미지**: AES-256 at rest, TLS 1.3 in transit, EXIF 완전 제거
- **접근 제어**: Supabase RLS로 본인 데이터만 접근
- **Rate Limiting**: AI 분석 분당 3회, API 분당 60회
- **GDPR/PIPA**: 삭제 요청 시 72시간 내 완전 삭제
- **콘텐츠 모더레이션**: 부적절 이미지 자동 필터링

### 4.3 의료 면책

- 모든 AI 분석 결과에 면책 고지 상시 표시
- "본 서비스는 의료 진단을 대체하지 않습니다" 워터마크
- 심각 등급 판정 시 병원 방문 권유 팝업

---

## 5. 개발 로드맵

### Phase 1: MVP (Week 1~4)

| 주차 | 태스크                              |
| ---- | ----------------------------------- |
| W1   | 프로젝트 셋업, DB 스키마, Auth 연동 |
| W2   | 카메라 촬영 모듈 + 이미지 업로드    |
| W2   | Gemini API 연동 + 분석 파이프라인   |
| W3   | 분석 결과 카드 UI + 히스토리 뷰     |
| W3   | 업로드 보안 검증 + EXIF 스트리핑    |
| W4   | E2E 테스트 + 버그픽스 + 카피 검수   |
| W4   | **MVP 릴리즈 게이트**               |

### Phase 2: 커뮤니티 (Week 5~8)

- 게시판 시스템 (CRUD + 태그 + 투표)
- 타임라인 대시보드 + Before/After 비교 슬라이더
- 두피 캘린더 + 스트릭
- 댓글 시스템 + 알림

### Phase 3: 게이미피케이션 & 스케일 (Week 9~12)

- 레벨/뱃지/명예의전당
- Q&A 게시판 + 채택 시스템
- PDF 리포트 생성
- 성능 최적화 + 인프라 스케일링

---

## 6. KPI & 성공 지표

| 지표                         | MVP 목표 | 3개월 목표 |
| ---------------------------- | -------- | ---------- |
| DAU                          | 100      | 3,000      |
| 일일 분석 횟수               | 50       | 1,500      |
| 7일 리텐션                   | 30%      | 45%        |
| 게시글/일                    | —        | 50         |
| 평균 기록 스트릭             | 3일      | 14일       |
| Lighthouse (Mobile)          | >= 85    | >= 95      |
| AI 분석 정확도 (전문의 대비) | 70%      | 85%        |

---

## 7. 리스크 & 완화

| 리스크             | 영향 | 확률 | 완화 전략                                |
| ------------------ | ---- | ---- | ---------------------------------------- |
| Gemini 분석 부정확 | High | 중   | 전문의 검수 데이터셋, 면책 고지 강화     |
| 의료법 위반 소지   | High | 중   | 법률 자문, "참고용" 명시, 진단 표현 배제 |
| 개인정보 유출      | High | 하   | E2E 암호화, RLS, 보안 감사 정기화        |
| 사용자 심리적 충격 | Med  | 중   | UX 카피 톤 관리, 상담 연결 기능          |
| API 비용 폭증      | Low  | 중   | Rate Limiting, 캐싱, Flash 모델 우선     |

---

## 8. 문서 의존성 맵

```
PRD.md (본 문서)
  ├── agents/orchestrator.agent.md
  ├── agents/frontend-dev.agent.md
  ├── agents/code-reviewer.agent.md
  ├── agents/security-reviewer.agent.md
  ├── agents/unit-tester.agent.md
  ├── agents/ux-writer.agent.md
  ├── shared/glossary.md
  └── shared/conventions.md
```
