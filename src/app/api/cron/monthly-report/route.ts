import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { computeReport } from "@/lib/report/computeReport";
import type { MonthlyReportData } from "@/types/report";

interface AnalysisScanRow {
  scan_id: string;
  score: number;
  norwood_grade: number;
  created_at: string;
  scans: { user_id: string; status: string };
}

interface ProfileRow {
  streak_current: number;
  streak_best: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Calculate previous month range
  const now = new Date();
  const year =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth(); // 1-indexed
  const reportMonth = `${year}-${String(month).padStart(2, "0")}`;
  const monthStart = new Date(year, month - 1, 1).toISOString();
  const monthEnd = new Date(year, month, 1).toISOString();

  // Find users with completed scans in the month
  const { data: rawScans, error: scanError } = await supabase
    .from("analyses")
    .select(
      "scan_id, score, norwood_grade, created_at, scans!inner(user_id, status)",
    )
    .eq("scans.status", "completed")
    .gte("created_at", monthStart)
    .lt("created_at", monthEnd);

  if (scanError) {
    console.error("[cron/monthly-report] Scan query error:", scanError);
    return NextResponse.json(
      { error: "Failed to query scans" },
      { status: 500 },
    );
  }

  const eligibleScans = (rawScans ?? []) as unknown as AnalysisScanRow[];

  // Group by user
  const userScans = new Map<
    string,
    { score: number; norwood_grade: number; created_at: string }[]
  >();
  for (const scan of eligibleScans) {
    const userId = scan.scans.user_id;
    if (!userScans.has(userId)) userScans.set(userId, []);
    userScans.get(userId)!.push({
      score: Number(scan.score),
      norwood_grade: scan.norwood_grade,
      created_at: scan.created_at,
    });
  }

  // Filter users with >= 2 scans
  const eligibleUsers = [...userScans.entries()].filter(
    ([, scans]) => scans.length >= 2,
  );

  let created = 0;
  let skipped = 0;

  for (const [userId, scans] of eligibleUsers) {
    // Check if report already exists
    const { data: existing } = await supabase
      .from("monthly_reports")
      .select("id")
      .eq("user_id", userId)
      .eq("report_month", reportMonth)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Get profile for streak data
    const { data: rawProfile } = await supabase
      .from("profiles")
      .select("streak_current, streak_best")
      .eq("id", userId)
      .single();

    const profile = rawProfile as unknown as ProfileRow | null;
    const reportData: MonthlyReportData = computeReport(scans, profile);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- monthly_reports not in generated DB types yet
    const { error: insertError } = await (supabase as any)
      .from("monthly_reports")
      .insert({
        user_id: userId,
        report_month: reportMonth,
        data: reportData,
        is_read: false,
      });

    if (insertError) {
      console.error(
        `[cron/monthly-report] Insert error for ${userId}:`,
        insertError,
      );
    } else {
      created++;
    }
  }

  return NextResponse.json({
    reportMonth,
    eligible: eligibleUsers.length,
    created,
    skipped,
  });
}
