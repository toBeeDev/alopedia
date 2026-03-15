import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getExpForNextLevel } from "@/lib/utils/level";

/** EXP rewards */
const BASE_DAILY_EXP = 5;
const MAX_LEVEL = 99;

function getStreakBonus(streak: number): number {
  if (streak >= 30) return 3;
  if (streak >= 7) return 2;
  return 1;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(target: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(target, yesterday);
}

/** POST /api/profile/check-in — 출석 체크 + EXP 지급 */
export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("level, exp, streak_current, streak_best, last_check_in")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "프로필을 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const now = new Date();
  const lastCheckIn = profile.last_check_in
    ? new Date(profile.last_check_in)
    : null;

  // Already checked in today
  if (lastCheckIn && isSameDay(lastCheckIn, now)) {
    return NextResponse.json({
      checkedIn: false,
      message: "오늘은 이미 출석했어요.",
      streak: profile.streak_current,
      level: profile.level,
      exp: profile.exp,
    });
  }

  // Calculate new streak
  let newStreak: number;
  if (lastCheckIn && isYesterday(lastCheckIn, now)) {
    newStreak = profile.streak_current + 1;
  } else {
    newStreak = 1;
  }

  const newBest = Math.max(newStreak, profile.streak_best);

  // Calculate EXP reward
  const bonus = getStreakBonus(newStreak);
  const earnedExp = BASE_DAILY_EXP + bonus;

  // Level up calculation
  let level = profile.level;
  let exp = profile.exp + earnedExp;

  while (level < MAX_LEVEL) {
    const needed = getExpForNextLevel(level);
    if (exp >= needed) {
      exp -= needed;
      level += 1;
    } else {
      break;
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      streak_current: newStreak,
      streak_best: newBest,
      level,
      exp,
      last_check_in: now.toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "출석 처리에 실패했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    checkedIn: true,
    earnedExp,
    streak: newStreak,
    streakBonus: bonus,
    level,
    exp,
    leveledUp: level > profile.level,
  });
}
