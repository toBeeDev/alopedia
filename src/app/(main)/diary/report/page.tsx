"use client";

import { motion, type Variants } from "framer-motion";
import { TrendingUp, BarChart3, Calendar } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PremiumGate from "@/components/diary/PremiumGate";
import { COPY } from "@/constants/copy";
import { useDiaryReport } from "@/hooks/useDiaryReport";
import { CHECKLIST_ITEMS } from "@/types/diary";
import { getGradeConfig } from "@/constants/gradeConfig";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" },
  }),
};

/** Flat lookup: item key → label */
const CHECKLIST_LABEL_MAP: Record<string, string> = Object.values(CHECKLIST_ITEMS).reduce(
  (acc, items) => {
    for (const item of items) {
      acc[item.key] = item.label;
    }
    return acc;
  },
  {} as Record<string, string>,
);

export default function DiaryReportPage() {
  const { data, isLoading, error } = useDiaryReport();

  const isPremiumError = error?.message === "PREMIUM_REQUIRED";

  const reportContent = (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeInUp}
        className="pt-6"
      >
        <h1 className="text-xl font-bold tracking-tight">{COPY.DIARY_REPORT_TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">나의 두피 관리 여정을 한눈에</p>
      </motion.div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && !isPremiumError && error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <motion.section
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeInUp}
            aria-label="요약"
          >
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                요약
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card border border-border px-4 py-4">
                <p className="text-xs text-muted-foreground">총 기록일</p>
                <p className="mt-1 text-2xl font-bold">{data.summary.totalEntries}</p>
                <p className="text-xs text-muted-foreground">일</p>
              </div>
              <div className="rounded-xl bg-card border border-border px-4 py-4">
                <p className="text-xs text-muted-foreground">평균 점수</p>
                <p className="mt-1 text-2xl font-bold">{data.summary.avgScore}</p>
                <p className="text-xs text-muted-foreground">점</p>
              </div>
              <div className="rounded-xl bg-card border border-border px-4 py-4">
                <p className="text-xs text-muted-foreground">최고 점수</p>
                <p className="mt-1 text-2xl font-bold">{data.summary.bestScore}</p>
                <p className="text-xs text-muted-foreground">점</p>
              </div>
              <div className="rounded-xl bg-card border border-border px-4 py-4">
                <p className="text-xs text-muted-foreground">연속 기록</p>
                <p className="mt-1 text-2xl font-bold">{data.summary.currentStreak}</p>
                <p className="text-xs text-muted-foreground">일 streak</p>
              </div>
            </div>
          </motion.section>

          {/* Score trend */}
          <motion.section
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeInUp}
            aria-label={COPY.DIARY_REPORT_SCORE_TREND}
          >
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {COPY.DIARY_REPORT_SCORE_TREND}
              </h2>
            </div>
            <div className="rounded-xl bg-card border border-border p-4">
              {data.scoreTrend.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  AI 분석 기록이 없어요
                </p>
              ) : (
                <div className="flex items-end gap-1.5 h-32 overflow-x-auto">
                  {data.scoreTrend.map((point, i) => {
                    const gradeConfig = getGradeConfig(point.grade);
                    const heightPct = Math.max(4, point.score);
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1 flex-shrink-0"
                        title={`${point.date}: ${point.score}점 (${gradeConfig.label})`}
                      >
                        <div
                          className="w-5 rounded-t-sm transition-all"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: gradeConfig.color,
                            minHeight: "4px",
                          }}
                        />
                        <span className="text-[9px] text-muted-foreground rotate-[-45deg] origin-top-left">
                          {point.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.section>

          {/* Checklist stats */}
          <motion.section
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeInUp}
            aria-label={COPY.DIARY_REPORT_CHECKLIST_STATS}
          >
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {COPY.DIARY_REPORT_CHECKLIST_STATS}
              </h2>
            </div>
            <div className="rounded-xl bg-card border border-border divide-y divide-border">
              {data.checklistStats.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  체크리스트 기록이 없어요
                </p>
              ) : (
                data.checklistStats.map((stat, i) => {
                  const label = CHECKLIST_LABEL_MAP[stat.item] ?? stat.item;
                  return (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {stat.rate}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${stat.rate}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.checkedDays} / {stat.totalDays}일
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.section>
        </>
      )}
    </div>
  );

  return (
    <PageContainer>
      <PremiumGate>{reportContent}</PremiumGate>
    </PageContainer>
  );
}
