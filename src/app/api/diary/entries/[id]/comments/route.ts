import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/diary/entries/:id/comments — 댓글 목록 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("diary_comments")
    .select("*, profiles!diary_comments_user_id_fkey(nickname, avatar_seed)")
    .eq("entry_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[GET /api/diary/entries/:id/comments] error:", error);
    return NextResponse.json({ error: "댓글을 불러올 수 없어요." }, { status: 500 });
  }

  const mapped = (comments ?? []).map((c: Record<string, unknown>) => {
    const profile = c.profiles as { nickname: string; avatar_seed: string | null } | null;
    return {
      id: c.id,
      entryId: c.entry_id,
      userId: c.user_id,
      content: c.content,
      createdAt: c.created_at,
      profile: profile
        ? { nickname: profile.nickname, avatarSeed: profile.avatar_seed }
        : null,
    };
  });

  return NextResponse.json({ comments: mapped });
}

/** POST /api/diary/entries/:id/comments — 댓글 작성 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  let body: { content: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "올바른 요청 형식이 아니에요." }, { status: 400 });
  }

  const { content } = body;
  if (!content || content.trim().length === 0 || content.length > 500) {
    return NextResponse.json(
      { error: "댓글은 1~500자로 입력해주세요." },
      { status: 400 },
    );
  }

  const { data: comment, error } = await supabase
    .from("diary_comments")
    .insert({ entry_id: id, user_id: user.id, content: content.trim() })
    .select("*, profiles!diary_comments_user_id_fkey(nickname, avatar_seed)")
    .single();

  if (error) {
    console.error("[POST /api/diary/entries/:id/comments] error:", error);
    return NextResponse.json({ error: "댓글 작성에 실패했어요." }, { status: 500 });
  }

  const profile = (comment as Record<string, unknown>).profiles as { nickname: string; avatar_seed: string | null } | null;

  return NextResponse.json({
    comment: {
      id: comment.id,
      entryId: comment.entry_id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at,
      profile: profile
        ? { nickname: profile.nickname, avatarSeed: profile.avatar_seed }
        : null,
    },
  }, { status: 201 });
}
