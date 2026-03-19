export interface MonthlyReportData {
  scoreTrend: { date: string; score: number; grade: number }[];
  gradeChange: { from: number; to: number } | null;
  streakStats: { current: number; best: number };
  totalScans: number;
  averageScore: number;
  improvement: number;
}

export interface DbMonthlyReport {
  id: string;
  user_id: string;
  report_month: string;
  data: MonthlyReportData;
  is_read: boolean;
  created_at: string;
}
