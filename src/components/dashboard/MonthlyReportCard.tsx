"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Flame,
  Camera,
} from "lucide-react";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";
import { fadeSlideUp } from "@/lib/motion";
import type { MonthlyReportData } from "@/types/report";

interface MonthlyReportCardProps {
  data: MonthlyReportData;
  reportMonth: string;
}

export default function MonthlyReportCard({
  data,
  reportMonth,
}: MonthlyReportCardProps): ReactElement {
  const lastTrend = data.scoreTrend[data.scoreTrend.length - 1];
  const latestGrade = lastTrend?.grade ?? 1;
  const gradeConfig = getGradeConfig(latestGrade);

  const monthLabel = reportMonth.replace(
    /^(\d{4})-(\d{2})$/,
    (_match: string, y: string, m: string): string => `${y}년 ${parseInt(m)}월`,
  );

  const gradeMessage = data.gradeChange
    ? data.gradeChange.to < data.gradeChange.from
      ? COPY.REPORT_GRADE_UP
      : COPY.REPORT_GRADE_DOWN
    : COPY.REPORT_GRADE_SAME;

  return (
    <motion.div
      variants={fadeSlideUp}
      className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border"
    >
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, ${gradeConfig.color}40, ${gradeConfig.color})`,
        }}
      />

      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            {monthLabel} {COPY.REPORT_BANNER_TITLE}
          </h3>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${gradeConfig.color}12` }}
          >
            <EagleIcon grade={latestGrade} size={28} />
          </div>
        </div>

        {/* Score trend chart */}
        {data.scoreTrend.length > 1 && (
          <div>
            <p className="mb-2 text-[11px] font-medium text-muted-foreground">
              점수 추이
            </p>
            <div className="flex items-end gap-1.5 rounded-xl bg-muted/50 p-3">
              {data.scoreTrend.map((point, idx) => {
                const barHeight = Math.max(12, (point.score / 100) * 48);
                const pointConfig = getGradeConfig(point.grade);
                return (
                  <div key={`${point.date}-${idx}`} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] font-medium text-muted-foreground">
                      {point.score}
                    </span>
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: pointConfig.color,
                        opacity: 0.6 + (idx / data.scoreTrend.length) * 0.4,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Grade change */}
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] font-medium text-muted-foreground">
              등급 변화
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {data.gradeChange ? (
                <>
                  <span
                    className="text-lg font-bold"
                    style={{
                      color: getGradeConfig(data.gradeChange.from).color,
                    }}
                  >
                    {data.gradeChange.from}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span
                    className="text-lg font-bold"
                    style={{
                      color: getGradeConfig(data.gradeChange.to).color,
                    }}
                  >
                    {data.gradeChange.to}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-foreground">
                  {gradeMessage}
                </span>
              )}
            </div>
          </div>

          {/* Improvement */}
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] font-medium text-muted-foreground">
              점수 변화
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {data.improvement > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : data.improvement < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {COPY.REPORT_IMPROVEMENT(data.improvement)}
              </span>
            </div>
          </div>

          {/* Total scans */}
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] font-medium text-muted-foreground">
              분석 횟수
            </p>
            <p className="mt-1.5 text-lg font-bold text-foreground">
              {data.totalScans}
              <span className="ml-0.5 text-xs font-medium text-muted-foreground">
                회
              </span>
            </p>
          </div>

          {/* Streak */}
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] font-medium text-muted-foreground">
              연속 기록
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-foreground">
                {COPY.REPORT_STREAK(
                  data.streakStats.current,
                  data.streakStats.best,
                )}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/scan"
          className="flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Camera className="h-4 w-4" />
          {COPY.REPORT_CTA_SCAN}
        </Link>
      </div>
    </motion.div>
  );
}
