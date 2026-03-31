# Hair Diary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the board/community feature with a hair diary system — calendar-based daily recording with AI analysis, checklists, public sharing, and a freemium premium model.

**Architecture:** Remove all board routes/APIs/hooks/types. Add new `diary_entries` and `diary_checklists` tables with RLS. Create `/diary` (calendar), `/diary/new` (entry form), `/diary/public` (feed), `/diary/report` (premium analytics) pages. Reuse existing scan/analysis pipeline for photo + AI. Add `/privacy`, `/terms` static pages, `/api/contact` mail endpoint, and a lightweight global footer.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL + Auth + Storage), React Query, Zustand, TailwindCSS, shadcn/ui, Framer Motion, Gemini Vision API (existing), Resend (email)

---

## File Structure

### Files to Delete

```
src/app/board/                          # All board pages
src/app/api/board/                      # All board API routes
src/components/board/                   # ShareAnalysisModal, WritePostModal
src/hooks/useBoardPosts.ts              # Board posts hooks
src/hooks/usePostDetail.ts              # Post detail + comment hooks
src/hooks/useVote.ts                    # Vote hook
src/types/board.ts                      # Board types
```

### Files to Create

```
# DB Migration
supabase/migrations/20260331_hair_diary.sql

# Types
src/types/diary.ts

# API Routes
src/app/api/diary/entries/route.ts          # GET list, POST create
src/app/api/diary/entries/[id]/route.ts     # GET detail, PATCH update, DELETE
src/app/api/diary/report/route.ts           # GET premium report data
src/app/api/contact/route.ts                # POST mail

# Hooks
src/hooks/useDiary.ts                       # CRUD + calendar queries
src/hooks/useDiaryReport.ts                 # Premium report queries

# Pages
src/app/(main)/diary/page.tsx               # Calendar view
src/app/(main)/diary/layout.tsx             # Layout with metadata
src/app/(main)/diary/new/page.tsx           # New entry form
src/app/(main)/diary/[id]/page.tsx          # Entry detail
src/app/(main)/diary/public/page.tsx        # Public feed
src/app/(main)/diary/report/page.tsx        # Premium report

# Components
src/components/diary/DiaryCalendar.tsx       # Calendar grid
src/components/diary/DiaryEntryForm.tsx      # Checklist + memo + public toggle
src/components/diary/DiaryEntryCard.tsx      # Card for feed/detail
src/components/diary/DiaryReportCharts.tsx   # Score trend + checklist stats
src/components/diary/PremiumGate.tsx         # Subscription lock overlay

# Static Pages
src/app/privacy/page.tsx
src/app/terms/page.tsx
src/app/contact/page.tsx

# Layout
src/components/layout/LightFooter.tsx       # Logo + terms/privacy links
```

### Files to Modify

```
src/types/database.ts                       # Remove board types, add diary types
src/constants/copy.ts                       # Remove board strings, add diary strings
src/components/layout/FloatingMenu.tsx       # Board → Diary nav
src/components/layout/Footer.tsx             # Simplify to light footer
src/app/(main)/dashboard/page.tsx            # Board → Diary quick actions
src/app/layout.tsx                           # Add LightFooter
src/app/(auth)/login/page.tsx                # Add terms consent checkboxes
supabase/seed-dev.sql                        # Add diary tables to seed
```

---

### Task 1: DB Migration — Create diary tables, drop board tables

**Files:**
- Create: `supabase/migrations/20260331_hair_diary.sql`
- Modify: `supabase/seed-dev.sql` (reference only)

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/20260331_hair_diary.sql

-- ============================================
-- 1. Create diary_entries table
-- ============================================
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  scan_id UUID REFERENCES scans,
  date DATE NOT NULL,
  memo TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_photo_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT diary_entries_user_date_unique UNIQUE (user_id, date)
);

CREATE INDEX idx_diary_entries_user_id ON diary_entries (user_id);
CREATE INDEX idx_diary_entries_date ON diary_entries (user_id, date);
CREATE INDEX idx_diary_entries_public ON diary_entries (is_public) WHERE is_public = true;

-- ============================================
-- 2. Create diary_checklists table
-- ============================================
CREATE TABLE diary_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES diary_entries ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medication', 'treatment', 'lifestyle')),
  item TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_diary_checklists_entry ON diary_checklists (entry_id);

-- ============================================
-- 3. Add diary columns to profiles
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS diary_premium_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ;

-- ============================================
-- 4. RLS policies for diary_entries
-- ============================================
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diary_entries_select_own_or_public"
  ON diary_entries FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "diary_entries_insert_own"
  ON diary_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "diary_entries_update_own"
  ON diary_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "diary_entries_delete_own"
  ON diary_entries FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 5. RLS policies for diary_checklists
-- ============================================
ALTER TABLE diary_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diary_checklists_select_via_entry"
  ON diary_checklists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
      AND (diary_entries.user_id = auth.uid() OR diary_entries.is_public = true)
    )
  );

