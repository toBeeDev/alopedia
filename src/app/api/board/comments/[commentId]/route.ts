import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripHtml } from "@/lib/utils/sanitize";

/** PATCH /api/board/comments/:commentId — 댓글 수정 (본인만) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
): Promise<NextResponse> {
  const { commentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("comments")
    .select("id, user_id")
    .eq("id", commentId)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "댓글을 찾을 수 없어요." },
      { status: 404 },
    );
  }

  // 본인 또는 admin만 수정 가능
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isOwner = existing.user_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "수정 권한이 없어요." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { content } = body as { content: string };

  if (!content || content.trim().length < 1 || content.trim().length > 1000) {
    return NextResponse.json(
      { error: "댓글은 1~1000자로 입력해주세요." },
      { status: 400 },
    );
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .update({ content: stripHtml(content.trim()) })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "댓글 수정에 실패했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ comment });
}

/** DELETE /api/board/comments/:commentId — 댓글 삭제 (본인 또는 admin) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
): Promise<NextResponse> {
  const { commentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // 댓글 조회
  const { data: comment } = await supabase
    .from("comments")
    .select("id, user_id, post_id")
    .eq("id", commentId)
    .single();

  if (!comment) {
    return NextResponse.json(
      { error: "댓글을 찾을 수 없어요." },
      { status: 404 },
    );
  }

  // 본인 또는 admin만 삭제 가능
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isOwner = comment.user_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "삭제 권한이 없어요." },
      { status: 403 },
    );
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return NextResponse.json(
      { error: "댓글 삭제에 실패했어요." },
      { status: 500 },
    );
  }

  // Sync comment_count
  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", comment.post_id);

  await supabase
    .from("posts")
    .update({ comment_count: count ?? 0 })
    .eq("id", comment.post_id);

  return NextResponse.json({ success: true });
}
