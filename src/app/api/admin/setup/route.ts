import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit/memory";

/**
 * POST /api/admin/setup
 * 최초 1회: 현재 로그인된 사용자를 admin으로 설정합니다.
 * admin이 이미 존재하면 실행 불가.
 */
export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Rate limit: 3 attempts per minute
  const rl = checkRateLimit(`admin-setup:${user.id}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  // 이미 admin이 있으면 차단
  const { data: existingAdmin } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (existingAdmin) {
    return NextResponse.json(
      { error: "이미 관리자가 설정되어 있어요." },
      { status: 403 },
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id)
    .select("id, nickname, role")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "관리자 설정에 실패했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "관리자로 설정됐어요!",
    profile,
  });
}
