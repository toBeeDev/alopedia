# 📋 ScalpCheck 코딩 & 네이밍 컨벤션

> 모든 에이전트가 준수하는 공통 컨벤션. Code Reviewer의 리뷰 기준이 됩니다.

---

## 1. 프로젝트 구조 규칙

```
src/
├── app/              # Next.js App Router (라우트 + 레이아웃만)
├── components/       # UI 컴포넌트 (도메인별 폴더)
│   ├── ui/           # shadcn/ui 기반 원자 컴포넌트
│   ├── scan/         # 촬영/업로드 관련
│   ├── analysis/     # AI 분석 결과 관련
│   ├── dashboard/    # 타임라인/캘린더
│   ├── board/        # 게시판
│   ├── gamification/ # 레벨/뱃지
│   └── layout/       # 공통 레이아웃
├── hooks/            # 커스텀 훅
├── lib/              # 유틸리티, API 클라이언트, 외부 서비스
├── stores/           # Zustand 스토어
├── types/            # TypeScript 타입/인터페이스
└── constants/        # 상수, 카피 텍스트
```

### 규칙

- `app/` 디렉토리에는 `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`만 위치
- 비즈니스 로직은 `hooks/` 또는 `lib/`에 분리
- 컴포넌트 파일 1개 = export 1개 (default export)
- 배럴 파일(index.ts)은 도메인 폴더 단위에서만 사용

---

## 2. 네이밍 컨벤션

### 2.1 파일/디렉토리

| 대상      | 패턴                    | 예시                             |
| --------- | ----------------------- | -------------------------------- |
| 컴포넌트  | PascalCase              | `AnalysisResultCard.tsx`         |
| 훅        | camelCase (use 접두사)  | `useCamera.ts`                   |
| 유틸리티  | camelCase               | `score.ts`, `nickname.ts`        |
| 타입 정의 | camelCase               | `scan.ts`, `analysis.ts`         |
| 상수      | camelCase               | `grades.ts`, `boards.ts`         |
| 테스트    | 원본파일명 + `.test`    | `score.test.ts`                  |
| Storybook | 원본파일명 + `.stories` | `AnalysisResultCard.stories.tsx` |
| API Route | route.ts (Next.js 규칙) | `app/api/scans/route.ts`         |

### 2.2 코드 내 네이밍

```typescript
// 컴포넌트: PascalCase
function AnalysisResultCard() {}

// 훅: camelCase + use 접두사
function useCamera() {}
function useImageUpload() {}

// 함수: camelCase + 동사 시작
function calculateScore() {}
function parseGeminiResponse() {}
function validateImage() {}

// 변수/상수: camelCase
const maxFileSize = 20 * 1024 * 1024;
const analysisTimeout = 30_000;

// 열거형 상수: UPPER_SNAKE_CASE (as const)
const NORWOOD_GRADES = {
  NORMAL: 1,
  MILD: 2,
  MODERATE: 3,
  SEVERE: 4,
  CRITICAL: 5,
} as const;

// 타입/인터페이스: PascalCase
interface ScanImage {
  type: "top" | "front" | "side";
  url: string;
  thumbnailUrl: string;
}

type NorwoodGrade = 1 | 2 | 3 | 4 | 5;

// DB 컬럼: snake_case (Supabase/PostgreSQL 규칙)
// user_id, created_at, norwood_grade

// API 응답 JSON: camelCase (프론트엔드 규칙)
// 서버에서 snake_case → camelCase 변환
```

### 2.3 커밋 메시지

```
<type>(<scope>): <subject>

type:
  feat     — 새 기능
  fix      — 버그 수정
  refactor — 리팩토링 (기능 변경 없음)
  style    — 코드 스타일 (포매팅, 세미콜론 등)
  test     — 테스트 추가/수정
  docs     — 문서 변경
  chore    — 빌드, 설정 등 기타
  security — 보안 관련 수정

scope: scan | analysis | board | dashboard | auth | common

예시:
  feat(scan): 카메라 가이드 오버레이 구현
  fix(analysis): Gemini 응답 파싱 에러 핸들링 추가
  security(scan): EXIF 스트리핑 서버사이드 적용
  test(analysis): Gemini 파서 엣지 케이스 테스트 추가
```

---

## 3. TypeScript 규칙

```typescript
// tsconfig.json strict: true 필수 항목
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 규칙

- `any` 타입 사용 **금지** (불가피 시 `// eslint-disable-next-line` + 사유 주석)
- `as` 타입 단언 최소화 → Type Guard 함수 사용 권장
- `enum` 사용 금지 → `as const` + `typeof` 패턴 사용
- 모든 함수의 반환 타입 명시 (추론에 의존하지 않음)
- `undefined` vs `null`: API 응답은 `null`, 로컬 미초기화는 `undefined`

---

## 4. React 컴포넌트 규칙

### 4.1 구조 템플릿

