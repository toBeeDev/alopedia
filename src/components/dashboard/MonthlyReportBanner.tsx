"use client";

import { type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMonthlyReport, useMarkReportRead } from "@/hooks/useMonthlyReport";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";
import { fadeSlideUp } from "@/lib/motion";

export default function MonthlyReportBanner(): ReactElement | null {
  const { data: report } = useMonthlyReport();
  const markRead = useMarkReportRead();

  if (!report || report.is_read) return null;

  const { data } = report;
  const lastTrend = data.scoreTrend[data.scoreTrend.length - 1];
  const latestGrade = lastTrend?.grade ?? 1;
  const gradeConfig = getGradeConfig(latestGrade);

  const monthLabel = report.report_month.replace(
    /^(\d{4})-(\d{2})$/,
    (_match: string, y: string, m: string): string => `${y}년 ${parseInt(m)}월`,
  );

  const gradeMessage = data.gradeChange
    ? data.gradeChange.to < data.gradeChange.from
      ? COPY.REPORT_GRADE_UP
      : COPY.REPORT_GRADE_DOWN
    : COPY.REPORT_GRADE_SAME;

  const improvementIcon =
    data.improvement > 0 ? (
      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
    ) : data.improvement < 0 ? (
      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
    );

  function handleDismiss(): void {
    if (report) {
      markRead.mutate(report.id);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={fadeSlideUp}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-border"
        style={{
          background: `linear-gradient(135deg, ${gradeConfig.color}08, ${gradeConfig.color}18)`,
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${gradeConfig.color}60, ${gradeConfig.color})`,
          }}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${gradeConfig.color}15` }}
              >
                <EagleIcon grade={latestGrade} size={28} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  {monthLabel}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {COPY.REPORT_BANNER_TITLE}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-muted hover:text-muted-foreground"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex items-center gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${gradeConfig.color}12` }}
            >
              <EagleIcon grade={latestGrade} size={36} />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5">
                {improvementIcon}
                <span className="text-xs font-semibold text-foreground">
                  {COPY.REPORT_IMPROVEMENT(data.improvement)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {gradeMessage}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>{COPY.REPORT_SCANS(data.totalScans)}</span>
                <span className="text-muted-foreground/30">|</span>
                <span>
                  {COPY.REPORT_STREAK(
                    data.streakStats.current,
                    data.streakStats.best,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Mini score trend bars */}
          {data.scoreTrend.length > 1 && (
            <div className="mt-4 flex items-end gap-1">
              {data.scoreTrend.map((point, idx) => {
                const barHeight = Math.max(
                  8,
                  (point.score / 100) * 32,
                );
                const pointConfig = getGradeConfig(point.grade);
                return (
                  <div
                    key={`${point.date}-${idx}`}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: pointConfig.color,
                      opacity: 0.6 + (idx / data.scoreTrend.length) * 0.4,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
