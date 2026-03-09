# 🎨 ScalpCheck Design System — `design.md`

> monday.com Vibe UI Kit의 디자인 원칙 · 토큰 체계 · 컴포넌트 패턴을 ScalpCheck 도메인에 맵핑한 디자인 가이드.
>
> **Figma Source**: [Vibe UI Kit by monday.com (Community)](https://www.figma.com/design/EX1sSXsKNFQVX9kD4gfMZM)
> **Vibe Docs**: [vibe.monday.com](https://vibe.monday.com)

---

## 1. Design Principles

Vibe의 핵심 원칙을 ScalpCheck 맥락에서 재해석합니다.

| Vibe 원칙                          | ScalpCheck 적용                                                       |
| ---------------------------------- | --------------------------------------------------------------------- |
| **Clarity** — 사용자가 즉시 이해   | AI 분석 결과를 컬러코드 + 아이콘으로 직관 전달. 의료 용어는 쉬운 말로 |
| **Consistency** — 반복 가능한 패턴 | 토큰 기반 스타일링. 분석 카드·게시글 카드 등 카드 패턴 통일           |
| **Delight** — 미세한 즐거움        | 촬영 가이드 애니메이션, 스트릭 카운터, 뱃지 획득 이펙트               |
| **Accessibility** — 모든 사용자    | WCAG AA 색상 대비, 스크린리더 완벽 지원, 키보드 내비게이션            |
| **Empathy** — 사용자 감정 배려     | 탈모는 민감한 주제. 결과 전달 시 격려 톤, 수치심 배제                 |

---

## 2. Design Tokens

### 2.1 Token Architecture (Vibe 3-Layer 구조)

```
Primitive Tokens (원시값)
  └── Semantic Tokens (의미 부여)
       └── Component Tokens (컴포넌트 바인딩)

예시:
  --color-blue-500: #6161FF          ← Primitive
  --color-primary: var(--color-blue-500)  ← Semantic
  --button-primary-bg: var(--color-primary)  ← Component
```

### 2.2 Color Palette

#### Primitive Colors

```css
:root {
  /* ── Brand ── */
  --color-brand-purple: #6161ff;
  --color-brand-dark: #181b34;
  --color-brand-light: #f0f0ff;

  /* ── Neutral (Gray Scale) ── */
  --color-snow-white: #ffffff;
  --color-gray-50: #f7f8fa;
  --color-gray-100: #eeeff2;
  --color-gray-200: #d9dbe1;
  --color-gray-300: #c3c6d0;
  --color-gray-400: #9da0ae;
  --color-gray-500: #676879;
  --color-gray-600: #535768;
  --color-gray-700: #323338;
  --color-gray-800: #1c1f3b;
  --color-gray-900: #111827;

  /* ── Green (정상/성공) ── */
  --color-green-50: #ecfdf5;
  --color-green-100: #d1fae5;
  --color-green-300: #6ee7b7;
  --color-green-500: #22c55e;
  --color-green-700: #15803d;

  /* ── Yellow (경미/경고) ── */
  --color-yellow-50: #fefce8;
  --color-yellow-100: #fef9c3;
  --color-yellow-300: #fde047;
  --color-yellow-500: #eab308;
  --color-yellow-700: #a16207;

  /* ── Orange (주의) ── */
  --color-orange-50: #fff7ed;
  --color-orange-100: #ffedd5;
  --color-orange-300: #fdba74;
  --color-orange-500: #f97316;
  --color-orange-700: #c2410c;

  /* ── Red (경고/에러) ── */
  --color-red-50: #fef2f2;
  --color-red-100: #fee2e2;
  --color-red-300: #fca5a5;
  --color-red-500: #ef4444;
  --color-red-700: #b91c1c;

  /* ── Violet (심각/특수) ── */
  --color-violet-50: #f5f3ff;
  --color-violet-100: #ede9fe;
  --color-violet-300: #c4b5fd;
  --color-violet-500: #a855f7;
  --color-violet-700: #7c3aed;

  /* ── Blue (정보/링크) ── */
  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-300: #93c5fd;
  --color-blue-500: #6161ff;
  --color-blue-700: #4338ca;
}
```

#### Semantic Colors

```css
:root {
  /* ── Surface ── */
  --color-bg-primary: var(--color-snow-white);
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);
  --color-bg-elevated: var(--color-snow-white); /* 카드, 모달 */
  --color-bg-overlay: rgba(24, 27, 52, 0.6); /* 오버레이 */

  /* ── Text ── */
  --color-text-primary: var(--color-gray-700);
  --color-text-secondary: var(--color-gray-500);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-inverse: var(--color-snow-white);
  --color-text-link: var(--color-blue-500);
  --color-text-disabled: var(--color-gray-300);

  /* ── Border ── */
  --color-border-default: var(--color-gray-200);
  --color-border-hover: var(--color-gray-300);
  --color-border-focus: var(--color-blue-500);
  --color-border-error: var(--color-red-500);

  /* ── Interactive ── */
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-700);
  --color-primary-active: #3a3ac7;
  --color-primary-disabled: var(--color-gray-200);

  /* ── Feedback ── */
  --color-success: var(--color-green-500);
  --color-warning: var(--color-yellow-500);
  --color-error: var(--color-red-500);
  --color-info: var(--color-blue-500);

  /* ── ScalpCheck 등급 (Domain-Specific) ── */
  --color-grade-1: var(--color-green-500);
  --color-grade-1-bg: var(--color-green-50);
  --color-grade-2: var(--color-yellow-500);
  --color-grade-2-bg: var(--color-yellow-50);
  --color-grade-3: var(--color-orange-500);
  --color-grade-3-bg: var(--color-orange-50);
  --color-grade-4: var(--color-red-500);
  --color-grade-4-bg: var(--color-red-50);
  --color-grade-5: var(--color-violet-500);
  --color-grade-5-bg: var(--color-violet-50);
}
```

#### Dark Theme Override

```css
[data-theme="dark"] {
  --color-bg-primary: #1c1f3b;
  --color-bg-secondary: #232640;
  --color-bg-tertiary: #2c2f4a;
  --color-bg-elevated: #2c2f4a;
  --color-bg-overlay: rgba(0, 0, 0, 0.7);

  --color-text-primary: #e8e9ed;
  --color-text-secondary: #9da0ae;
  --color-text-tertiary: #676879;
  --color-text-inverse: #1c1f3b;

  --color-border-default: #3c3f54;
  --color-border-hover: #535768;

  /* 등급 컬러는 유지 (어두운 배경에서도 식별 가능) */
  --color-grade-1-bg: rgba(34, 197, 94, 0.15);
  --color-grade-2-bg: rgba(234, 179, 8, 0.15);
  --color-grade-3-bg: rgba(249, 115, 22, 0.15);
  --color-grade-4-bg: rgba(239, 68, 68, 0.15);
  --color-grade-5-bg: rgba(168, 85, 247, 0.15);
}
```

### 2.3 Typography

Vibe는 **Poppins** (브랜드/마케팅)과 **Figtree** (플랫폼 UI)를 사용합니다.
ScalpCheck는 한국어 본문 가독성을 위해 **Pretendard**를 추가합니다.

```css
:root {
  /* ── Font Family ── */
  --font-family-heading: "Poppins", "Pretendard", -apple-system, sans-serif;
  --font-family-body: "Figtree", "Pretendard", -apple-system, sans-serif;
  --font-family-mono: "Roboto Mono", "JetBrains Mono", monospace;

  /* ── Font Size (Vibe Scale) ── */
  --font-size-xs: 12px; /* 캡션, 타임스탬프 */
  --font-size-sm: 14px; /* 보조 텍스트, 라벨 */
  --font-size-md: 16px; /* 본문 기본 */
  --font-size-lg: 18px; /* 섹션 제목 */
  --font-size-xl: 20px; /* 카드 제목 */
  --font-size-2xl: 24px; /* 페이지 제목 */
  --font-size-3xl: 32px; /* 히어로 제목 */
  --font-size-4xl: 40px; /* 스플래시/온보딩 */

  /* ── Font Weight ── */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ── Line Height ── */
  --line-height-tight: 1.2; /* 제목 */
  --line-height-normal: 1.5; /* 본문 */
  --line-height-relaxed: 1.75; /* 긴 본문 */

  /* ── Letter Spacing ── */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
}
```

#### Type Scale 적용

| 용도            | 폰트               | 사이즈     | 웨이트   | 행간   |
| --------------- | ------------------ | ---------- | -------- | ------ |
| 스플래시 제목   | Poppins            | 4xl (40px) | Bold     | Tight  |
| 페이지 타이틀   | Poppins            | 2xl (24px) | Semibold | Tight  |
| 카드 제목       | Figtree            | xl (20px)  | Semibold | Tight  |
| 섹션 헤딩       | Figtree            | lg (18px)  | Medium   | Normal |
| 본문            | Figtree/Pretendard | md (16px)  | Regular  | Normal |
| 보조 텍스트     | Figtree/Pretendard | sm (14px)  | Regular  | Normal |
| 캡션/타임스탬프 | Figtree            | xs (12px)  | Regular  | Normal |
| 뱃지/태그       | Figtree            | xs (12px)  | Medium   | Tight  |
| 점수 숫자       | Poppins            | 3xl (32px) | Bold     | Tight  |

### 2.4 Spacing & Layout

Vibe의 4px 베이스 그리드 시스템을 따릅니다.

```css
:root {
  /* ── Spacing Scale (4px base) ── */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* ── Content Width ── */
  --content-max-width: 480px; /* 모바일 퍼스트 (카드, 폼) */
  --content-wide-width: 768px; /* 태블릿/대시보드 */
  --content-full-width: 1200px; /* 데스크톱 최대 */

  /* ── Border Radius (Vibe: rounded, friendly) ── */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px; /* 뱃지, 아바타 */

  /* ── Z-Index Scale ── */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
  --z-tooltip: 500;
  --z-overlay: 600;
}
```

### 2.5 Elevation & Shadow

Vibe 스타일의 부드러운 그림자 시스템:

```css
:root {
  --shadow-xs: 0 1px 2px rgba(24, 27, 52, 0.05);
  --shadow-sm: 0 2px 4px rgba(24, 27, 52, 0.08);
  --shadow-md: 0 4px 12px rgba(24, 27, 52, 0.1);
  --shadow-lg: 0 8px 24px rgba(24, 27, 52, 0.12);
  --shadow-xl: 0 16px 48px rgba(24, 27, 52, 0.16);

  /* 카드 기본 */
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-md);
  --shadow-card-active: var(--shadow-xs);

  /* 플로팅 요소 */
  --shadow-floating: var(--shadow-lg);
  --shadow-modal: var(--shadow-xl);
}
```

### 2.6 Motion & Animation

Vibe의 Framer Motion 기반 모션 가이드:

```css
:root {
  /* ── Duration ── */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* ── Easing (Vibe: productive + expressive) ── */
  --ease-productive: cubic-bezier(0.2, 0, 0.38, 0.9); /* 일상적 전환 */
  --ease-expressive: cubic-bezier(0.4, 0.14, 0.3, 1); /* 강조 전환 */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* 뱃지, 포인트 */
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1); /* 모달, 시트 */
}
```

#### Motion Principles

| 카테고리        | 동작            | Duration       | Easing     | 예시                  |
| --------------- | --------------- | -------------- | ---------- | --------------------- |
| **Micro**       | 호버, 포커스    | Fast (100ms)   | Productive | 버튼 호버 색상 전환   |
| **Small**       | 토글, 탭 전환   | Normal (200ms) | Productive | 게시판 탭 전환        |
| **Medium**      | 카드 확장, 모달 | Slow (300ms)   | Expressive | 분석 결과 카드 펼치기 |
| **Large**       | 페이지 전환     | Slower (500ms) | Spring     | 촬영 → 결과 화면 전환 |
| **Celebratory** | 뱃지 획득       | 500~800ms      | Bounce     | 스트릭 달성, 레벨업   |

---

## 3. Component Design Specs

### 3.1 컴포넌트 매핑 (Vibe → ScalpCheck)

| Vibe 컴포넌트     | ScalpCheck 적용                 | 커스텀 수준            |
| ----------------- | ------------------------------- | ---------------------- |
| Button            | 촬영 시작, 업로드, CTA          | 등급 컬러 variant 추가 |
| Card (Box)        | 분석 결과 카드, 게시글 카드     | **완전 커스텀**        |
| Avatar            | 유저 프로필 (익명 아바타)       | 시드 기반 생성         |
| Badge             | 등급 뱃지, 업적 뱃지            | **도메인 특화**        |
| ProgressBar       | 업로드 프로그레스, 점수 게이지  | 등급 컬러 바인딩       |
| Tabs              | 게시판 탭, 대시보드 탭          | 그대로 사용            |
| Toast (Feedback)  | 업로드 완료, 에러, 뱃지 획득    | 등급 컬러              |
| Modal (Dialog)    | 면책 동의, 삭제 확인, 병원 권유 | 커스텀 헤더            |
| TextField (Input) | 로그인, 게시글 작성             | 그대로 사용            |
| Tooltip           | 등급 설명, 분석 항목 설명       | 그대로 사용            |
| Skeleton          | AI 분석 로딩                    | 카드 형태 커스텀       |
| Chip (Tag)        | 약물명, 시술명, 게시판 태그     | 컬러 variant 추가      |
| Calendar          | 두피 캘린더 (스트릭)            | **완전 커스텀**        |
| Slider            | Before/After 비교               | **완전 커스텀**        |

### 3.2 핵심 컴포넌트 상세

#### Analysis Result Card

```
┌──────────────────────────────────────┐
│  ┌──────┐ ┌──────┐ ┌──────┐         │ ← 3장 썸네일 (탭 전환)
│  │ 정수리│ │ 전면 │ │ 측면 │         │
│  └──────┘ └──────┘ └──────┘         │
│                                      │
│  ┌─ 등급 뱃지 ─────────────────────┐ │
│  │  🟢 정상     Score 87.5        │ │ ← NorwoodGradeBadge + ScoreGauge
│  └─────────────────────────────────┘ │
│                                      │
│  좋은 상태를 유지하고 계세요!         │ ← grade별 헤드라인 (UX Writer)
│  뚜렷한 탈모 징후는 보이지 않아요.    │ ← grade별 설명
│                                      │
│  ▸ 상세 분석 보기                    │ ← Expandable Section
│  ┌─────────────────────────────────┐ │
│  │ 헤어라인 형태  ████████░░  80%  │ │
│  │ 모발 밀도      █████████░  90%  │ │ ← 항목별 프로그레스 바
│  │ 모발 굵기      ████████░░  85%  │ │
│  │ 두피 상태      ███████░░░  75%  │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ⚠ AI 참고용 분석 · 의료 진단 아님   │ ← 면책 고지 (항상 표시)
│                                      │
│  [🔒 비공개]  [📤 공유]  [💬 12]     │ ← 액션 버튼
└──────────────────────────────────────┘

Specs:
  width: 100% (max 480px)
  padding: var(--space-5) (20px)
  border-radius: var(--radius-lg) (16px)
  background: var(--color-bg-elevated)
  shadow: var(--shadow-card)
  shadow (hover): var(--shadow-card-hover)
  border-left: 4px solid var(--color-grade-{n})
```

#### Camera Guide Overlay

```
┌──────────────────────────────────────┐
│          카메라 프리뷰 영역           │
│                                      │
│       ┌─────────────────┐            │
│       │                 │            │ ← 반투명 가이드 영역
│       │   (가이드 실루엣)│            │    영역 외: rgba(0,0,0,0.5)
│       │                 │            │
│       └─────────────────┘            │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  정수리를 촬영해주세요            ││ ← 인스트럭션 (UX Writer)
│  │  밝은 곳에서 머리 위에서 찍어주세요││ ← 팁
│  └──────────────────────────────────┘│
│                                      │
│      [1/3]  ● ○ ○                   │ ← 단계 인디케이터
│                                      │
│            (◉ 셔터)                  │ ← 촬영 버튼
│                                      │
│  [다시 찍기]              [건너뛰기] │ ← 보조 액션
└──────────────────────────────────────┘

Specs:
  overlay-bg: rgba(0, 0, 0, 0.5)
  guide-border: 2px dashed var(--color-snow-white), opacity 0.8
  instruction-bg: var(--color-bg-overlay) backdrop-blur(12px)
  shutter-size: 72px, border-radius: var(--radius-full)
  shutter-ring: 4px solid white
  step-indicator: var(--color-primary) active, var(--color-gray-400) inactive
```

#### Norwood Grade Badge

```
  ┌───────────────────┐
  │  🟢 정상          │   Grade 1: bg var(--color-grade-1-bg), text var(--color-grade-1)
  └───────────────────┘
  ┌───────────────────┐
  │  🟡 경미          │   Grade 2: bg var(--color-grade-2-bg), text var(--color-grade-2)
  └───────────────────┘
  ┌───────────────────┐
  │  🟠 주의          │   Grade 3: bg var(--color-grade-3-bg), text var(--color-grade-3)
  └───────────────────┘
  ┌───────────────────┐
  │  🔴 관리 필요      │   Grade 4: bg var(--color-grade-4-bg), text var(--color-grade-4)
  └───────────────────┘
  ┌───────────────────┐
  │  🟣 전문 상담 추천  │   Grade 5: bg var(--color-grade-5-bg), text var(--color-grade-5)
  └───────────────────┘

Specs:
  padding: var(--space-1) var(--space-3)  (4px 12px)
  border-radius: var(--radius-full)
  font: var(--font-size-sm), var(--font-weight-semibold)
  icon: 16px emoji or SVG
```

#### Score Gauge

```
  ┌─────────────────────────────┐
  │         87.5                │   ← 큰 숫자 (Poppins Bold 3xl)
  │                             │
  │  ███████████████████░░░░░   │   ← Circular or Linear Gauge
  │                             │
  │  100점 만점 기준             │   ← 캡션 (xs)
  └─────────────────────────────┘

Specs:
  gauge-height: 8px
  gauge-bg: var(--color-gray-100)
  gauge-fill: var(--color-grade-{n})  // 등급에 따라 색상 변경
  gauge-radius: var(--radius-full)
  number-font: Poppins, --font-size-3xl, --font-weight-bold
  transition: width var(--duration-slow) var(--ease-expressive)
```

### 3.3 Before/After Slider

```
  ┌───────────────────────────────────────┐
  │  2024.01.15          2024.04.15       │  ← 날짜 + 등급 뱃지
  │  🟠 주의              🟡 경미         │
  │                                       │
  │  ┌──────────┬────────────────────┐    │
  │  │          │                    │    │
  │  │  Before  │◄ 드래그 ►│  After  │    │  ← 이미지 오버레이
  │  │          │                    │    │
  │  └──────────┴────────────────────┘    │
  │               │ │                     │  ← 드래그 핸들
  │                                       │
  │  점수: 45.2 → 68.7 (+23.5 ▲)         │  ← 변화량
  └───────────────────────────────────────┘

Specs:
  handle-width: 4px, var(--color-primary)
  handle-grip: 32px circle, var(--color-snow-white), var(--shadow-md)
  transition: none (실시간 드래그)
  image-radius: var(--radius-md)
```

---

## 4. Layout System

### 4.1 Responsive Breakpoints

```css
/* Vibe는 모바일 퍼스트. ScalpCheck도 동일. */
--breakpoint-sm: 640px; /* 소형 태블릿 */
--breakpoint-md: 768px; /* 태블릿 */
--breakpoint-lg: 1024px; /* 노트북 */
--breakpoint-xl: 1280px; /* 데스크톱 */
```

### 4.2 Page Layout Template

```
┌─────────────────────────────────────┐
│  [Header]  Logo  NavTabs  [Profile] │  ← sticky top, h-56px
├─────────────────────────────────────┤
│                                     │
│           Main Content              │  ← padding: var(--space-4)
│           (max 480px mobile)        │     max-width: 480px (centered)
│                                     │
├─────────────────────────────────────┤
│  [📸] [📊] [💬] [📅] [👤]          │  ← Bottom Nav, h-64px
│  촬영  기록  게시판 캘린더 프로필     │     safe-area-inset-bottom
└─────────────────────────────────────┘
```

### 4.3 Bottom Navigation (Vibe 탭바 스타일)

```
  active: var(--color-primary), var(--font-weight-semibold)
  inactive: var(--color-text-tertiary), var(--font-weight-regular)
  icon-size: 24px
  label-size: var(--font-size-xs)
  gap (icon→label): var(--space-1)
  bg: var(--color-bg-primary)
  border-top: 1px solid var(--color-border-default)
  height: 64px + safe-area
```

---

## 5. Iconography

Vibe는 자체 아이콘 라이브러리(`@vibe/icons`)를 제공합니다.
ScalpCheck는 **Lucide React** + 커스텀 도메인 아이콘을 혼용합니다.

### 5.1 아이콘 사이즈 스케일

| 사이즈 | px   | 용도                       |
| ------ | ---- | -------------------------- |
| XS     | 16px | 인라인 텍스트, 태그 내     |
| SM     | 20px | 버튼 아이콘, 리스트 아이콘 |
| MD     | 24px | 내비게이션, 카드 액션      |
| LG     | 32px | 빈 상태, 피처 아이콘       |
| XL     | 48px | 온보딩, 결과 강조          |

### 5.2 커스텀 도메인 아이콘 (SVG)

```
📸 ScalpScan      — 카메라 + 두피 실루엣
📊 Timeline       — 그래프 + 시계
🔬 Analysis       — 돋보기 + 모발
💊 Medication     — 약 캡슐
🏥 Procedure      — 병원 십자
🔥 Streak         — 불꽃
🏆 Trophy         — 트로피
🛡️ Shield         — 보안/프라이버시
⚠️ Disclaimer     — 삼각형 느낌표
```

---

## 6. Figma Usage Guide

### 6.1 Figma 파일 구조 (Vibe UI Kit 기반)

```
Vibe UI Kit (Community File)
├── 🎨 Foundations
│   ├── Colors (Primitive + Semantic)
│   ├── Typography (Scale + Styles)
│   ├── Spacing (Grid + Spacing)
│   ├── Shadows (Elevation)
│   └── Icons
├── 🧩 Components
│   ├── Buttons
│   ├── Inputs
│   ├── Cards (Box)
│   ├── Badges
│   ├── Tabs
│   ├── Modals
│   ├── Tooltips
│   ├── Progress Bars
│   └── ...60+ components
└── 📱 Templates
    └── (ScalpCheck 커스텀 페이지 추가)
```

### 6.2 Figma → Code 매핑 룰

| Figma 속성               | CSS/Tailwind 변환                             |
| ------------------------ | --------------------------------------------- |
| Auto Layout gap: 8       | `gap-2` 또는 `var(--space-2)`                 |
| Corner Radius: 16        | `rounded-2xl` 또는 `var(--radius-lg)`         |
| Fill: color-bg-secondary | `bg-gray-50` 또는 `var(--color-bg-secondary)` |
| Text: Figtree/Semi/16    | `text-base font-semibold font-[Figtree]`      |
| Effect: shadow-md        | `shadow-md` 또는 `var(--shadow-md)`           |
| Opacity: 60%             | `opacity-60`                                  |

### 6.3 Figma 변수 ↔ CSS 변수 네이밍

```
Figma Variable Collection    →    CSS Variable
───────────────────────────────────────────────
Colors/Brand/Purple          →    --color-brand-purple
Colors/Gray/500              →    --color-gray-500
Colors/Grade/1               →    --color-grade-1
Spacing/4                    →    --space-4
Radius/lg                    →    --radius-lg
Shadow/card                  →    --shadow-card
```

---

## 7. Accessibility (a11y) Design Specs

### 7.1 색상 대비 요구사항

| 요소                | 최소 대비비 | 체크 방법                                      |
| ------------------- | ----------- | ---------------------------------------------- |
| 본문 텍스트         | 4.5:1 (AA)  | `--color-text-primary` on `--color-bg-primary` |
| 대형 텍스트 (≥24px) | 3:1 (AA)    | 제목류                                         |
| 등급 뱃지 텍스트    | 4.5:1 (AA)  | `--color-grade-{n}` on `--color-grade-{n}-bg`  |
| 비활성 텍스트       | 3:1         | `--color-text-disabled` 예외 허용              |
| 포커스 링           | 3:1         | `--color-border-focus`                         |

### 7.2 포커스 스타일 (Vibe 패턴)

```css
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### 7.3 터치 타겟

```
최소 터치 영역: 44 × 44px (WCAG 2.5.8)
셔터 버튼: 72 × 72px
하단 네비게이션 아이템: 48 × 64px (라벨 포함)
```

---

## 8. Document Dependencies

```
shared/design.md (본 문서)
  ├── 참조: shared/glossary.md         ← 등급 정의, 도메인 용어
  ├── 참조: shared/conventions.md      ← TailwindCSS 매핑 규칙
  ├── 소비: agents/frontend-dev.agent.md  ← 컴포넌트 구현 시 토큰 참조
  ├── 소비: agents/ux-writer.agent.md    ← 톤앤보이스 + 카피 길이/배치
  ├── 소비: agents/code-reviewer.agent.md ← 스타일 리뷰 기준
  └── 원본: Figma Vibe UI Kit          ← 디자인 소스 오브 트루스
```
