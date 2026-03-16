import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/profile/stats — 활동 통계 조회 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // 병렬 조회: 분석 횟수, 게시글 수, 댓글 수, 최근 분석
  const [scansResult, postsResult, commentsResult] =
    await Promise.all([
      supabase
        .from("scans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  // 최근 분석은 join이 안 되므로 별도 조회
  const { data: latestScan } = await supabase
    .from("scans")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let latestGrade: number | null = null;
  let latestScore: number | null = null;

  if (latestScan) {
    const { data: analysis } = await supabase
      .from("analyses")
      .select("norwood_grade, score")
      .eq("scan_id", latestScan.id)
      .single();

    if (analysis) {
      latestGrade = analysis.norwood_grade;
      latestScore = analysis.score;
    }
  }

  return NextResponse.json({
    stats: {
      scanCount: scansResult.count ?? 0,
      postCount: postsResult.count ?? 0,
      commentCount: commentsResult.count ?? 0,
      latestGrade,
      latestScore,
    },
  });
}
