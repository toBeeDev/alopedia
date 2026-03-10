import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/board/posts/:id — 게시글 상세 + 댓글 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey(nickname, avatar_seed)")
    .eq("id", id)
    .single();

  if (postError || !post) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*, profiles!comments_user_id_fkey(nickname, avatar_seed)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  if (commentsError) {
    return NextResponse.json(
      { error: "댓글을 불러올 수 없어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ post, comments });
}

/** DELETE /api/board/posts/:id — 게시글 삭제 (본인만) */
export async function DELETE(
  _request: NextRequest,
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