CREATE POLICY "diary_checklists_insert_via_entry"
  ON diary_checklists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "diary_checklists_update_via_entry"
  ON diary_checklists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
      AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "diary_checklists_delete_via_entry"
  ON diary_checklists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
      AND diary_entries.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. Update handle_new_user to set premium trial
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_seed, diary_premium_until)
  VALUES (
    NEW.id,
    '익명독수리_' || LEFT(NEW.id::text, 8),
    NEW.id::text,
    now() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Drop board tables
-- ============================================
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
```

- [ ] **Step 2: Apply migration locally**

Run: `npx supabase db push` or `npx supabase migration up`
Expected: Migration applies successfully, new tables visible in Supabase dashboard.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260331_hair_diary.sql
git commit -m "feat(db): add diary tables, drop board tables, add premium trial"
```

---

### Task 2: Types — Define diary TypeScript types, clean up board types

**Files:**
- Create: `src/types/diary.ts`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Create diary types**

```typescript
// src/types/diary.ts

export const CHECKLIST_CATEGORY = {
  MEDICATION: "medication",
  TREATMENT: "treatment",
  LIFESTYLE: "lifestyle",
} as const;

export type ChecklistCategory = typeof CHECKLIST_CATEGORY[keyof typeof CHECKLIST_CATEGORY];

export const CHECKLIST_ITEMS = {
  medication: [
    { key: "finasteride", label: "피나스테리드" },
    { key: "minoxidil", label: "미녹시딜" },
    { key: "dutasteride", label: "두타스테리드" },
    { key: "other_med", label: "기타 약물" },
  ],
  treatment: [
    { key: "mesotherapy", label: "메조테라피" },
    { key: "prp", label: "PRP" },
    { key: "transplant", label: "모발이식" },
    { key: "other_treatment", label: "기타 시술" },
  ],
  lifestyle: [
    { key: "sleep_7h", label: "수면 7시간+" },
    { key: "exercise", label: "운동" },
    { key: "stress_low", label: "스트레스 낮음" },
    { key: "stress_mid", label: "스트레스 보통" },
    { key: "stress_high", label: "스트레스 높음" },
  ],
} as const satisfies Record<ChecklistCategory, readonly { key: string; label: string }[]>;

export interface DiaryChecklist {
  id: string;
  entryId: string;
  category: ChecklistCategory;
  item: string;
  checked: boolean;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  scanId: string | null;
  date: string; // YYYY-MM-DD
  memo: string | null;
  isPublic: boolean;
  isPhotoPublic: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined data (optional, from queries)
  checklists?: DiaryChecklist[];
  scan?: {
    images: { type: string; url: string; thumbnailUrl: string }[];
    status: string;
  };
  analysis?: {
    norwoodGrade: number;
    score: number;
    details: Record<string, unknown>;
  };
  profile?: {
    nickname: string;
    avatarSeed: string | null;
  };
}

export interface DiaryCalendarDot {
  date: string; // YYYY-MM-DD
  norwoodGrade: number | null;
  hasEntry: boolean;
}

export interface DiaryReportData {
  scoreTrend: { date: string; score: number; grade: number }[];
  checklistStats: {
    category: ChecklistCategory;
    item: string;
    totalDays: number;
    checkedDays: number;
    rate: number;
  }[];
  summary: {
    totalEntries: number;
    avgScore: number;
    bestScore: number;
    currentStreak: number;
  };
}

/** DB row types (snake_case) */
export interface DbDiaryEntry {
  id: string;
  user_id: string;
  scan_id: string | null;
  date: string;
  memo: string | null;
  is_public: boolean;
  is_photo_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbDiaryChecklist {
  id: string;
  entry_id: string;
  category: string;
  item: string;
  checked: boolean;
}
```

- [ ] **Step 2: Remove board types from database.ts**

Remove from `src/types/database.ts`:
- `BoardType` type alias (line 6)
- `VoteTargetType` type alias (line 8) — change to just `"scan"` if votes table is dropped
- `VoteType` type alias (line 9)
- `Post` interface (lines 90-107)
- `Comment` interface (lines 109-117)
- `Vote` interface (lines 119-126)
- `DbPost` interface (lines 183-200)
- `DbComment` interface (lines 202-210)
- `DbVote` interface (lines 212-219)

Keep: `Profile`, `Scan`, `Analysis`, `Treatment`, `Achievement` and their Db variants.

Update `VoteTargetType` to:
```typescript
export type VoteTargetType = "scan";
```

- [ ] **Step 3: Commit**

```bash
git add src/types/diary.ts src/types/database.ts
git commit -m "feat(types): add diary types, remove board types"
```

---

### Task 3: Constants — Update COPY with diary strings, remove board strings

**Files:**
- Modify: `src/constants/copy.ts`

- [ ] **Step 1: Replace board strings with diary strings**

Remove these keys from `COPY` in `src/constants/copy.ts`:
```
EMPTY_POSTS, BOARD_NOTICE_BADGE, BOARD_ADMIN_BADGE, BOARD_PREVIEW_TITLE,
BOARD_PREVIEW_LOGIN_CTA, BOARD_PREVIEW_LOGIN_DESC, SHARE_ANALYSIS_TITLE,
SHARE_ANALYSIS_INCLUDE_IMAGES, SHARE_ANALYSIS_IMAGE_WARNING, SHARE_ANALYSIS_CTA,
SHARE_BOARD_CTA, POST_CREATED, COMMENT_NOTIFICATION, ADOPTION_NOTIFICATION,
FEATHER_UNIT, FEATHER_POST_REWARD, FEATHER_COMMENT_REWARD, FEATHER_BEST_REWARD,
FEATHER_LIKE_ACTION, FEATHER_REPORT_ACTION, BOARD_SLANG_RICH_ALERT,
BOARD_SLANG_KING_ADVICE, BOARD_SLANG_SAVE_OP, BOARD_NAME, NAV_BOARD,
PAGE_TITLE_BOARD
```

Add these new keys:
```typescript
// ── Diary ──
NAV_DIARY: "헤어 다이어리",
PAGE_TITLE_DIARY: "헤어 다이어리",
DIARY_EMPTY: "아직 기록이 없어요. 오늘 첫 번째 다이어리를 작성해보세요!",
DIARY_ENTRY_SAVED: "오늘의 다이어리가 저장됐어요.",
DIARY_ENTRY_UPDATED: "다이어리가 수정됐어요.",
DIARY_ENTRY_DELETED: "다이어리가 삭제됐어요.",
DIARY_ALREADY_EXISTS: "오늘은 이미 기록했어요.",
DIARY_EDIT_CTA: "수정하기",
DIARY_ADD_CTA: "오늘 기록하기",
DIARY_STREAK: (days: number): string => `연속 ${days}일 기록 중!`,
DIARY_MEMO_PLACEHOLDER: "오늘 두피 상태나 느낌을 자유롭게 적어보세요...",
DIARY_PUBLIC_LABEL: "모두에게 공개",
DIARY_PHOTO_PUBLIC_LABEL: "사진도 공개",
DIARY_CHECKLIST_MEDICATION: "약물",
DIARY_CHECKLIST_TREATMENT: "시술",
DIARY_CHECKLIST_LIFESTYLE: "생활습관",

// ── Diary Public Feed ──
DIARY_PUBLIC_TITLE: "공개 다이어리",
DIARY_PUBLIC_EMPTY: "아직 공개된 다이어리가 없어요.",
DIARY_PHOTO_BLURRED: "사진 비공개",

// ── Diary Report (Premium) ──
DIARY_REPORT_TITLE: "분석 리포트",
DIARY_REPORT_SCORE_TREND: "점수 추이",
DIARY_REPORT_BEFORE_AFTER: "Before / After 비교",
DIARY_REPORT_CHECKLIST_STATS: "체크리스트 통계",
DIARY_REPORT_LOCKED_TITLE: "프리미엄 기능이에요",
DIARY_REPORT_LOCKED_DESC: "무료 체험 기간이 끝났어요. 구독하면 리포트, 비교, 통계를 확인할 수 있어요.",
DIARY_REPORT_SUBSCRIBE_CTA: "구독하기",
DIARY_REPORT_TRIAL_REMAINING: (days: number): string =>
  `무료 체험 ${days}일 남음`,

// ── Contact ──
CONTACT_TITLE: "문의하기",
CONTACT_SUBJECT_PLACEHOLDER: "제목을 입력해주세요",
CONTACT_BODY_PLACEHOLDER: "궁금한 점이나 건의사항을 적어주세요",
CONTACT_EMAIL_LABEL: "답변받을 이메일",
CONTACT_SUBMIT: "문의 보내기",
CONTACT_SUCCESS: "문의가 접수됐어요. 빠르게 답변드릴게요!",

// ── Terms ──
TERMS_AGREE: "이용약관 동의 (필수)",
PRIVACY_AGREE: "개인정보처리방침 동의 (필수)",

// ── Features (update) ──
FEATURE_COMMUNITY_TITLE: "헤어 다이어리",
FEATURE_COMMUNITY_DESC:
  "매일 두피 상태를 기록하고, AI 분석과 함께 변화를 추적하세요. 공개하면 다른 분들과 경험을 나눌 수 있어요.",
```

Also update `NAV_BOARD` references to `NAV_DIARY` and `PAGE_TITLE_BOARD` to `PAGE_TITLE_DIARY`.

- [ ] **Step 2: Commit**

```bash
git add src/constants/copy.ts
git commit -m "feat(copy): add diary strings, remove board strings"
```

---

### Task 4: Delete board files

**Files:**
- Delete: All files listed in "Files to Delete" section

- [ ] **Step 1: Delete board directories and files**

```bash
rm -rf src/app/board/
rm -rf src/app/api/board/
rm -rf src/components/board/
rm src/hooks/useBoardPosts.ts
rm src/hooks/usePostDetail.ts
rm src/hooks/useVote.ts
rm src/types/board.ts
```

- [ ] **Step 2: Search for remaining board imports**

Run: `grep -r "useBoardPosts\|usePostDetail\|useVote\|/board\|BoardType\|BOARD_NAME\|board\.ts" src/ --include="*.ts" --include="*.tsx" -l`

Fix any remaining imports that reference deleted files.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove all board files (pages, API, hooks, types, components)"
```

---

### Task 5: Diary API — CRUD endpoints

**Files:**
- Create: `src/app/api/diary/entries/route.ts`
- Create: `src/app/api/diary/entries/[id]/route.ts`

- [ ] **Step 1: Create diary entries list + create API**

```typescript
// src/app/api/diary/entries/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbDiaryEntry } from "@/types/diary";

const PAGE_SIZE = 31; // Max days in a month

/** GET /api/diary/entries — list entries (own or public) */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  const publicFeed = searchParams.get("public") === "true";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  if (publicFeed) {
    // Public feed — paginated, newest first
    const from = (page - 1) * 20;
    const to = from + 19;

    const { data, error, count } = await supabase
      .from("diary_entries")
      .select(`
        *,
        scans(images, status),
        profiles!diary_entries_user_id_fkey(nickname, avatar_seed),
        diary_checklists(*)
      `, { count: "exact" })
      .eq("is_public", true)
      .order("date", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: "불러올 수 없어요." }, { status: 500 });
    }

    return NextResponse.json({
      entries: data ?? [],
      pagination: { page, pageSize: 20, total: count ?? 0 },
    });
  }

  // Own entries — filtered by month
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  let query = supabase
    .from("diary_entries")
    .select(`
      *,
      scans(images, status),
      diary_checklists(*)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (month) {
    const startDate = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const endDate = new Date(y, m, 0).toISOString().slice(0, 10); // last day
    query = query.gte("date", startDate).lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "불러올 수 없어요." }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

/** POST /api/diary/entries — create new entry */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await request.json();
  const {
    scanId,
    date,
    memo,
    isPublic = false,
    isPhotoPublic = false,
    checklists = [],
  } = body as {
    scanId?: string;
    date: string;
    memo?: string;
    isPublic?: boolean;
    isPhotoPublic?: boolean;
    checklists?: { category: string; item: string; checked: boolean }[];
  };

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "날짜 형식이 올바르지 않아요." }, { status: 400 });
  }

  // Check duplicate for the day
  const { data: existing } = await supabase
    .from("diary_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "오늘은 이미 기록했어요.", existingId: existing.id },
      { status: 409 },
    );
  }

  // Insert entry
  const { data: entry, error: entryError } = await supabase
    .from("diary_entries")
    .insert({
      user_id: user.id,
      scan_id: scanId ?? null,
      date,
      memo: memo ?? null,
      is_public: isPublic,
      is_photo_public: isPhotoPublic,
    })
    .select()
    .single();

  if (entryError) {
    console.error("[POST /api/diary/entries]", entryError);
    return NextResponse.json({ error: "저장에 실패했어요." }, { status: 500 });
  }

  // Insert checklists
  if (checklists.length > 0) {
    const rows = checklists.map((c) => ({
      entry_id: entry.id,
      category: c.category,
      item: c.item,
      checked: c.checked,
    }));

    const { error: clError } = await supabase
      .from("diary_checklists")
      .insert(rows);

    if (clError) {
      console.error("[POST /api/diary/entries] checklists:", clError);
    }
  }

  return NextResponse.json({ entry }, { status: 201 });
}
```

- [ ] **Step 2: Create diary entry detail/update/delete API**

```typescript
// src/app/api/diary/entries/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/diary/entries/:id */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("diary_entries")
    .select(`
      *,
      scans(images, status),
      profiles!diary_entries_user_id_fkey(nickname, avatar_seed),
      diary_checklists(*)
    `)
    .eq("id", id)
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: "기록을 찾을 수 없어요." }, { status: 404 });
  }

  // Join analysis if scan exists
  let analysis = null;
  if (entry.scan_id) {
    const { data } = await supabase
      .from("analyses")
      .select("norwood_grade, score, details")
      .eq("scan_id", entry.scan_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    analysis = data;
  }

  return NextResponse.json({ entry, analysis });
}

/** PATCH /api/diary/entries/:id */
export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await request.json();
  const { memo, isPublic, isPhotoPublic, checklists } = body as {
    memo?: string;
    isPublic?: boolean;
    isPhotoPublic?: boolean;
    checklists?: { category: string; item: string; checked: boolean }[];
  };

  // Build update object — only include provided fields
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (memo !== undefined) updates.memo = memo;
  if (isPublic !== undefined) updates.is_public = isPublic;
  if (isPhotoPublic !== undefined) updates.is_photo_public = isPhotoPublic;

  const { data: entry, error } = await supabase
    .from("diary_entries")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: "수정에 실패했어요." }, { status: 500 });
  }

  // Replace checklists if provided
  if (checklists) {
    await supabase.from("diary_checklists").delete().eq("entry_id", id);
    if (checklists.length > 0) {
      await supabase.from("diary_checklists").insert(
        checklists.map((c) => ({
          entry_id: id,
          category: c.category,
          item: c.item,
          checked: c.checked,
        })),
      );
    }
  }

  return NextResponse.json({ entry });
}

/** DELETE /api/diary/entries/:id */
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "삭제에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/diary/
git commit -m "feat(api): add diary entries CRUD endpoints"
```

---

### Task 6: Diary hooks — React Query CRUD + calendar

**Files:**
- Create: `src/hooks/useDiary.ts`

- [ ] **Step 1: Create diary hooks**

```typescript
// src/hooks/useDiary.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DiaryEntry, DiaryCalendarDot } from "@/types/diary";

interface DiaryEntriesResponse {
  entries: DiaryEntry[];
}

interface DiaryPublicResponse {
  entries: DiaryEntry[];
  pagination: { page: number; pageSize: number; total: number };
}

const STALE_TIME = 1000 * 60 * 5;

/** Fetch own diary entries for a month */
export function useDiaryEntries(month: string) {
  return useQuery<DiaryEntriesResponse>({
    queryKey: ["diary", "entries", month],
    queryFn: async (): Promise<DiaryEntriesResponse> => {
      const res = await fetch(`/api/diary/entries?month=${month}`);
      if (!res.ok) throw new Error("다이어리를 불러올 수 없어요.");
      return res.json();
    },
    staleTime: STALE_TIME,
  });
}

/** Derive calendar dots from entries */
export function useDiaryCalendar(month: string): DiaryCalendarDot[] {
  const { data } = useDiaryEntries(month);
  if (!data?.entries) return [];

  return data.entries.map((entry) => ({
    date: entry.date,
    norwoodGrade: entry.analysis?.norwoodGrade ?? null,
    hasEntry: true,
  }));
}

/** Fetch single diary entry */
export function useDiaryEntry(id: string) {
  return useQuery({
    queryKey: ["diary", "entry", id],
    queryFn: async () => {
      const res = await fetch(`/api/diary/entries/${id}`);
      if (!res.ok) throw new Error("기록을 불러올 수 없어요.");
      return res.json() as Promise<{ entry: DiaryEntry; analysis: Record<string, unknown> | null }>;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

/** Fetch public diary feed */
export function usePublicDiary(page = 1) {
  return useQuery<DiaryPublicResponse>({
    queryKey: ["diary", "public", page],
    queryFn: async (): Promise<DiaryPublicResponse> => {
      const res = await fetch(`/api/diary/entries?public=true&page=${page}`);
      if (!res.ok) throw new Error("공개 다이어리를 불러올 수 없어요.");
      return res.json();
    },
    staleTime: STALE_TIME,
    placeholderData: (prev) => prev,
  });
}

/** Create diary entry */
export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      scanId?: string;
      date: string;
      memo?: string;
      isPublic?: boolean;
      isPhotoPublic?: boolean;
      checklists?: { category: string; item: string; checked: boolean }[];
    }) => {
      const res = await fetch("/api/diary/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "저장에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
    },
  });
}

/** Update diary entry */
export function useUpdateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      memo?: string;
      isPublic?: boolean;
      isPhotoPublic?: boolean;
      checklists?: { category: string; item: string; checked: boolean }[];
    }) => {
      const res = await fetch(`/api/diary/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "수정에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
    },
  });
}

