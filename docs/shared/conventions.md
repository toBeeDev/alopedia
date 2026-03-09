# 코딩 & 네이밍 컨벤션

> 프로젝트 전체에서 일관성을 유지하기 위한 규칙

---

## 1. 파일 네이밍

| 대상           | 규칙          | 예시                        |
| -------------- | ------------- | --------------------------- |
| 컴포넌트       | PascalCase    | `ResultCard.tsx`            |
| 훅             | camelCase     | `useAnalysis.ts`            |
| 유틸리티       | camelCase     | `formatDate.ts`             |
| 상수           | camelCase     | `copy.ts`, `gradeConfig.ts` |
| 테스트         | *.test.ts(x)  | `score.test.ts`             |
| E2E 테스트     | *.spec.ts     | `scan-flow.spec.ts`         |
| 타입           | camelCase     | `analysis.ts`               |

## 2. 코드 네이밍

| 대상           | 규칙              | 예시                              |
| -------------- | ----------------- | --------------------------------- |
| 컴포넌트       | PascalCase        | `ResultCard`, `CameraGuide`       |
| 함수           | camelCase + 동사  | `calculateScore`, `formatDate`    |
| 훅             | use + PascalCase  | `useAnalysis`, `useScanHistory`   |
| 상수           | UPPER_SNAKE_CASE  | `MAX_UPLOAD_SIZE`, `GRADE_CONFIG` |
| 타입/인터페이스 | PascalCase        | `ScanResult`, `AnalysisDetail`    |
| 변수           | camelCase         | `currentGrade`, `scanImages`      |
| Boolean        | is/has/can 접두사 | `isLoading`, `hasStreak`          |

## 3. 데이터 레이어 네이밍

| 레이어        | 규칙        | 예시                                |
| ------------- | ----------- | ----------------------------------- |
| DB 컬럼       | snake_case  | `user_id`, `created_at`, `is_public`|
| DB 테이블     | snake_case  | `scan_results`, `treatment_logs`    |
| API 요청/응답 | camelCase   | `userId`, `createdAt`, `isPublic`   |

## 4. TypeScript 규칙

### 필수

- strict mode 활성화
- 함수 return type 명시
- `any` 타입 사용 금지
- `enum` 사용 금지 → `as const` + `typeof` 패턴

```typescript
// enum 대신 as const 패턴
const BOARD_TYPE = {
  MEDICATION_REVIEW: "medication_review",
  PROCEDURE_REVIEW: "procedure_review",
  QNA: "qna",
  LOUNGE: "lounge",
} as const;

type BoardType = typeof BOARD_TYPE[keyof typeof BOARD_TYPE];
```

### Props 정의

```typescript
interface ResultCardProps {
  grade: number;
  score: number;
  onRetry: () => void;
}

export default function ResultCard({ grade, score, onRetry }: ResultCardProps): React.ReactElement {
  // ...
}
```

## 5. 컴포넌트 구조

```typescript
// 1. imports
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/hooks/useAnalysis";
import { COPY } from "@/constants/copy";
import type { AnalysisResult } from "@/types/analysis";

// 2. types
interface Props {
  scanId: string;
}

// 3. component
export default function ResultView({ scanId }: Props): React.ReactElement {
  // hooks first
  const { data, isLoading } = useAnalysis(scanId);
  // state
  const [isExpanded, setIsExpanded] = useState(false);
  // derived values (no state for these)
  const gradeColor = getGradeColor(data?.grade);
  // render
  return (/* ... */);
}
```

## 6. 상태 관리 규칙

| 상태 종류          | 도구              | 사용처                          |
| ------------------ | ----------------- | ------------------------------- |
| 서버 데이터        | React Query       | API 응답, 캐싱, 재검증         |
| 글로벌 클라이언트  | Zustand           | 인증 상태, UI 모드, 설정       |
| 로컬 UI            | useState          | 모달 열림, 입력값, 토글        |
| URL 상태           | searchParams      | 필터, 페이지네이션, 탭         |

## 7. Import 순서

```typescript
// 1. React / Next.js
import { useState, useEffect } from "react";
import Image from "next/image";

// 2. 외부 라이브러리
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// 3. 내부 컴포넌트
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/analysis/ResultCard";

// 4. hooks / lib / stores
import { useAnalysis } from "@/hooks/useAnalysis";
import { calculateScore } from "@/lib/utils/score";

// 5. types
import type { ScanResult } from "@/types/scan";

// 6. constants
import { COPY } from "@/constants/copy";
```

## 8. Git 컨벤션

### 커밋 메시지

```
<type>(<scope>): <subject>

type: feat | fix | refactor | test | security | docs | chore
scope: scan | analysis | board | dashboard | auth | infra
subject: 50자 이내, 현재형, 소문자 시작
```

예시:
```
feat(scan): add camera guide overlay for top view
fix(analysis): correct grade calculation for borderline scores
security(image): add EXIF stripping validation
test(scan): add E2E test for full scan flow
```

### 브랜치

```
feat/scan-camera-guide
fix/analysis-score-calc
security/exif-stripping
test/e2e-scan-flow
```
