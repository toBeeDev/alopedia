# CLAUDE.md — ScalpCheck Project Instructions

## Project Overview

ScalpCheck는 AI(Gemini Vision) 기반 탈모 진단 & 치료 후기 익명 커뮤니티 플랫폼이다.
사용자가 정수리/전면이마/측면이마를 촬영하면 AI가 노우드-해밀턴 스케일 기반 5등급으로 분석하고, 개인 타임라인으로 추적하며, 약물/시술 후기를 공유할 수 있는 게시판을 제공한다.

벤치마크: https://brownfeed.com/ko/ (BrownFeed - 사진 촬영 → AI 분석 → 익명 커뮤니티 → 게이미피케이션 패턴)

## Tech Stack

- Framework: Next.js 16 (App Router) + TypeScript (strict)
- UI: TailwindCSS + shadcn/ui + Framer Motion
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- AI: Google Gemini Vision API (gemini-2.0-flash)
- State: Zustand (client) + TanStack React Query (server)
- Camera: MediaDevices API (getUserMedia)
- Image: Sharp (server-side resize/EXIF strip)
- PWA: next-pwa
- Test: Vitest + React Testing Library + Playwright
- Monitor: Sentry + Vercel Analytics
- Deploy: Vercel

## Architecture Rules

### Directory Structure

```
src/
├── app/                    # Next.js App Router (page/layout/loading/error only)
├── components/             # UI components by domain
│   ├── ui/                 # shadcn/ui primitives
│   ├── scan/               # 촬영/업로드
│   ├── analysis/           # AI 분석 결과
│   ├── dashboard/          # 타임라인/캘린더
│   ├── board/              # 게시판
│   ├── gamification/       # 레벨/뱃지
│   └── layout/             # 공통 레이아웃
├── hooks/                  # Custom hooks (use* prefix)
├── lib/                    # Utilities, API clients, external services
│   ├── supabase/           # client.ts, server.ts, middleware.ts
│   ├── gemini/             # client.ts, prompt.ts, parser.ts
│   ├── image/              # exif.ts, validate.ts, resize.ts
│   └── utils/              # score.ts, nickname.ts, format.ts
├── stores/                 # Zustand stores
├── types/                  # TypeScript types/interfaces
└── constants/              # Constants, copy text, grade config
```

### Coding Conventions

- TypeScript strict mode, NO `any` type
- 1 component = 1 file = 1 default export
- Business logic in hooks/ or lib/, NOT in components
- Server state: React Query. Global client state: Zustand. Local: useState
- All API calls via React Query (caching + error handling)
- Images: always next/image, never raw <img>
- No CSS-in-JS, TailwindCSS only
- No dangerouslySetInnerHTML
- All user-facing text from constants/copy.ts (never hardcode strings in components)
- enum 금지 → as const + typeof pattern
- Function return types must be explicit

### Naming

- Files: Components=PascalCase, hooks/utils=camelCase, tests=\*.test.ts
- Code: components=PascalCase, functions=camelCase+verb, constants=UPPER_SNAKE_CASE (as const)
- DB columns: snake_case (Supabase). API response JSON: camelCase (frontend)
- Commits: `<type>(<scope>): <subject>` (feat|fix|refactor|test|security|docs|chore)
- Branches: feat/_, fix/_, security/_, test/_

### Security (CRITICAL)

- Gemini API key: SERVER-ONLY via Route Handler proxy. NEVER use NEXT_PUBLIC_GEMINI\*
- EXIF: Strip server-side with Sharp on every upload. Double-check in tests
- Supabase RLS: Every table must have RLS policies (user_id = auth.uid())
- Image upload: Content-Type whitelist (JPEG/PNG/WebP only), magic bytes validation
- Rate limiting: AI analysis max 3/min, API max 60/min
- File names: Replace with UUID (never store original filename)
- All env secrets without NEXT*PUBLIC* prefix