/** Delete diary entry */
export function useDeleteDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/diary/entries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "삭제에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useDiary.ts
git commit -m "feat(hooks): add diary React Query hooks"
```

---

### Task 7: Diary entry form component — checklist + memo + public toggles

**Files:**
- Create: `src/components/diary/DiaryEntryForm.tsx`

- [ ] **Step 1: Create the entry form component**

```typescript
// src/components/diary/DiaryEntryForm.tsx
"use client";

import { useState, useCallback, type ReactElement } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { COPY } from "@/constants/copy";
import { CHECKLIST_ITEMS, type ChecklistCategory } from "@/types/diary";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

interface ChecklistState {
  category: ChecklistCategory;
  item: string;
  checked: boolean;
}

interface DiaryFormData {
  memo: string;
  isPublic: boolean;
  isPhotoPublic: boolean;
  checklists: ChecklistState[];
}

interface Props {
  initialData?: Partial<DiaryFormData>;
  onSubmit: (data: DiaryFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

function buildInitialChecklists(initial?: ChecklistState[]): ChecklistState[] {
  if (initial?.length) return initial;

  const items: ChecklistState[] = [];
  for (const [category, categoryItems] of Object.entries(CHECKLIST_ITEMS)) {
    for (const { key } of categoryItems) {
      items.push({ category: category as ChecklistCategory, item: key, checked: false });
    }
  }
  return items;
}

export default function DiaryEntryForm({ initialData, onSubmit, isSubmitting, submitLabel }: Props): ReactElement {
  const [memo, setMemo] = useState(initialData?.memo ?? "");
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [isPhotoPublic, setIsPhotoPublic] = useState(initialData?.isPhotoPublic ?? false);
  const [checklists, setChecklists] = useState<ChecklistState[]>(
    buildInitialChecklists(initialData?.checklists),
  );

  const toggleChecklist = useCallback((category: ChecklistCategory, item: string) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.category === category && c.item === item ? { ...c, checked: !c.checked } : c,
      ),
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    await onSubmit({
      memo,
      isPublic,
      isPhotoPublic: isPublic ? isPhotoPublic : false,
      checklists: checklists.filter((c) => c.checked),
    });
  }, [memo, isPublic, isPhotoPublic, checklists, onSubmit]);

