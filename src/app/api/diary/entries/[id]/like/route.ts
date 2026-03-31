import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** POST /api/diary/entries/:id/like — 좋아요 토글 */
export async function POST(
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

  // Check existing like
  const { data: existing } = await supabase
    .from("diary_likes")
    .select("id")
    .eq("entry_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from("diary_likes")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("[POST /api/diary/entries/:id/like] unlike error:", error);
      return NextResponse.json({ error: "좋아요 취소에 실패했어요." }, { status: 500 });
    }

    return NextResponse.json({ liked: false });
  }

  // Like
  const { error } = await supabase
    .from("diary_likes")
    .insert({ entry_id: id, user_id: user.id });

  if (error) {
    console.error("[POST /api/diary/entries/:id/like] like error:", error);
    return NextResponse.json({ error: "좋아요에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ liked: true });
}
