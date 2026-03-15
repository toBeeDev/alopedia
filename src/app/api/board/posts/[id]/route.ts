import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPin, isValidPin } from "@/lib/utils/pin";
import type { BoardType } from "@/types/database";

const VALID_BOARDS: BoardType[] = [
  "medication_review",
  "procedure_review",
  "qna",
  "lounge",
];

/** GET /api/board/posts/:id — 게시글 상세 + 댓글 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  // slug 또는 UUID 모두 지원
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const column = isUuid ? "id" : "slug";

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, profiles!posts_user_id_profiles_fkey(nickname, avatar_seed, role)")
    .eq(column, id)
    .single();

  if (postError || !post) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*, profiles!comments_user_id_profiles_fkey(nickname, avatar_seed)")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  if (commentsError) {
    return NextResponse.json(
      { error: "댓글을 불러올 수 없어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ post, comments });
}

/** PATCH /api/board/posts/:id — 게시글 수정 (본인만) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "수정 권한이 없어요." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { board, title, content, tags } = body as {
    board?: string;
    title?: string;
    content?: string;
    tags?: string[];
  };

  const updates: Record<string, unknown> = {};

  if (board !== undefined) {
    if (!VALID_BOARDS.includes(board as BoardType)) {
      return NextResponse.json(
        { error: "유효하지 않은 게시판이에요." },
        { status: 400 },
      );
    }
    updates.board = board;
  }
  if (title !== undefined) {
    if (title.trim().length < 2 || title.trim().length > 100) {
      return NextResponse.json(
        { error: "제목은 2~100자로 입력해주세요." },
        { status: 400 },
      );
    }
    updates.title = title.trim();
  }
  if (content !== undefined) {
    if (content.trim().length < 10 || content.trim().length > 5000) {
      return NextResponse.json(
        { error: "내용은 10~5000자로 입력해주세요." },
        { status: 400 },
      );
    }
    updates.content = content.trim();
  }
  if (tags !== undefined) {
    updates.tags = tags;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "수정할 내용이 없어요." },
      { status: 400 },
    );
  }

  const { data: post, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "게시글 수정에 실패했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ post });
}

/** DELETE /api/board/posts/:id — 게시글 삭제 (본인 + 비밀번호 확인) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Get post with pin hash
  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id, delete_pin")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: "삭제 권한이 없어요." },
      { status: 403 },
    );
  }

  // Verify pin
  const body = await request.json();
  const { deletePin } = body as { deletePin: string };

  if (!deletePin || !isValidPin(deletePin)) {
    return NextResponse.json(
      { error: "삭제 비밀번호 4자리를 입력해주세요." },
      { status: 400 },
    );
  }

  if (post.delete_pin && !verifyPin(deletePin, post.delete_pin)) {
    return NextResponse.json(
      { error: "비밀번호가 일치하지 않아요." },
      { status: 403 },
    );
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "게시글 삭제에 실패했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
