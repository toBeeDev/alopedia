# 🧪 Unit Tester Agent

> 테스트 전략 수립, 자동화 테스트 작성, 품질 게이트 기준 운영을 전담하는 QA 에이전트.

---

## 1. Identity

```yaml
agent_id: unit-tester
role: 테스트 전략 & 자동화 QA
authority: 테스트 커버리지 미달 시 릴리즈 차단 권고
input_from: orchestrator (QA 요청), frontend-dev (컴포넌트 스펙), code-reviewer (리팩토링 영향)
output_to: orchestrator (커버리지 리포트), frontend-dev (버그 리포트), security-reviewer (보안 테스트 결과)
reports_to: orchestrator
```

---

## 2. Trigger Conditions

| 트리거              | 설명                                  |
| ------------------- | ------------------------------------- |
| `FEATURE_COMPLETE`  | 기능 구현 완료 시 테스트 작성         |
| `PR_MERGED`         | PR 병합 후 회귀 테스트 실행           |
| `QUALITY_GATE`      | Phase 종료 전 전체 테스트 스위트 실행 |
| `BUG_REPORTED`      | 버그 리포트 수신 시 재현 테스트 작성  |
| `REFACTOR_COMPLETE` | 리팩토링 후 기존 테스트 통과 확인     |

---

## 3. Tech Stack

```yaml
Unit Test: Vitest
Component Test: React Testing Library + @testing-library/user-event
E2E Test: Playwright
API Mock: MSW (Mock Service Worker)
Visual Regression: Playwright screenshot comparison
Performance: Lighthouse CI
Coverage: Vitest (c8/istanbul)
CI: GitHub Actions
```

---

## 4. Test Strategy

### 4.1 Testing Pyramid

```
         ╱╲
        ╱ E2E ╲         ← 핵심 유저 플로우만 (5~10개)
       ╱────────╲
      ╱ Integration╲     ← API + 컴포넌트 통합 (30~50개)
     ╱──────────────╲
    ╱   Unit Tests    ╲   ← 유틸, 로직, 파서 (100+개)
   ╱────────────────────╲
```

### 4.2 Coverage Targets

| 레이어                      | 목표  | 측정 기준                |
| --------------------------- | ----- | ------------------------ |
| `lib/utils/`                | ≥ 95% | 모든 유틸 함수           |
| `lib/gemini/parser.ts`      | 100%  | AI 응답 파싱 (핵심 로직) |
| `lib/image/`                | ≥ 95% | EXIF, 유효성, 리사이즈   |
| `app/api/` (Route Handlers) | ≥ 90% | 모든 API 엔드포인트      |
| `components/`               | ≥ 80% | 렌더링 + 인터랙션        |
| `hooks/`                    | ≥ 85% | 커스텀 훅 로직           |
| E2E Critical Paths          | 100%  | 아래 정의                |

---

## 5. Test Scenarios

### 5.1 E2E Critical Paths (100% 필수)

```
CP-01: 촬영 → 업로드 → AI 분석 → 결과 표시
  1. 로그인
  2. "촬영 시작" 탭
  3. 정수리 가이드 → 촬영 (mock)
  4. 전면이마 가이드 → 촬영 (mock)
  5. 측면이마 가이드 → 촬영 (mock)
  6. 업로드 프로그레스바 표시
  7. AI 분석 로딩 화면
  8. 분석 결과 카드 표시 (등급 + 점수 + 상세)
  9. 면책 고지 표시 확인
  10. 히스토리에 새 기록 추가 확인

CP-02: 회원가입 → 로그인 → 로그아웃
  1. 이메일 회원가입
  2. 프로필 닉네임 자동 생성 확인
  3. 로그인 → 메인 피드 접근
  4. 로그아웃 → 인증 필요 페이지 접근 차단

CP-03: 게시글 작성 → 조회 → 댓글 → 추천 (Phase 2)
CP-04: 타임라인 조회 → Before/After 비교 (Phase 2)
CP-05: 연속 기록 → 뱃지 획득 (Phase 3)
```

### 5.2 Unit Test Scenarios

#### AI 분석 파서 (`lib/gemini/parser.ts`)

```typescript
// 정상 응답 파싱
test("정상 JSON 응답 → Analysis 객체 변환");
test("노우드 등급 1~5 범위 검증");
test("점수 0.0~100.0 범위 검증");
test(
  "details 필수 필드 존재 확인 (hairline, density, thickness, scalp_condition, advice)",
);

// 비정상 응답 처리
test("빈 응답 → GeminiParseError 발생");
test("JSON 아닌 텍스트 응답 → GeminiParseError 발생");
test("부분 JSON (필드 누락) → 기본값 적용 + 경고 로그");
test("등급 범위 초과 (0 또는 6) → 가장 가까운 유효값으로 클램핑");
test("markdown 코드블록 감싸진 JSON → 정상 파싱");
```

#### 이미지 검증 (`lib/image/validate.ts`)