```typescript
// components/analysis/AnalysisResultCard.tsx

import { useState } from 'react';
import type { Analysis, Scan } from '@/types/analysis';

// 1. Props 인터페이스 (export for testing)
export interface AnalysisResultCardProps {
  scan: Scan;
  analysis: Analysis;
  isPublic: boolean;
  onToggleVisibility: () => void;
}

// 2. 컴포넌트 (default export)
export default function AnalysisResultCard({
  scan,
  analysis,
  isPublic,
  onToggleVisibility,
}: AnalysisResultCardProps): JSX.Element {
  // 3. Hooks (상단에 모아서)
  const [expanded, setExpanded] = useState(false);

  // 4. 이벤트 핸들러
  function handleToggleDetail(): void {
    setExpanded(prev => !prev);
  }

  // 5. 렌더링
  return (
    <article aria-label="AI 두피 분석 결과">
      {/* ... */}
    </article>
  );
}
```

### 4.2 금지 패턴

```typescript
// ❌ 인라인 스타일
<div style={{ color: 'red' }}>

// ✅ TailwindCSS
<div className="text-red-500">

// ❌ dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: content }} />

// ✅ 마크다운 렌더러 또는 텍스트만 표시
<div>{sanitizedContent}</div>

// ❌ useEffect for data fetching
useEffect(() => { fetch('/api/scans').then(...) }, []);

// ✅ React Query
const { data } = useQuery({ queryKey: ['scans'], queryFn: fetchScans });

// ❌ 카피 하드코딩
<p>분석이 완료됐어요!</p>

// ✅ 상수 파일에서 import
import { COPY } from '@/constants/copy';
<p>{COPY.analysis.complete}</p>
```

---

## 5. API Route 규칙

### 5.1 응답 포맷 표준

```typescript
// 성공 응답
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}

// 에러 응답
{
  "error": {
    "code": "IMAGE_TOO_SMALL",
    "message": "사진 해상도가 너무 낮아요."  // UX Writer 카피
  }
}
```

### 5.2 에러 코드 네이밍

```
{DOMAIN}_{ERROR_TYPE}

SCAN_IMAGE_TOO_SMALL
SCAN_IMAGE_WRONG_TYPE
SCAN_MIN_COUNT_NOT_MET
ANALYSIS_GEMINI_TIMEOUT
ANALYSIS_PARSE_FAILED
AUTH_SESSION_EXPIRED
RATE_LIMIT_EXCEEDED
```

### 5.3 Route Handler 템플릿

```typescript
// app/api/scans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. 인증 확인
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "로그인이 필요해요." } },
        { status: 401 },
      );
    }

    // 2. 입력 검증 (Zod)
    const body = await request.json();
    const parsed = scanCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: "입력값을 확인해주세요.",
          },
        },
        { status: 400 },
      );
    }

    // 3. 비즈니스 로직
    // ...

    // 4. 성공 응답
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    // 5. 에러 로깅 (Sentry)
    console.error("[POST /api/scans]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "서버에 문제가 생겼어요." } },
      { status: 500 },
    );
  }
}
```

---

## 6. 이미지 처리 규칙

```yaml
업로드 시:
  1. 클라이언트: 파일 타입 + 사이즈 1차 검증
  2. 클라이언트: Canvas로 리사이즈 (최대 2048px)
  3. 서버: Magic bytes 검증
  4. 서버: Sharp로 EXIF 완전 제거 + 리사이즈
  5. 서버: Supabase Storage에 저장
  6. 서버: Signed URL 발급

파일명 규칙:
  원본: 무시 (UUID로 대체)
  저장: {user_id}/{scan_id}/{type}.webp
  예시: abc123/scan456/top.webp

썸네일:
  사이즈: 300x300 (cover crop)
  포맷: WebP
  저장: {user_id}/{scan_id}/{type}_thumb.webp
```

---

## 7. 환경변수 규칙

```bash
# .env.local 예시
# 🔴 서버 전용 (절대 NEXT_PUBLIC_ 붙이지 않음)
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
SENTRY_AUTH_TOKEN=

# 🟢 클라이언트 노출 가능
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_APP_URL=

# 규칙:
# - API 키, 시크릿은 절대 NEXT_PUBLIC_ 금지
# - .env.local은 .gitignore에 포함
# - .env.example에 키 이름만 기록 (값 없이)
# - Vercel 환경변수에 등록 (Production/Preview 분리)
```

---

## 8. Git 브랜치 전략

```
main (production)
  └── develop (staging)
       ├── feat/scan-camera-guide
       ├── feat/analysis-result-card
       ├── fix/exif-stripping
       ├── security/gemini-proxy
       └── test/analysis-parser

규칙:
- main: 릴리즈 전용, 직접 커밋 금지
- develop: 기능 통합, PR만 허용
- feat/*: 기능 개발
- fix/*: 버그 수정
- security/*: 보안 수정 (Security Reviewer 필수 리뷰)
- test/*: 테스트 추가/수정
- PR: 최소 1명 Approve 필수
- squash merge 사용 (커밋 히스토리 깔끔하게)
```
