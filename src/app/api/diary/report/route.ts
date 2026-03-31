import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistCategory } from "@/types/diary";

interface DbEntry {
  id: string;
  date: string;
  scan_id: string | null;
  diary_checklists: { category: string; item: string; checked: boolean }[];
}

interface DbAnalysis {
  scan_id: string;
  norwood_grade: number;
  score: number;
  created_at: string;
}

/** Returns the current consecutive-day streak ending today (or yesterday). */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...new Set(dates)].sort((a, b) => (a > b ? -1 : 1));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  // Allow streak to start from today or yesterday
  const firstDate = new Date(sorted[0]);
  if (firstDate.getTime() < cursor.getTime() - 1000 * 60 * 60 * 24) {
    // Most recent entry is older than yesterday — no active streak
    return 0;
  }

  for (const dateStr of sorted) {
    const entryDate = new Date(dateStr);
    entryDate.setHours(0, 0, 0, 0);

    const diff = Math.round((cursor.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0 || diff === 1) {
      streak += 1;
      cursor = entryDate;
    } else {
      break;
    }
  }

  return streak;
}

/** GET /api/diary/report — premium report data */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Check premium status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("diary_premium_until")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("[GET /api/diary/report] profile fetch error:", profileError);
    return NextResponse.json({ error: "프로필을 불러올 수 없어요." }, { status: 500 });
  }

  const premiumUntil = profile?.diary_premium_until ? new Date(profile.diary_premium_until) : null;
  const isPremium = premiumUntil !== null && premiumUntil > new Date();

  if (!isPremium) {
    return NextResponse.json({ error: "프리미엄 구독이 필요해요." }, { status: 403 });
  }

  // Fetch all diary entries with checklists
  const { data: entries, error: entriesError } = await supabase
    .from("diary_entries")
    .select("id, date, scan_id, diary_checklists(category, item, checked)")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (entriesError) {
    console.error("[GET /api/diary/report] entries fetch error:", entriesError);
    return NextResponse.json({ error: "일기를 불러올 수 없어요." }, { status: 500 });
  }

  const typedEntries = (entries ?? []) as DbEntry[];

  // Collect scan_ids for entries that have them
  const scanIds = typedEntries
    .filter((e) => e.scan_id !== null)
    .map((e) => e.scan_id as string);

  // Fetch analyses for those scans
  let analyses: DbAnalysis[] = [];
  if (scanIds.length > 0) {
    const { data: analysisData, error: analysisError } = await supabase
      .from("analyses")
      .select("scan_id, norwood_grade, score, created_at")
      .in("scan_id", scanIds)
      .order("created_at", { ascending: true });

    if (analysisError) {
      console.error("[GET /api/diary/report] analyses fetch error:", analysisError);
      // Non-fatal: proceed without analysis data
    } else {
      analyses = (analysisData ?? []) as DbAnalysis[];
    }
  }

  // Build scan_id → entry date map
  const scanDateMap = new Map<string, string>();
  for (const entry of typedEntries) {
    if (entry.scan_id) {
      scanDateMap.set(entry.scan_id, entry.date);
    }
  }

  // scoreTrend: array of { date, score, grade }
  const scoreTrend = analyses
    .filter((a) => scanDateMap.has(a.scan_id))
    .map((a) => ({
      date: scanDateMap.get(a.scan_id) as string,
      score: a.score,
      grade: a.norwood_grade,
    }));

  // checklistStats: per-item aggregation
  const totalDays = typedEntries.length;
  const statsMap = new Map<
    string,
    { category: ChecklistCategory; item: string; checkedDays: number }
  >();

  for (const entry of typedEntries) {
    for (const cl of entry.diary_checklists) {
      const key = `${cl.category}:${cl.item}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          category: cl.category as ChecklistCategory,
          item: cl.item,
          checkedDays: 0,
        });
      }
      if (cl.checked) {
        statsMap.get(key)!.checkedDays += 1;
      }
    }
  }

  const checklistStats = Array.from(statsMap.values()).map((s) => ({
    category: s.category,
    item: s.item,
    totalDays,
    checkedDays: s.checkedDays,
    rate: totalDays > 0 ? Math.round((s.checkedDays / totalDays) * 100) : 0,
  }));

  // summary
  const scores = scoreTrend.map((t) => t.score);
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const dates = typedEntries.map((e) => e.date);
  const currentStreak = calculateStreak(dates);

  return NextResponse.json({
    scoreTrend,
    checklistStats,
    summary: {
      totalEntries: typedEntries.length,
      avgScore,
      bestScore,
      currentStreak,
    },
  });
}