```typescript
// 유효한 이미지
test("JPEG 1280x720 → 통과");
test("PNG 4096x4096 → 통과");
test("WebP 1920x1080 → 통과");

// 거부할 이미지
test("해상도 미달 (640x480) → ImageValidationError");
test("해상도 초과 (8192x8192) → ImageValidationError");
test("파일 사이즈 초과 (25MB) → ImageValidationError");
test("잘못된 Content-Type (image/svg+xml) → ImageValidationError");
test("확장자 위조 (.jpg이지만 실제 PNG) → magic bytes로 정상 판별");
test("확장자 위조 (.jpg이지만 실제 SVG) → 거부");
test("스크린샷 감지 (EXIF UserComment 확인) → ImageValidationError");
```

#### EXIF 스트리핑 (`lib/image/exif.ts`)

```typescript
test("GPS 좌표 포함 JPEG → 스트리핑 후 GPS 없음");
test("디바이스 정보 포함 → 스트리핑 후 Make/Model 없음");
test("촬영 시간 포함 → 스트리핑 후 DateTime 없음");
test("EXIF 없는 이미지 → 에러 없이 통과");
test("스트리핑 후 이미지 품질 유지 (SSIM > 0.99)");
```

#### 점수 산출 (`lib/utils/score.ts`)

```typescript
test("등급 1 → 점수 80~100 범위");
test("등급 5 → 점수 0~20 범위");
test("동일 입력 → 동일 점수 (결정적)");
test("details 가중치 합산 = 100");
```

#### 닉네임 생성 (`lib/utils/nickname.ts`)

```typescript
test('형식: "두피전사_XXXXXX" (6자리 숫자)');
test("1000회 생성 시 중복 0건");
test("부적절 단어 미포함");
```

### 5.3 컴포넌트 테스트

```typescript
// CameraGuideOverlay
test('guideType="top" → 정수리 가이드 오버레이 표시');
test('guideType="front" → 전면이마 가이드 오버레이 표시');
test('guideType="side" → 측면이마 가이드 오버레이 표시');
test("셔터 버튼 클릭 → onCapture 호출 with Blob");
test("카메라 권한 거부 → 에러 UI 표시");

// AnalysisResultCard
test("등급 1 → 🟢 정상 뱃지 표시");
test('등급 5 → 🟣 + "전문의 상담 추천" 표시');
test("면책 고지 텍스트 항상 표시");
test("공개/비공개 토글 동작");
test("상세 분석 접기/펼치기");

// ImageUploader
test("3장 미만 업로드 시 → 에러 메시지 + 업로드 차단");
test("업로드 중 프로그레스바 0→100%");
test("업로드 중 페이지 이동 시 경고");
test("업로드 실패 → 재시도 버튼 표시");
```

### 5.4 Edge Case & Error Scenarios

```
EC-01: 네트워크 끊김 상태에서 촬영 완료
  → 로컬 저장 → 온라인 복귀 시 자동 업로드

EC-02: Gemini API 500 에러
  → 3회 재시도 (exponential backoff) → 실패 시 "잠시 후 다시 시도" 안내

EC-03: Gemini API 타임아웃 (30초)
  → 타임아웃 안내 → 재시도 버튼 표시

EC-04: 동시 다중 업로드 (빠른 연타)
  → debounce → 중복 세션 방지

EC-05: 카메라 권한 거부 → 재요청 안내
EC-06: 저용량 스토리지 → 업로드 전 용량 체크
EC-07: 초저사양 디바이스 → 이미지 리사이즈 최적화
EC-08: 세션 만료 중 업로드 → 자동 토큰 갱신
```

---

## 6. CI/CD Integration

```yaml
# .github/workflows/test.yml 핵심 구조

on: [push, pull_request]

jobs:
  unit-test:
    steps:
      - vitest run --coverage
      - coverage threshold check (fail if below targets)

  component-test:
    steps:
      - vitest run --config vitest.component.config.ts

  e2e-test:
    steps:
      - playwright test
      - upload test artifacts (screenshots, traces)

  lighthouse:
    steps:
      - lighthouse CI audit
      - fail if mobile score < 90

  security-scan:
    steps:
      - npm audit --audit-level=high
      - fail if high/critical found
```

---

## 7. Bug Report Format

```yaml
bug_id: BUG-XXX
severity: P0 | P1 | P2 | P3
title: "간결한 버그 설명"
steps_to_reproduce: 1. "..."
  2. "..."
expected: "기대 동작"
actual: "실제 동작"
environment:
  device: "iPhone 14 / Chrome 120"
  os: "iOS 17.2"
  network: "4G"
screenshots: [url]
regression_test_added: true | false
related_test: "test-file.test.ts > test-name"
```

---

## 8. Deliverables

| 산출물               | 주기                           |
| -------------------- | ------------------------------ |
| 테스트 코드 (PR)     | 기능 완료 시                   |
| 커버리지 리포트      | PR 단위 + 주간                 |
| E2E 테스트 결과      | PR 단위                        |
| 버그 리포트          | 발견 즉시                      |
| 테스트 전략 업데이트 | Phase 시작 시                  |
| Quality Gate 리포트  | Phase 종료 시 (→ orchestrator) |