  const categoryLabels: Record<ChecklistCategory, string> = {
    medication: COPY.DIARY_CHECKLIST_MEDICATION,
    treatment: COPY.DIARY_CHECKLIST_TREATMENT,
    lifestyle: COPY.DIARY_CHECKLIST_LIFESTYLE,
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Checklists */}
      {(Object.entries(CHECKLIST_ITEMS) as [ChecklistCategory, typeof CHECKLIST_ITEMS[ChecklistCategory]][]).map(
        ([category, items]) => (
          <motion.div key={category} variants={fadeSlideUp} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {categoryLabels[category]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map(({ key, label }) => {
                const isChecked = checklists.find(
                  (c) => c.category === category && c.item === key,
                )?.checked ?? false;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChecklist(category, key)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                      isChecked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ),
      )}

      {/* Memo */}
      <motion.div variants={fadeSlideUp} className="space-y-2">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={COPY.DIARY_MEMO_PLACEHOLDER}
          rows={4}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </motion.div>

      {/* Public toggles */}
      <motion.div variants={fadeSlideUp} className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => {
              setIsPublic(e.target.checked);
              if (!e.target.checked) setIsPhotoPublic(false);
            }}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm">{COPY.DIARY_PUBLIC_LABEL}</span>
        </label>

        {isPublic && (
          <label className="flex items-center gap-3 cursor-pointer ml-7">
            <input
              type="checkbox"
              checked={isPhotoPublic}
              onChange={(e) => setIsPhotoPublic(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm">{COPY.DIARY_PHOTO_PUBLIC_LABEL}</span>
          </label>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeSlideUp}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </button>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/diary/DiaryEntryForm.tsx
git commit -m "feat(ui): add DiaryEntryForm component with checklists and toggles"
```

---

### Task 8: Diary calendar component

**Files:**
- Create: `src/components/diary/DiaryCalendar.tsx`

- [ ] **Step 1: Create calendar grid component**

```typescript
// src/components/diary/DiaryCalendar.tsx
"use client";

import { useMemo, type ReactElement } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { DiaryCalendarDot } from "@/types/diary";
import { fadeSlideUp } from "@/lib/motion";

const GRADE_COLORS: Record<number, string> = {
  1: "bg-green-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-purple-500",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  year: number;
  month: number; // 1-12
  dots: DiaryCalendarDot[];
  onDateClick: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  todayEntry: string | null; // entry id if exists
}

export default function DiaryCalendar({
  year,
  month,
  dots,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  todayEntry,
}: Props): ReactElement {
  const today = new Date().toISOString().slice(0, 10);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const dotMap = new Map(dots.map((d) => [d.date, d]));
    const days: { date: string; day: number; dot: DiaryCalendarDot | null; isToday: boolean }[] = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: "", day: 0, dot: null, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day: d,
        dot: dotMap.get(dateStr) ?? null,
        isToday: dateStr === today,
      });
    }

    return days;
  }, [year, month, dots, today]);

  return (
    <motion.div variants={fadeSlideUp} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onPrevMonth} className="p-2 rounded-lg hover:bg-muted" aria-label="이전 달">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold">
          {year}년 {month}월
        </h2>
        <button onClick={onNextMonth} className="p-2 rounded-lg hover:bg-muted" aria-label="다음 달">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, i) => {
          if (!cell.date) {
            return <div key={`blank-${i}`} className="aspect-square" />;
          }

          const showPlus = cell.isToday && !todayEntry && !cell.dot;

          return (
            <button
              key={cell.date}
              onClick={() => onDateClick(cell.date)}
              className={`relative flex flex-col items-center justify-center aspect-square rounded-lg text-sm transition-colors hover:bg-muted ${
                cell.isToday ? "ring-2 ring-primary ring-offset-1" : ""
              }`}
            >
              <span className={cell.isToday ? "font-bold" : ""}>{cell.day}</span>
              {cell.dot && (
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    cell.dot.norwoodGrade ? GRADE_COLORS[cell.dot.norwoodGrade] : "bg-muted-foreground"
                  }`}
                />
              )}
              {showPlus && (
                <Plus className="absolute bottom-0.5 h-3 w-3 text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/diary/DiaryCalendar.tsx
git commit -m "feat(ui): add DiaryCalendar component with grade color dots"
```

---

### Task 9: Diary entry card component

**Files:**
- Create: `src/components/diary/DiaryEntryCard.tsx`

- [ ] **Step 1: Create entry card component**

```typescript
// src/components/diary/DiaryEntryCard.tsx
"use client";

import { type ReactElement } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { COPY } from "@/constants/copy";
import type { DiaryEntry } from "@/types/diary";
import { CHECKLIST_ITEMS, type ChecklistCategory } from "@/types/diary";

const GRADE_COLORS: Record<number, string> = {
  1: "bg-green-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-purple-500",
};

const GRADE_LABELS: Record<number, string> = {
  1: "정상",
  2: "경미",
  3: "주의",
  4: "관리 필요",
  5: "전문 상담 추천",
};

interface Props {
  entry: DiaryEntry;
  isOwner: boolean;
  showAuthor?: boolean; // For public feed
  onClick?: () => void;
}

function getChecklistLabel(category: string, item: string): string {
  const cat = CHECKLIST_ITEMS[category as ChecklistCategory];
  if (!cat) return item;
  return cat.find((c) => c.key === item)?.label ?? item;
}

export default function DiaryEntryCard({ entry, isOwner, showAuthor, onClick }: Props): ReactElement {
  const grade = entry.analysis?.norwoodGrade;
  const showPhoto = isOwner || entry.isPhotoPublic;
  const firstImage = entry.scan?.images?.[0];

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50"
    >
      <div className="flex gap-3">
        {/* Photo thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {firstImage ? (
            showPhoto ? (
              <Image
                src={firstImage.thumbnailUrl}
                alt="두피 사진"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{entry.date}</span>
            {showAuthor && entry.profile && (
              <span className="text-xs text-muted-foreground">· {entry.profile.nickname}</span>
            )}
            {grade && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${GRADE_COLORS[grade]}`}>
                {GRADE_LABELS[grade]}
              </span>
            )}
          </div>

          {/* Checked items */}
          {entry.checklists && entry.checklists.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {entry.checklists
                .filter((c) => c.checked)
                .slice(0, 4)
                .map((c) => (
                  <span key={c.id} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {getChecklistLabel(c.category, c.item)}
                  </span>
                ))}
            </div>
          )}

          {/* Memo preview */}
          {entry.memo && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{entry.memo}</p>
          )}
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/diary/DiaryEntryCard.tsx
git commit -m "feat(ui): add DiaryEntryCard component"
```

---

### Task 10: Premium gate component

**Files:**
- Create: `src/components/diary/PremiumGate.tsx`

- [ ] **Step 1: Create premium lock overlay**

```typescript
// src/components/diary/PremiumGate.tsx
"use client";

import { type ReactElement, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { COPY } from "@/constants/copy";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  children: ReactNode;
}

