import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** DELETE /api/diary/comments/:id — 댓글 삭제 (작성자만) */
export async function DELETE(
  _request: NextRequest,
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

  const { error } = await supabase
    .from("diary_comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[DELETE /api/diary/comments/:id] error:", error);
    return NextResponse.json({ error: "댓글 삭제에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
