import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit/memory";
import type { VoteTargetType } from "@/types/database";

const VALID_TARGETS: VoteTargetType[] = ["post", "comment", "scan"];

/** POST /api/board/votes — 깃털 투척 (toggle) */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Rate limit: 60 votes per minute
  const rl = checkRateLimit(`vote:${user.id}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { targetType, targetId } = body as {
    targetType: string;
    targetId: string;
  };

  if (!targetType || !VALID_TARGETS.includes(targetType as VoteTargetType)) {
    return NextResponse.json(
      { error: "유효하지 않은 대상이에요." },
      { status: 400 },
    );
  }
  if (!targetId) {
    return NextResponse.json(
      { error: "대상 ID가 필요해요." },
      { status: 400 },
    );
  }

  // Check existing vote
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .single();

  if (existingVote) {
    // Remove vote (toggle off)
    await supabase.from("votes").delete().eq("id", existingVote.id);

    // Decrement vote_count
    if (targetType === "post") {
      await supabase.rpc("decrement_vote_count_post", { p_id: targetId });
    } else if (targetType === "comment") {
      await supabase.rpc("decrement_vote_count_comment", { c_id: targetId });
    }

    return NextResponse.json({ voted: false });
  }

  // Add vote
  const { error } = await supabase.from("votes").insert({
    user_id: user.id,
    target_type: targetType,
    target_id: targetId,
    vote_type: "up",
  });

  if (error) {
    return NextResponse.json(
      { error: "투표에 실패했어요." },
      { status: 500 },
    );
  }

  // Increment vote_count
  if (targetType === "post") {
    await supabase.rpc("increment_vote_count_post", { p_id: targetId });
  } else if (targetType === "comment") {
    await supabase.rpc("increment_vote_count_comment", { c_id: targetId });
  }

  return NextResponse.json({ voted: true }, { status: 201 });
}