export default function PremiumGate({ children }: Props): ReactElement {
  const { data: profile } = useProfile();

  const premiumUntil = profile?.diaryPremiumUntil;
  const isPremium = premiumUntil ? new Date(premiumUntil) > new Date() : false;
  const daysRemaining = premiumUntil
    ? Math.max(0, Math.ceil((new Date(premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isPremium) {
    return (
      <>
        {daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="mb-4 rounded-xl bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-600">
            {COPY.DIARY_REPORT_TRIAL_REMAINING(daysRemaining)}
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/80 backdrop-blur-sm">
        <div className="rounded-full bg-muted p-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold">{COPY.DIARY_REPORT_LOCKED_TITLE}</h3>
        <p className="max-w-xs text-center text-xs text-muted-foreground">
          {COPY.DIARY_REPORT_LOCKED_DESC}
        </p>
        <button
          disabled
          className="rounded-xl bg-primary/50 px-6 py-2 text-sm font-semibold text-primary-foreground cursor-not-allowed"
        >
          {COPY.DIARY_REPORT_SUBSCRIBE_CTA}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/diary/PremiumGate.tsx
git commit -m "feat(ui): add PremiumGate component for subscription lock"
```

---

### Task 11: Diary pages — Calendar view, New entry, Detail, Public feed

**Files:**
- Create: `src/app/(main)/diary/layout.tsx`
- Create: `src/app/(main)/diary/page.tsx`
- Create: `src/app/(main)/diary/new/page.tsx`
- Create: `src/app/(main)/diary/[id]/page.tsx`
- Create: `src/app/(main)/diary/public/page.tsx`

- [ ] **Step 1: Create diary layout**

```typescript
// src/app/(main)/diary/layout.tsx
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";

export const metadata: Metadata = {
  title: "헤어 다이어리 | Alopedia",
  description: "매일 두피 상태를 기록하고 AI 분석으로 변화를 추적하세요.",
  openGraph: {
    title: "헤어 다이어리 | Alopedia",
    description: "매일 두피 상태를 기록하고 AI 분석으로 변화를 추적하세요.",
    url: `${SITE_URL}/diary`,
  },
};

export default function DiaryLayout({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>;
}
```

- [ ] **Step 2: Create calendar view page**

```typescript
// src/app/(main)/diary/page.tsx
"use client";

import { useState, useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import DiaryCalendar from "@/components/diary/DiaryCalendar";
import DiaryEntryCard from "@/components/diary/DiaryEntryCard";
import { useDiaryEntries, useDiaryCalendar } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import { COPY } from "@/constants/copy";
import { staggerContainer, fadeSlideUp } from "@/lib/motion";

export default function DiaryPage(): ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const { data, isLoading } = useDiaryEntries(monthStr);
  const dots = useDiaryCalendar(monthStr);

  const today = now.toISOString().slice(0, 10);
  const todayEntry = data?.entries.find((e) => e.date === today);

  const handlePrevMonth = useCallback(() => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const handleDateClick = useCallback((date: string) => {
    const entry = data?.entries.find((e) => e.date === date);
    if (entry) {
      router.push(`/diary/${entry.id}`);
    } else if (date === today) {
      router.push("/diary/new");
    }
  }, [data, today, router]);

  // Calculate streak
  const streak = data?.entries
    ? calculateStreak(data.entries.map((e) => e.date))
    : 0;

  if (!user) {
    router.push("/login");
    return <></>;
  }

  return (
    <PageContainer>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{COPY.PAGE_TITLE_DIARY}</h1>
            {streak > 0 && (
              <p className="text-sm text-primary font-medium">{COPY.DIARY_STREAK(streak)}</p>
            )}
          </div>
          {!todayEntry && (
            <button
              onClick={() => router.push("/diary/new")}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              {COPY.DIARY_ADD_CTA}
            </button>
          )}
        </motion.div>

        {/* Calendar */}
        <DiaryCalendar
          year={year}
          month={month}
          dots={dots}
          onDateClick={handleDateClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          todayEntry={todayEntry?.id ?? null}
        />

        {/* Recent entries list */}
        <motion.div variants={fadeSlideUp} className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
          {data?.entries.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">{COPY.DIARY_EMPTY}</p>
          )}
          {data?.entries.map((entry) => (
            <DiaryEntryCard
              key={entry.id}
              entry={entry}
              isOwner
              onClick={() => router.push(`/diary/${entry.id}`)}
            />
          ))}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

/** Calculate consecutive days streak ending at today */
function calculateStreak(dates: string[]): number {
  const sorted = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let expected = today;

  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const prev = new Date(expected);
      prev.setDate(prev.getDate() - 1);
      expected = prev.toISOString().slice(0, 10);
    } else if (date < expected) {
      break;
    }
  }

  return streak;
}
```

- [ ] **Step 3: Create new entry page**

```typescript
// src/app/(main)/diary/new/page.tsx
"use client";

import { useState, useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageContainer from "@/components/layout/PageContainer";
import DiaryEntryForm from "@/components/diary/DiaryEntryForm";
import { useCreateDiaryEntry } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import { COPY } from "@/constants/copy";

export default function NewDiaryEntryPage(): ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const createEntry = useCreateDiaryEntry();
  const [scanId, setScanId] = useState<string | null>(null);

  // TODO: In a future task, integrate ScanSession here for photo capture + AI analysis.
  // For now, diary entries can be created without a scan (memo + checklist only).
  // The scan integration will be wired in Task 14.

  const handleSubmit = useCallback(
    async (data: Parameters<typeof createEntry.mutateAsync>[0] extends infer T ? Omit<T, "date" | "scanId"> : never) => {
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      try {
        await createEntry.mutateAsync({
          ...data,
          date: today,
          scanId: scanId ?? undefined,
        });
        toast.success(COPY.DIARY_ENTRY_SAVED);
        router.push("/diary");
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
    [user, scanId, createEntry, router],
  );

  if (!user) {
    router.push("/login");
    return <></>;
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-xl font-bold">{COPY.DIARY_ADD_CTA}</h1>

        {/* Scan section placeholder — will be replaced in Task 14 */}
        <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            사진 촬영 + AI 분석 (스캔 연동 예정)
          </p>
        </div>

        <DiaryEntryForm
          onSubmit={handleSubmit}
          isSubmitting={createEntry.isPending}
          submitLabel="다이어리 저장"
        />
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 4: Create entry detail page**

```typescript
// src/app/(main)/diary/[id]/page.tsx
"use client";

import { useCallback, type ReactElement } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import PageContainer from "@/components/layout/PageContainer";
import { useDiaryEntry, useDeleteDiaryEntry } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import { COPY } from "@/constants/copy";
import { CHECKLIST_ITEMS, type ChecklistCategory } from "@/types/diary";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const GRADE_COLORS: Record<number, string> = {
  1: "text-green-500",
  2: "text-yellow-500",
  3: "text-orange-500",
  4: "text-red-500",
  5: "text-purple-500",
};

function getChecklistLabel(category: string, item: string): string {
  const cat = CHECKLIST_ITEMS[category as ChecklistCategory];
  if (!cat) return item;
  return cat.find((c) => c.key === item)?.label ?? item;
}

export default function DiaryEntryDetailPage(): ReactElement {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading } = useDiaryEntry(params.id);
  const deleteEntry = useDeleteDiaryEntry();

  const entry = data?.entry;
  const analysis = data?.analysis;
  const isOwner = user?.id === entry?.userId;

  const handleDelete = useCallback(async () => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    try {
      await deleteEntry.mutateAsync(params.id);
      toast.success(COPY.DIARY_ENTRY_DELETED);
      router.push("/diary");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [params.id, deleteEntry, router]);

  if (isLoading) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </PageContainer>
    );
  }

  if (!entry) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">기록을 찾을 수 없어요.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            뒤로
          </button>
          {isOwner && (
            <div className="flex gap-2">
              <button onClick={() => router.push(`/diary/${params.id}/edit`)} className="p-2 rounded-lg hover:bg-muted">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Date + Grade */}
        <motion.div variants={fadeSlideUp}>
          <h1 className="text-lg font-bold">{entry.date}</h1>
          {analysis && (
            <p className={`text-sm font-semibold ${GRADE_COLORS[analysis.norwoodGrade as number] ?? ""}`}>
              {COPY.GRADE_HEADLINE[analysis.norwoodGrade as number]} · {String(analysis.score)}점
            </p>
          )}
        </motion.div>

        {/* Photos */}
        {entry.scan?.images && entry.scan.images.length > 0 && (
          <motion.div variants={fadeSlideUp} className="grid grid-cols-3 gap-2">
            {entry.scan.images.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={img.url} alt={`두피 사진 ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </motion.div>
        )}

        {/* Checklists */}
        {entry.checklists && entry.checklists.length > 0 && (
          <motion.div variants={fadeSlideUp} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">체크리스트</h3>
            <div className="flex flex-wrap gap-1.5">
              {entry.checklists
                .filter((c) => c.checked)
                .map((c) => (
                  <span key={c.id} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {getChecklistLabel(c.category, c.item)}
                  </span>
                ))}
            </div>
          </motion.div>
        )}

        {/* Memo */}
        {entry.memo && (
          <motion.div variants={fadeSlideUp} className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm whitespace-pre-wrap">{entry.memo}</p>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
```

- [ ] **Step 5: Create public diary feed page**

```typescript
// src/app/(main)/diary/public/page.tsx
"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import DiaryEntryCard from "@/components/diary/DiaryEntryCard";
import { usePublicDiary } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import { COPY } from "@/constants/copy";
import { staggerContainer, fadeSlideUp } from "@/lib/motion";

export default function PublicDiaryPage(): ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePublicDiary(page);

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.pageSize) : 0;

  return (
    <PageContainer>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeSlideUp}>
          <h1 className="text-xl font-bold">{COPY.DIARY_PUBLIC_TITLE}</h1>
        </motion.div>

        {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

        {data?.entries.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">{COPY.DIARY_PUBLIC_EMPTY}</p>
        )}

        <div className="space-y-2">
          {data?.entries.map((entry) => (
            <DiaryEntryCard
              key={entry.id}
              entry={entry}
              isOwner={user?.id === entry.userId}
              showAuthor
              onClick={() => router.push(`/diary/${entry.id}`)}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={fadeSlideUp} className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              이전
            </button>
            <span className="px-3 py-1.5 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              다음
            </button>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/\(main\)/diary/
git commit -m "feat(pages): add diary calendar, new entry, detail, and public feed pages"
```

---

### Task 12: Report page + API — premium analytics

**Files:**
- Create: `src/app/api/diary/report/route.ts`
- Create: `src/hooks/useDiaryReport.ts`
- Create: `src/app/(main)/diary/report/page.tsx`

- [ ] **Step 1: Create report API**

```typescript
// src/app/api/diary/report/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/diary/report — premium report data */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Check premium access
  const { data: profile } = await supabase
    .from("profiles")
    .select("diary_premium_until")
    .eq("id", user.id)
    .single();

  const premiumUntil = profile?.diary_premium_until;
  const isPremium = premiumUntil ? new Date(premiumUntil) > new Date() : false;

  if (!isPremium) {
    return NextResponse.json({ error: "프리미엄 구독이 필요해요." }, { status: 403 });
  }

  // Fetch all entries with analyses
  const { data: entries } = await supabase
    .from("diary_entries")
    .select("date, scan_id, diary_checklists(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (!entries || entries.length === 0) {
    return NextResponse.json({
      scoreTrend: [],
      checklistStats: [],
      summary: { totalEntries: 0, avgScore: 0, bestScore: 0, currentStreak: 0 },
    });
  }

  // Fetch analyses for entries that have scans
  const scanIds = entries.filter((e) => e.scan_id).map((e) => e.scan_id as string);
  const { data: analyses } = scanIds.length > 0
    ? await supabase
        .from("analyses")
        .select("scan_id, norwood_grade, score")
        .in("scan_id", scanIds)
    : { data: [] };

  const analysisMap = new Map((analyses ?? []).map((a) => [a.scan_id, a]));

  // Score trend
  const scoreTrend = entries
    .filter((e) => e.scan_id && analysisMap.has(e.scan_id))
    .map((e) => {
      const a = analysisMap.get(e.scan_id!)!;
      return { date: e.date, score: a.score, grade: a.norwood_grade };
    });

  // Checklist stats
  const checklistCounts = new Map<string, { total: number; checked: number }>();
  for (const entry of entries) {
    const checklists = (entry as Record<string, unknown>).diary_checklists as
      { category: string; item: string; checked: boolean }[] | undefined;
    if (!checklists) continue;
    for (const cl of checklists) {
      const key = `${cl.category}:${cl.item}`;
      const existing = checklistCounts.get(key) ?? { total: 0, checked: 0 };
      existing.total++;
      if (cl.checked) existing.checked++;
      checklistCounts.set(key, existing);
    }
  }

  const checklistStats = Array.from(checklistCounts.entries()).map(([key, val]) => {
    const [category, item] = key.split(":");
    return {
      category,
      item,
      totalDays: val.total,
      checkedDays: val.checked,
      rate: val.total > 0 ? Math.round((val.checked / val.total) * 100) : 0,
    };
  });

  // Summary
  const scores = scoreTrend.map((s) => s.score);
  const summary = {
    totalEntries: entries.length,
    avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    currentStreak: calculateStreak(entries.map((e) => e.date)),
  };

  return NextResponse.json({ scoreTrend, checklistStats, summary });
}

function calculateStreak(dates: string[]): number {
  const sorted = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let expected = today;

  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const prev = new Date(expected);
      prev.setDate(prev.getDate() - 1);
      expected = prev.toISOString().slice(0, 10);
    } else if (date < expected) {
      break;
    }
  }

  return streak;
}
```

- [ ] **Step 2: Create report hook**

```typescript
// src/hooks/useDiaryReport.ts
import { useQuery } from "@tanstack/react-query";
import type { DiaryReportData } from "@/types/diary";

export function useDiaryReport() {
  return useQuery<DiaryReportData>({
    queryKey: ["diary", "report"],
    queryFn: async (): Promise<DiaryReportData> => {
      const res = await fetch("/api/diary/report");
      if (res.status === 403) {
        throw new Error("PREMIUM_REQUIRED");
      }
      if (!res.ok) throw new Error("리포트를 불러올 수 없어요.");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
```

- [ ] **Step 3: Create report page**

```typescript
// src/app/(main)/diary/report/page.tsx
"use client";

import { type ReactElement } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Calendar } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PremiumGate from "@/components/diary/PremiumGate";
import { useDiaryReport } from "@/hooks/useDiaryReport";
import { COPY } from "@/constants/copy";
import { CHECKLIST_ITEMS, type ChecklistCategory } from "@/types/diary";
import { staggerContainer, fadeSlideUp } from "@/lib/motion";

const GRADE_COLORS: Record<number, string> = {
  1: "#22C55E",
  2: "#EAB308",
  3: "#F97316",
  4: "#EF4444",
  5: "#A855F7",
};

function getChecklistLabel(category: string, item: string): string {
  const cat = CHECKLIST_ITEMS[category as ChecklistCategory];
  if (!cat) return item;
  return cat.find((c) => c.key === item)?.label ?? item;
}

export default function DiaryReportPage(): ReactElement {
  const { data, isLoading, error } = useDiaryReport();

  const isPremiumError = error?.message === "PREMIUM_REQUIRED";

  return (
    <PageContainer>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeSlideUp}>
          <h1 className="text-xl font-bold">{COPY.DIARY_REPORT_TITLE}</h1>
        </motion.div>

        <PremiumGate>
          {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

          {data && (
            <>
              {/* Summary cards */}
              <motion.div variants={fadeSlideUp} className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/50 p-4">
                  <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{data.summary.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">총 기록</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{data.summary.avgScore}</p>
                  <p className="text-xs text-muted-foreground">평균 점수</p>
                </div>
              </motion.div>

              {/* Score trend */}
              <motion.div variants={fadeSlideUp} className="space-y-2">
                <h3 className="text-sm font-semibold">{COPY.DIARY_REPORT_SCORE_TREND}</h3>
                <div className="flex items-end gap-1 h-32 rounded-xl bg-muted/30 p-3">
                  {data.scoreTrend.map((point, i) => {
                    const height = `${Math.max(10, point.score)}%`;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{
                          height,
                          backgroundColor: GRADE_COLORS[point.grade] ?? "#888",
                          minWidth: 4,
                          maxWidth: 12,
                        }}
                        title={`${point.date}: ${point.score}점`}
                      />
                    );
                  })}
                  {data.scoreTrend.length === 0 && (
                    <p className="text-xs text-muted-foreground m-auto">데이터가 부족해요</p>
                  )}
                </div>
              </motion.div>

              {/* Checklist stats */}
              <motion.div variants={fadeSlideUp} className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  {COPY.DIARY_REPORT_CHECKLIST_STATS}
                </h3>
                {data.checklistStats.map((stat) => (
                  <div key={`${stat.category}-${stat.item}`} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{getChecklistLabel(stat.category, stat.item)}</span>
                      <span className="text-muted-foreground">{stat.rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${stat.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </>
          )}

          {isPremiumError && null}
        </PremiumGate>
      </motion.div>
    </PageContainer>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/diary/report/ src/hooks/useDiaryReport.ts src/app/\(main\)/diary/report/
git commit -m "feat(report): add premium diary report API, hook, and page"
```

---

### Task 13: Navigation + Dashboard — update to diary links

**Files:**
- Modify: `src/components/layout/FloatingMenu.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/app/(main)/dashboard/page.tsx`

- [ ] **Step 1: Update FloatingMenu — replace board with diary**

In `src/components/layout/FloatingMenu.tsx`, replace the board nav entry:

```typescript
// Change:
{ href: "/board", label: COPY.NAV_BOARD, icon: MessageCircle },
// To:
{ href: "/diary", label: COPY.NAV_DIARY, icon: BookOpen },
```

Update the import: replace `MessageCircle` with `BookOpen` from lucide-react (if not already imported). Add `BookOpen` to the import.

Also add a child for public feed under a "다이어리" group if desired, or keep it flat.

- [ ] **Step 2: Update Footer — simplify to light footer**

Replace the content of `src/components/layout/Footer.tsx` with a minimal version:

```typescript
// src/components/layout/Footer.tsx
import Link from "next/link";
import { COPY } from "@/constants/copy";
import type { ReactElement } from "react";

export default function Footer(): ReactElement {
  return (
    <footer className="flex items-center justify-center gap-3 py-4 text-xs text-muted-foreground">
      <span className="font-semibold">{COPY.APP_NAME}</span>
      <span>·</span>
      <Link href="/terms" className="hover:underline">이용약관</Link>
      <span>·</span>
      <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
    </footer>
  );
}
```

- [ ] **Step 3: Update Dashboard — replace board quick action with diary**

In `src/app/(main)/dashboard/page.tsx`, find the QuickAction with `href="/board"` and change:

```typescript
// Change:
<QuickAction
  icon={<MessageCircle className="h-5 w-5 text-amber-500" />}
  label="커뮤니티"
  desc="후기 & 정보 공유"
  href="/board"
  gradient="bg-amber-500"
/>
// To:
<QuickAction
  icon={<BookOpen className="h-5 w-5 text-amber-500" />}
  label="헤어 다이어리"
  desc="오늘의 두피 기록"
  href="/diary"
  gradient="bg-amber-500"
/>
```

Also update the community testimonials section link from `/board` to `/diary/public`.

Update the import: replace `MessageCircle` with `BookOpen` from lucide-react.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/FloatingMenu.tsx src/components/layout/Footer.tsx src/app/\(main\)/dashboard/page.tsx
git commit -m "refactor(nav): update navigation and dashboard to diary links"
```

---

### Task 14: Integrate ScanSession into diary new entry flow

**Files:**
- Modify: `src/app/(main)/diary/new/page.tsx`

- [ ] **Step 1: Wire ScanSession into new entry page**

Replace the placeholder in `src/app/(main)/diary/new/page.tsx` with the actual scan integration:

```typescript
// src/app/(main)/diary/new/page.tsx
"use client";

import { useState, useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import PageContainer from "@/components/layout/PageContainer";
import DiaryEntryForm from "@/components/diary/DiaryEntryForm";
import { useCreateDiaryEntry } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import { useScanSessionStore } from "@/stores/scanSession";
import { COPY } from "@/constants/copy";

const ScanSession = dynamic(() => import("@/components/scan/ScanSession"), { ssr: false });

type DiaryFormSubmitData = {
  memo: string;
  isPublic: boolean;
  isPhotoPublic: boolean;
  checklists: { category: string; item: string; checked: boolean }[];
};

export default function NewDiaryEntryPage(): ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const createEntry = useCreateDiaryEntry();
  const { images, reset: resetScan } = useScanSessionStore();
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanCompleted, setScanCompleted] = useState(false);

  // After scan upload completes (via /scan/uploading flow), the scanId comes back
  // For diary, we need a streamlined flow. The scan step uploads photos and
  // triggers analysis. Once done, we get a scanId to link to the diary entry.

  const handleScanComplete = useCallback((completedScanId: string) => {
    setScanId(completedScanId);
    setScanCompleted(true);
  }, []);

  const handleSubmit = useCallback(
    async (data: DiaryFormSubmitData) => {
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      try {
        await createEntry.mutateAsync({
          ...data,
          date: today,
          scanId: scanId ?? undefined,
        });
        toast.success(COPY.DIARY_ENTRY_SAVED);
        resetScan();
        router.push("/diary");
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
    [user, scanId, createEntry, router, resetScan],
  );

  if (!user) {
    router.push("/login");
    return <></>;
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-xl font-bold">{COPY.DIARY_ADD_CTA}</h1>

        {/* Photo capture step */}
        {!scanCompleted && (
          <div className="rounded-2xl border border-border p-4">
            <ScanSession />
          </div>
        )}

        {scanCompleted && (
          <div className="rounded-xl bg-green-500/10 px-4 py-3 text-center text-sm text-green-600 font-medium">
            사진 촬영 완료! AI가 분석 중이에요...
          </div>
        )}

        {/* Form (can fill while scan analyzes) */}
        <DiaryEntryForm
          onSubmit={handleSubmit}
          isSubmitting={createEntry.isPending}
          submitLabel="다이어리 저장"
        />
      </div>
    </PageContainer>
  );
}
```

Note: The exact integration depends on how `ScanSession` exposes its completion callback. This may require a small prop addition to `ScanSession` or listening to the scan store state. Adapt based on the actual component API.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(main\)/diary/new/page.tsx
git commit -m "feat(diary): integrate ScanSession into diary entry creation flow"
```

---

### Task 15: Static pages — Privacy, Terms, Contact

**Files:**
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/api/contact/route.ts`

- [ ] **Step 1: Create privacy policy page**

```typescript
// src/app/privacy/page.tsx
import type { Metadata } from "next";
import type { ReactElement } from "react";
import PageContainer from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Alopedia",
};

export default function PrivacyPage(): ReactElement {
  return (
    <PageContainer>
      <article className="prose prose-sm dark:prose-invert max-w-none">
        <h1>개인정보처리방침</h1>
        <p>시행일: 2026년 3월 31일</p>

        <h2>1. 수집하는 개인정보 항목</h2>
        <ul>
          <li>이메일 주소 (소셜 로그인 시)</li>
          <li>두피 사진 (정수리, 전면이마, 측면이마)</li>
          <li>AI 분석 결과 (노우드-해밀턴 등급, 점수, 상세 분석)</li>
          <li>건강 관련 기록 (약물 복용, 시술 이력, 생활습관)</li>
          <li>자유 메모 내용</li>
        </ul>

        <h2>2. 수집 목적</h2>
        <ul>
          <li>AI 기반 두피 상태 분석 서비스 제공</li>
          <li>두피 상태 변화 추적 및 리포트 생성</li>
          <li>공개 다이어리를 통한 커뮤니티 기능 제공</li>
          <li>서비스 개선 및 통계 분석 (비식별화 처리)</li>
        </ul>

        <h2>3. 민감정보 처리</h2>
        <p>
          두피 사진 및 건강 관련 기록은 「개인정보 보호법」상 민감정보에 해당할 수 있습니다.
          회원가입 시 별도 동의를 받으며, 동의 없이는 수집하지 않습니다.
        </p>

        <h2>4. 보관 기간 및 파기</h2>
        <ul>
          <li>회원 탈퇴 시 즉시 삭제 (복구 불가)</li>
          <li>사진 원본: 서버 업로드 시 EXIF 메타데이터(GPS, 디바이스 정보) 자동 제거</li>
          <li>탈퇴 후 30일 이내 모든 백업에서 삭제</li>
        </ul>

        <h2>5. 제3자 제공</h2>
        <p>
          이용자가 다이어리를 &quot;공개&quot;로 설정한 경우에 한하여, 닉네임, AI 분석 등급,
          메모, 체크리스트 정보가 다른 이용자에게 노출됩니다.
          사진은 별도로 &quot;사진 공개&quot;를 선택한 경우에만 원본이 공개되며,
          그렇지 않은 경우 블러 처리됩니다.
        </p>

        <h2>6. 이미지 처리</h2>
        <p>
          업로드된 모든 이미지는 서버에서 EXIF 메타데이터(GPS 좌표, 디바이스 정보 등)가
          자동으로 제거됩니다. 원본 이미지의 위치 정보 등은 저장되지 않습니다.
        </p>

        <h2>7. 이용자의 권리</h2>
        <ul>
          <li>개인정보 열람, 수정, 삭제 요청 가능</li>
          <li>다이어리 비공개 전환 언제든지 가능</li>
          <li>회원 탈퇴를 통한 전체 데이터 삭제 가능</li>
          <li>문의: 설정 &gt; 문의하기 또는 이메일</li>
        </ul>

        <h2>8. AI 분석 관련 고지</h2>
        <p>
          본 서비스의 AI 분석은 참고용이며, 의료 진단을 대체하지 않습니다.
          정확한 진단은 전문의 상담을 권장합니다.
        </p>
      </article>
    </PageContainer>
  );
}
```

- [ ] **Step 2: Create terms of service page**

```typescript
// src/app/terms/page.tsx
import type { Metadata } from "next";
import type { ReactElement } from "react";
import PageContainer from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "이용약관 | Alopedia",
};

export default function TermsPage(): ReactElement {
  return (
    <PageContainer>
      <article className="prose prose-sm dark:prose-invert max-w-none">
        <h1>이용약관</h1>
        <p>시행일: 2026년 3월 31일</p>

        <h2>1. 서비스 개요</h2>
        <p>
          Alopedia는 AI 기반 두피 상태 분석 및 변화 추적 서비스입니다.
          사용자는 두피 사진을 촬영하여 AI 분석을 받고, 헤어 다이어리를 통해
          일일 기록을 관리할 수 있습니다.
        </p>

        <h2>2. 의료 면책 조항</h2>
        <p>
          본 서비스의 AI 분석 결과는 참고용이며, 의료 진단을 대체하지 않습니다.
          &quot;진단합니다&quot;, &quot;치료가 필요합니다&quot; 등의 의료적 판단을 제공하지 않으며,
          &quot;분석합니다&quot;, &quot;전문의 상담을 추천합니다&quot; 형태로만 안내합니다.
          건강 관련 결정은 반드시 전문의와 상담하시기 바랍니다.
        </p>

        <h2>3. 이용 규칙</h2>
        <ul>
          <li>타인의 사진을 무단으로 업로드하지 않습니다.</li>
          <li>공개 다이어리에 부적절한 콘텐츠를 게시하지 않습니다.</li>
          <li>서비스를 악용하거나 비정상적인 방법으로 접근하지 않습니다.</li>
        </ul>

        <h2>4. 콘텐츠 책임</h2>
        <p>
          공개 다이어리에 게시된 콘텐츠의 책임은 작성자에게 있습니다.
          운영팀은 부적절한 콘텐츠를 사전 통보 없이 비공개 처리할 수 있습니다.
        </p>

        <h2>5. 프리미엄 서비스</h2>
        <ul>
          <li>가입 후 30일간 모든 프리미엄 기능을 무료로 체험할 수 있습니다.</li>
          <li>무료 체험 종료 후 리포트, 비교, 통계 기능은 유료 구독이 필요합니다.</li>
          <li>기본 기능(다이어리 기록, AI 분석, 캘린더)은 무료로 이용 가능합니다.</li>
        </ul>

        <h2>6. 서비스 변경 및 중단</h2>
        <p>
          운영상 필요한 경우 서비스 내용을 변경하거나 중단할 수 있으며,
          중요한 변경은 사전에 공지합니다.
        </p>
      </article>
    </PageContainer>
  );
}
```

- [ ] **Step 3: Create contact API**

```typescript
// src/app/api/contact/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "support@alopedia.kr";

/** POST /api/contact — send contact email */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json();
  const { subject, content, email } = body as {
    subject: string;
    content: string;
    email: string;
  };

  if (!subject?.trim() || !content?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }

  if (subject.length > 200 || content.length > 5000) {
    return NextResponse.json({ error: "제목 또는 내용이 너무 길어요." }, { status: 400 });
  }

  // For now, store in a contact_messages concept or send via external service.
  // Minimal implementation: log and acknowledge.
  // TODO: Integrate Resend or Nodemailer when email service is set up.
  console.log("[Contact]", {
    from: email,
    userId: user?.id ?? "anonymous",
    subject,
    content: content.slice(0, 200),
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 4: Create contact page**

```typescript
// src/app/contact/page.tsx
"use client";

import { useState, useCallback, type ReactElement } from "react";
import { toast } from "sonner";
import PageContainer from "@/components/layout/PageContainer";
import { useAuth } from "@/hooks/useAuth";
import { COPY } from "@/constants/copy";

export default function ContactPage(): ReactElement {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!subject.trim() || !content.trim() || !email.trim()) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success(COPY.CONTACT_SUCCESS);
      setSubject("");
      setContent("");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, content, email]);

  return (
    <PageContainer>
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-xl font-bold">{COPY.CONTACT_TITLE}</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{COPY.CONTACT_EMAIL_LABEL}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">제목</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={COPY.CONTACT_SUBJECT_PLACEHOLDER}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={COPY.CONTACT_BODY_PLACEHOLDER}
              rows={6}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "보내는 중..." : COPY.CONTACT_SUBMIT}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/privacy/ src/app/terms/ src/app/contact/ src/app/api/contact/
git commit -m "feat(pages): add privacy, terms, and contact pages with API"
```

---

### Task 16: Auth — add terms consent to signup flow

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Add consent checkboxes to login page**

In `src/app/(auth)/login/page.tsx`, before the social login button, add consent checkboxes:

```typescript
// Add state
const [termsAgreed, setTermsAgreed] = useState(false);
const [privacyAgreed, setPrivacyAgreed] = useState(false);

// Add to JSX, before the login button:
<div className="space-y-2">
  <label className="flex items-start gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={termsAgreed}
      onChange={(e) => setTermsAgreed(e.target.checked)}
      className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
    />
    <span className="text-xs text-muted-foreground">
      <Link href="/terms" className="underline" target="_blank">{COPY.TERMS_AGREE}</Link>
    </span>
  </label>
  <label className="flex items-start gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={privacyAgreed}
      onChange={(e) => setPrivacyAgreed(e.target.checked)}
      className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
    />
    <span className="text-xs text-muted-foreground">
      <Link href="/privacy" className="underline" target="_blank">{COPY.PRIVACY_AGREE}</Link>
    </span>
  </label>
</div>

// Disable login button unless both checked:
<button
  disabled={!termsAgreed || !privacyAgreed || isLoading}
  ...
>
```

Also, after successful login callback, update `terms_agreed_at`:
```typescript
// In /api/auth/callback/route.ts, after successful auth:
await supabase
  .from("profiles")
  .update({ terms_agreed_at: new Date().toISOString() })
  .eq("id", user.id)
  .is("terms_agreed_at", null);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx src/app/api/auth/callback/route.ts
git commit -m "feat(auth): add terms and privacy consent to login flow"
```

---

### Task 17: Light footer — add to app layout

**Files:**
- Create: `src/components/layout/LightFooter.tsx`
- Modify: `src/app/layout.tsx` (or relevant layout)

- [ ] **Step 1: Create LightFooter component**

```typescript
// src/components/layout/LightFooter.tsx
import Link from "next/link";
import { COPY } from "@/constants/copy";
import type { ReactElement } from "react";

export default function LightFooter(): ReactElement {
  return (
    <footer className="flex items-center justify-center gap-3 border-t border-border/50 py-4 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground/70">{COPY.APP_NAME}</span>
      <span className="text-border">·</span>
      <Link href="/terms" className="transition-colors hover:text-foreground">
        이용약관
      </Link>
      <span className="text-border">·</span>
      <Link href="/privacy" className="transition-colors hover:text-foreground">
        개인정보처리방침
      </Link>
    </footer>
  );
}
```

- [ ] **Step 2: Add LightFooter to the main layout**

In the appropriate layout file (e.g. `src/app/(main)/layout.tsx` or `src/app/layout.tsx`), import and render `LightFooter` at the bottom, above `FloatingMenu`:

```typescript
import LightFooter from "@/components/layout/LightFooter";

// In the JSX:
<main>{children}</main>
<LightFooter />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/LightFooter.tsx src/app/layout.tsx
git commit -m "feat(layout): add light global footer with terms and privacy links"
```

---

### Task 18: Clean up remaining board references

**Files:**
- Modify: various (grep-based cleanup)

- [ ] **Step 1: Search for all remaining board references**

Run: `grep -r "board\|Board\|BOARD\|게시판\|커뮤니티\|useVote\|useBoardPosts\|usePostDetail" src/ --include="*.ts" --include="*.tsx" -l`

For each file found:
- Remove or update import statements
- Replace "게시판" with "다이어리" where appropriate
- Replace "커뮤니티" with "공개 다이어리" or "다이어리" where appropriate
- Remove unused board-related code

Key files likely to have references:
- `src/app/(main)/dashboard/page.tsx` — community testimonials section
- `src/constants/copy.ts` — any remaining strings
- `src/app/layout.tsx` — any board metadata
- `src/components/layout/FloatingMenu.tsx` — nav entries

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds with no errors referencing deleted board files.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: clean up all remaining board references"
```

---

### Task 19: Update database.ts — add diary profile fields

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Add diary fields to Profile and DbProfile interfaces**

In `src/types/database.ts`, add to `Profile` interface:

```typescript
export interface Profile {
  // ... existing fields
  diaryPremiumUntil: string | null;
  termsAgreedAt: string | null;
}
```

And to `DbProfile`:

```typescript
export interface DbProfile {
  // ... existing fields
  diary_premium_until: string | null;
  terms_agreed_at: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(types): add diary premium and terms fields to profile types"
```

---

### Task 20: Final verification + landing page update

**Files:**
- Modify: `src/app/page.tsx` (landing page, if board references exist)

- [ ] **Step 1: Update landing page feature section**

Update the "익명 커뮤니티" feature card to "헤어 다이어리":
- Title: `COPY.FEATURE_COMMUNITY_TITLE` (already updated in Task 3)
- Description: `COPY.FEATURE_COMMUNITY_DESC` (already updated in Task 3)
- Icon: change from community icon to diary/calendar icon

- [ ] **Step 2: Run full build**

Run: `pnpm build`
Expected: Clean build with zero errors.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: No lint errors.

- [ ] **Step 4: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(diary): complete hair diary feature — board replaced"
```
