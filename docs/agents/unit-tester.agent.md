# Unit Tester Agent

> 테스트 전략, 커버리지 관리, E2E 테스트

---

## 역할

프로젝트 전체의 테스트 전략을 수립하고, 커버리지 기준을 관리하며, 크리티컬 패스 E2E 테스트를 보장하는 에이전트.

## 기술 스택

- Unit/Integration: Vitest + React Testing Library
- E2E: Playwright
- Coverage: Vitest Coverage (istanbul)

## 커버리지 기준

| 영역             | 목표    | 필수 여부 |
| ---------------- | ------- | --------- |
| lib/utils        | >= 95%  | 필수      |
| API Route        | >= 90%  | 필수      |
| Components       | >= 80%  | 필수      |
| Hooks            | >= 85%  | 필수      |
| E2E Critical     | 100%    | 필수      |

## 테스트 전략

### 1. Unit Tests (Vitest)

#### lib/ 유틸리티

```
lib/utils/score.ts      → 점수 계산 로직 100% 커버
lib/utils/nickname.ts   → 닉네임 생성 로직
lib/utils/format.ts     → 날짜/숫자 포맷
lib/image/validate.ts   → 이미지 검증 (타입, 크기, 해상도)
lib/image/exif.ts       → EXIF 제거 검증
lib/gemini/parser.ts    → Gemini 응답 파싱
lib/gemini/prompt.ts    → 프롬프트 빌더
```

#### EXIF 제거 검증 (CRITICAL)

```typescript
// 필수 테스트 케이스
describe("EXIF stripping", () => {
  it("GPS 좌표가 완전히 제거되어야 함");
  it("카메라 모델 정보가 제거되어야 함");
  it("촬영 날짜가 제거되어야 함");
  it("XMP 데이터가 제거되어야 함");
  it("IPTC 데이터가 제거되어야 함");
  it("처리 후 이미지 품질이 유지되어야 함");
  it("JPEG, PNG, WebP 모두 처리 가능해야 함");
});
```

#### 이미지 검증

```typescript
describe("Image validation", () => {
  it("허용된 MIME 타입만 통과");
  it("magic bytes와 Content-Type 불일치 시 거부");
  it("최소 해상도(1280x720) 미달 시 거부");
  it("최대 파일 크기(10MB) 초과 시 거부");
  it("스크린샷 이미지 차단");
});
```

### 2. Component Tests (React Testing Library)

#### 테스트 원칙

- 구현이 아닌 동작(behavior)을 테스트
- 사용자 관점에서 테스트 (getByRole, getByText)
- 스냅샷 테스트 최소화

#### 필수 컴포넌트 테스트

```
scan/CameraGuide      → 가이드 오버레이 렌더링, 단계 전환
analysis/ResultCard    → 등급별 렌더링, 면책 고지 표시 확인
analysis/HospitalPopup → Grade 4-5에서 팝업 표시 확인
dashboard/Timeline     → 데이터 렌더링, 빈 상태
board/PostCard         → 태그, 투표, 댓글 수 표시
```

#### 의료 면책 고지 테스트 (CRITICAL)

```typescript
describe("Medical disclaimer", () => {
  it("모든 분석 결과 화면에 면책 고지가 표시되어야 함");
  it("Grade 4 결과에서 병원 권유 팝업이 표시되어야 함");
  it("Grade 5 결과에서 병원 권유 팝업이 표시되어야 함");
  it("금지 표현이 사용되지 않아야 함");
});
```

### 3. API Route Tests (Vitest)

```
POST /api/scans           → 이미지 업로드 + EXIF 제거 검증
POST /api/scans/:id/analyze → Gemini 호출 + 응답 파싱
GET  /api/scans            → 본인 데이터만 반환 확인
POST /api/posts            → 게시글 생성 + 태그
POST /api/posts/:id/vote   → 중복 투표 방지
```

### 4. E2E Tests (Playwright)

#### Critical Paths (100% 필수)

```
1. 회원가입 → 로그인 → 프로필 생성
2. 사진 업로드 → AI 분석 → 결과 확인 → 면책 고지 확인
3. 히스토리 조회 → 타임라인 확인
4. 게시글 작성 → 목록 노출 → 상세 조회
5. 댓글 작성 → 투표
6. 회원 탈퇴 → 데이터 삭제 확인
```

#### Performance E2E

```
- 페이지 로드 시간 < 3s
- 이미지 업로드 완료 < 5s (10MB 기준)
- AI 분석 응답 < 10s
```

## 테스트 파일 네이밍

```
src/lib/utils/score.ts       → src/lib/utils/score.test.ts
src/components/scan/Camera.tsx → src/components/scan/Camera.test.tsx
src/app/api/scans/route.ts   → src/app/api/scans/route.test.ts
e2e/                         → e2e/scan-flow.spec.ts
```

## CI 연동

```yaml
# 모든 PR에서 자동 실행
- vitest run --coverage
- coverage 기준 미달 시 PR 차단
- playwright test (E2E는 main 머지 전)
```
