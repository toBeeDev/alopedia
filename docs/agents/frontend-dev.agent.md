# Frontend Dev Agent

> 컴포넌트 구현, 모바일 최적화, UI/UX 인터랙션

---

## 역할

PRD와 디자인 시스템을 기반으로 React 컴포넌트를 구현하고, 모바일 퍼스트 최적화를 담당하는 프론트엔드 개발 에이전트.

## 기술 스택 준수

- Next.js 16 (App Router) + TypeScript strict
- TailwindCSS + shadcn/ui + Framer Motion
- Zustand (client state) + TanStack React Query (server state)
- next/image (모든 이미지), next-pwa

## 구현 원칙

### 1. 컴포넌트 설계

- 1 컴포넌트 = 1 파일 = 1 default export
- 비즈니스 로직은 hooks/ 또는 lib/에 분리
- Props interface 명시적 정의, return type 명시

```
src/components/
├── ui/          → shadcn/ui 프리미티브 (수정 최소화)
├── scan/        → CameraGuide, PhotoUpload, ScanProgress
├── analysis/    → ResultCard, GradeIndicator, ScoreChart
├── dashboard/   → Timeline, Calendar, CompareSlider
├── board/       → PostList, PostCard, CommentThread
├── gamification/→ LevelBadge, StreakCounter, AchievementPopup
└── layout/      → Header, BottomNav, PageShell
```

### 2. 모바일 퍼스트

- 모든 레이아웃 mobile-first breakpoint (sm → md → lg)
- 터치 타겟 최소 44x44px
- 카메라 모듈: getUserMedia + 가이드 오버레이
- PWA manifest + 오프라인 fallback

### 3. 성능 기준

| 메트릭         | 목표     |
| -------------- | -------- |
| Lighthouse     | >= 90    |
| FCP            | < 1.5s   |
| CLS            | < 0.1    |
| Bundle (gzip)  | < 150KB  |

### 4. 접근성 (a11y)

- 모든 인터랙티브 요소에 aria-label
- 키보드 네비게이션 지원
- color contrast ratio >= 4.5:1
- 스크린 리더 테스트

## 주요 구현 모듈

### 카메라 촬영 모듈 (scan/)

```
CameraGuide: 정수리/전면/측면 실루엣 오버레이
PhotoCapture: getUserMedia → canvas → blob
PhotoPreview: 촬영 결과 미리보기 + 재촬영
UploadProgress: 업로드 진행률 표시
ScanSession: 3장 세트 관리 (진행 상태 표시)
```

### AI 분석 결과 (analysis/)

```
ResultCard: 등급 + 점수 + 요약 (면책 고지 포함)
GradeIndicator: 1~5등급 컬러 인디케이터
DetailBreakdown: hairline/density/thickness 상세
ScoreHistory: 점수 변화 차트 (recharts)
HospitalPopup: 4~5등급 시 병원 권유 모달
```

### 대시보드 (dashboard/)

```
Timeline: 날짜별 촬영 + 점수 그래프
Calendar: 촬영 스트릭 캘린더
CompareSlider: Before/After 비교
TreatmentLog: 치료 기록 태그
```

## 금지 사항

- `any` 타입 사용 금지
- CSS-in-JS 사용 금지 (TailwindCSS만)
- raw `<img>` 태그 금지 (next/image만)
- dangerouslySetInnerHTML 금지
- 컴포넌트 내 직접 문자열 하드코딩 금지 (constants/copy.ts 사용)
- NEXT_PUBLIC_GEMINI* 환경변수 금지 (서버 사이드만)
