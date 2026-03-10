import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit/memory";

/** POST /api/board/posts/:id/comments — 댓글 작성 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: postId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Rate limit: 30 comments per minute
  const rl = checkRateLimit(`comment:${user.id}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "댓글 작성이 너무 빠릅니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { content, parentId } = body as {
    content: string;
    parentId?: string;
  };

  if (!content || content.trim().length < 1 || content.trim().length > 1000) {
    return NextResponse.json(
      { error: "댓글은 1~1000자로 입력해주세요." },
      { status: 400 },
    );
  }

  // Verify post exists
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId ?? null,
    })
    .select()
    .single();

  if (commentError) {
    return NextResponse.json(
      { error: "댓글 작성에 실패했어요." },
      { status: 500 },
    );
  }

  // Increment comment_count on post
  await supabase.rpc("increment_comment_count", { post_id: postId });

  return NextResponse.json({ comment }, { status: 201 });
}
