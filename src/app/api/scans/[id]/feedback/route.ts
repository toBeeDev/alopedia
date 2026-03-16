import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FeedbackRating } from "@/types/database";

const VALID_RATINGS: FeedbackRating[] = ["accurate", "too_high", "too_low"];

/** POST /api/scans/:id/feedback — 피드백 저장 (upsert) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: scanId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (
    typeof body !== "object" ||
    body === null ||
    !VALID_RATINGS.includes((body as Record<string, unknown>).rating as FeedbackRating)
  ) {
    return NextResponse.json({ error: "올바르지 않은 피드백이에요." }, { status: 400 });
  }

  const rating = (body as Record<string, string>).rating as FeedbackRating;

  // scan → analysis 소유권 확인
  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, scans!inner(user_id)")
    .eq("scan_id", scanId)
    .eq("scans.user_id", user.id)
    .single();

  if (!analysis) {
    return NextResponse.json({ error: "분석 결과를 찾을 수 없어요." }, { status: 404 });
  }

  // upsert: 분석당 1회, 수정 가능
  const { data: feedback, error } = await supabase
    .from("analysis_feedbacks")
    .upsert(
      {
        analysis_id: analysis.id,
        user_id: user.id,
        rating,
      },
      { onConflict: "analysis_id,user_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("[POST /api/scans/:id/feedback] Error:", error);
    return NextResponse.json({ error: "피드백 저장에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ feedback });
}

/** GET /api/scans/:id/feedback — 내 피드백 조회 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: scanId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // scan → analysis 조회
  const { data: analysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("scan_id", scanId)
    .single();

  if (!analysis) {
    return NextResponse.json({ feedback: null });
  }

  const { data: feedback } = await supabase
    .from("analysis_feedbacks")
    .select("id, rating, created_at")
    .eq("analysis_id", analysis.id)
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ feedback: feedback ?? null });
}
