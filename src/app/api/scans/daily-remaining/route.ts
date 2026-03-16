import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DAILY_LIMIT = 2;

/** GET /api/scans/daily-remaining — 오늘 남은 분석 횟수 조회 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("scans")
    .select("id, analyses!inner(id)", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("analyses.created_at", todayStart.toISOString());

  const isDev = process.env.NODE_ENV === "development";
  const used = count ?? 0;
  const remaining = isDev ? 999 : Math.max(0, DAILY_LIMIT - used);
  const limit = isDev ? 999 : DAILY_LIMIT;

  return NextResponse.json({ remaining, used, limit });
}