### Medical Disclaimer (REQUIRED)

- Every AI analysis result screen MUST show: "AI 참고용 분석 · 의료 진단 아님"
- Grade 4-5 results MUST trigger hospital recommendation popup
- Never use words: "진단합니다", "치료가 필요합니다", "약을 드세요"
- Use instead: "분석합니다", "전문의 상담을 추천합니다", "이런 치료를 받는 분들이 있어요"

## Sub-Agent System

이 프로젝트는 6개 Sub-Agent 역할로 구성된다. 각 agent의 상세 스펙은 docs/agents/\*.agent.md를 참조.

| Agent                | 파일                                   | 역할                              |
| -------------------- | -------------------------------------- | --------------------------------- |
| 🎯 Orchestrator      | docs/agents/orchestrator.agent.md      | 워크플로우, 의사결정, 품질 게이트 |
| 🎨 Frontend Dev      | docs/agents/frontend-dev.agent.md      | 컴포넌트 구현, 모바일 최적화      |
| 🔍 Code Reviewer     | docs/agents/code-reviewer.agent.md     | PR 리뷰, 코드 품질, 안티패턴      |
| 🔒 Security Reviewer | docs/agents/security-reviewer.agent.md | 보안, PIPA, 의료 규정             |
| 🧪 Unit Tester       | docs/agents/unit-tester.agent.md       | 테스트 전략, 커버리지, E2E        |
| ✍️ UX Writer         | docs/agents/ux-writer.agent.md         | 카피, 톤앤보이스, a11y 텍스트     |

### Quality Gate (릴리즈 전 필수)

- Code Review: All PRs approved, no TS strict errors
- Security: No Critical/High vulnerabilities, EXIF stripping verified, RLS audited
- Test Coverage: Utils ≥95%, API ≥90%, Components ≥80%, E2E critical paths 100%
- UX Copy: All microcopy approved, disclaimer present, a11y text complete
- Performance: Lighthouse Mobile ≥90, FCP <1.5s, CLS <0.1

## Key Domain Knowledge

### Norwood-Hamilton Scale (5-Grade Simplified)

| Grade | Label          | Color | Hex     | Action                       |
| ----- | -------------- | ----- | ------- | ---------------------------- |
| 1     | 정상           | 🟢    | #22C55E | 기록 지속                    |
| 2     | 경미           | 🟡    | #EAB308 | 정기 관찰                    |
| 3     | 주의           | 🟠    | #F97316 | 관리 시작 권유               |
| 4     | 관리 필요      | 🔴    | #EF4444 | 전문의 상담 권유 + 팝업      |
| 5     | 전문 상담 추천 | 🟣    | #A855F7 | 전문의 상담 강력 권유 + 팝업 |

### Scan Protocol

- 3장 세트 필수: 정수리(top), 전면이마(front), 측면이마(side)
- 최대 6장, 최소 해상도 1280×720
- EXIF 메타데이터 완전 제거 (GPS, 디바이스 정보)
- 스크린샷/캡처 이미지 차단

### Board Types

- medication_review: 약물 후기 (피나/미녹/두타)
- procedure_review: 시술 후기 (모발이식/메조/PRP)
- qna: Q&A (채택 시스템)
- lounge: 자유게시판

## Development Phases

- Phase 1 (MVP, W1-4): 촬영+업로드, AI 분석, 결과 카드, Auth, 히스토리
- Phase 2 (W5-8): 게시판, 타임라인 대시보드, 캘린더, 댓글
- Phase 3 (W9-12): 게이미피케이션, Q&A 채택, PDF 리포트, 스케일링

## Reference Docs

- docs/PRD.md — 프로덕트 기획서
- docs/shared/design.md — 디자인 시스템 (Vibe UI Kit 기반 토큰)
- docs/shared/glossary.md — 용어 정의
- docs/shared/conventions.md — 코딩/네이밍 컨벤션
