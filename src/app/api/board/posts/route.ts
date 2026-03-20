import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit/memory";
import { stripHtml } from "@/lib/utils/sanitize";
import { generateSlug } from "@/lib/utils/slug";
import { grantExp } from "@/lib/utils/grantExp";
import { EXP_REWARDS } from "@/lib/utils/level";
import type { BoardType } from "@/types/database";

const VALID_BOARDS: BoardType[] = [
  "medication_review",
  "procedure_review",
  "qna",
  "lounge",
];

const PAGE_SIZE = 20;

/** GET /api/board/posts — 게시글 목록 (페이지네이션 + 필터) */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const board = searchParams.get("board") as BoardType | null;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("posts")
    .select("*, profiles!posts_user_id_profiles_fkey(nickname, avatar_seed, role), comments(count)", {
      count: "exact",
    })
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (board && VALID_BOARDS.includes(board)) {
    query = query.eq("board", board);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.error("[GET /api/board/posts] Supabase error:", error);
    return NextResponse.json(
      { error: "게시글을 불러올 수 없어요.", detail: error.message },
      { status: 500 },
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapped = (posts ?? []).map((p: any) => ({
    ...p,
    comment_count: p.comments?.[0]?.count ?? 0,
    comments: undefined,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return NextResponse.json({
    posts: mapped,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    },
  });
}

/** POST /api/board/posts — 게시글 작성 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Rate limit: 10 posts per minute
  const rl = checkRateLimit(`post:${user.id}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "게시글 작성이 너무 빠릅니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { board, title, content, tags, scanId, norwoodGrade, score, images } = body as {
    board: string;
    title: string;
    content: string;
    tags?: string[];
    scanId?: string;
    norwoodGrade?: number;
    score?: number;
    images?: Record<string, unknown>[];
  };

  // Validation
  if (!board || !VALID_BOARDS.includes(board as BoardType)) {
    return NextResponse.json(
      { error: "유효하지 않은 게시판이에요." },
      { status: 400 },
    );
  }
  if (!title || title.trim().length < 2 || title.trim().length > 100) {
    return NextResponse.json(
      { error: "제목은 2~100자로 입력해주세요." },
      { status: 400 },
    );
  }
  if (!content || content.trim().length < 10 || content.trim().length > 5000) {
    return NextResponse.json(
      { error: "내용은 10~5000자로 입력해주세요." },
      { status: 400 },
    );
  }

  // Tags validation
  if (tags !== undefined) {
    if (!Array.isArray(tags) || !tags.every((t): t is string => typeof t === "string")) {
      return NextResponse.json(
        { error: "태그는 문자열 배열이어야 해요." },
        { status: 400 },
      );
    }
    if (tags.length > 5) {
      return NextResponse.json(
        { error: "태그는 최대 5개까지 입력할 수 있어요." },
        { status: 400 },
      );
    }
    if (tags.some((t) => t.length > 20)) {
      return NextResponse.json(
        { error: "각 태그는 20자 이내로 입력해주세요." },
        { status: 400 },
      );
    }
  }

  const sanitizedTags = (tags ?? []).map((t) => stripHtml(t).trim()).filter(Boolean);

  // Check if user is admin → auto-pin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const slug = generateSlug(title);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      slug,
      board,
      title: stripHtml(title.trim()),
      content: stripHtml(content.trim()),
      tags: sanitizedTags,
      scan_id: scanId ?? null,
      norwood_grade: norwoodGrade ?? null,
      score: score ?? null,
      images: images ?? null,
      is_pinned: isAdmin,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "게시글 작성에 실패했어요." },
      { status: 500 },
    );
  }

  // Grant EXP for post creation
  await grantExp(supabase, user.id, EXP_REWARDS.POST_CREATED);

  return NextResponse.json({ post }, { status: 201 });
}
