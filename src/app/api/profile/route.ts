import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit/memory";

/** GET /api/profile — 내 프로필 조회 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: "프로필을 불러올 수 없어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}

/** PATCH /api/profile — 프로필 수정 (닉네임) */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Rate limit: 5 updates per minute
  const rl = checkRateLimit(`profile:${user.id}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { nickname } = body as { nickname?: string };

  if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 20) {
    return NextResponse.json(
      { error: "닉네임은 2~20자로 입력해주세요." },
      { status: 400 },
    );
  }

  const sanitized = nickname.trim();

  // Check uniqueness
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("nickname", sanitized)
    .neq("id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "이미 사용 중인 닉네임이에요." },
      { status: 409 },
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ nickname: sanitized })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "프로필 수정에 실패했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}
