import type { MonthlyReportData } from "@/types/report";

interface ScanRecord {
  score: number;
  norwood_grade: number;
  created_at: string;
}

interface ProfileRecord {
  streak_current: number;
  streak_best: number;
}

export function computeReport(
  scans: ScanRecord[],
  profile: ProfileRecord | null,
): MonthlyReportData {
  const sorted = [...scans].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const scoreTrend = sorted.map((s) => ({
    date: s.created_at,
    score: Number(s.score),
    grade: s.norwood_grade,
  }));

  const totalScans = sorted.length;
  const scores = sorted.map((s) => Number(s.score));
  const averageScore =
    totalScans > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / totalScans) * 10) / 10
      : 0;

  const firstGrade = sorted[0]?.norwood_grade ?? 0;
  const lastGrade = sorted[sorted.length - 1]?.norwood_grade ?? 0;
  const gradeChange =
    firstGrade !== lastGrade ? { from: firstGrade, to: lastGrade } : null;

  const firstScore = scores[0] ?? 0;
  const lastScore = scores[scores.length - 1] ?? 0;
  const improvement = Math.round((lastScore - firstScore) * 10) / 10;

  const streakStats = {
    current: profile?.streak_current ?? 0,
    best: profile?.streak_best ?? 0,
  };

  return {
    scoreTrend,
    gradeChange,
    streakStats,
    totalScans,
    averageScore,
    improvement,
  };
}
