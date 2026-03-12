"use client";

import { type ReactElement, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Camera,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Scan,
} from "lucide-react";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { useScanHistory, type ScanWithAnalysis } from "@/hooks/useScanHistory";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import ScoreChart, { type DataPoint } from "@/components/analysis/ScoreChart";

function getTrendBetween(
  current: number,
  previous: number,
): { icon: ReactElement; label: string; color: string } {
  const diff = current - previous;
  if (diff > 2)
    return {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: `+${diff.toFixed(1)}`,
      color: "text-emerald-500",
    };
  if (diff < -2)
    return {
      icon: <TrendingDown className="h-3.5 w-3.5" />,
      label: diff.toFixed(1),
      color: "text-red-500",
    };
  return {
    icon: <Minus className="h-3.5 w-3.5" />,
    label: "유지",
    color: "text-[#9DA0AE]",
  };
}

function SummaryStats({
  scans,
}: {
  scans: ScanWithAnalysis[];
}): ReactElement {
  const completed = scans.filter((s) => s.analyses?.length > 0);
  const totalCount = completed.length;

  const latestAnalysis = completed[0]?.analyses?.[0];
  const latestGrade = latestAnalysis?.norwood_grade;
  const latestScore = latestAnalysis ? Number(latestAnalysis.score) : null;
  const latestConfig = latestGrade ? getGradeConfig(latestGrade) : null;

  // 평균 점수
  const avgScore =
    totalCount > 0
      ? completed.reduce((sum, s) => sum + Number(s.analyses[0]?.score ?? 0), 0) /
        totalCount
      : 0;

  // 최고 점수
  const bestScore =
    totalCount > 0
      ? Math.max(...completed.map((s) => Number(s.analyses[0]?.score ?? 0)))
      : 0;

  return (
    <div className="mb-6 space-y-4">
      {/* 최근 상태 카드 */}
      {latestConfig && latestScore !== null && latestGrade && (
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: `${latestConfig.color}08` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${latestConfig.color}15` }}
            >
              <EagleIcon grade={latestGrade} size={36} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#9DA0AE]">최근 분석 상태</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span
                  className="text-lg font-bold"
                  style={{ color: latestConfig.color }}
                >
                  {latestConfig.eagleLabel}
                </span>
                <span className="text-sm font-medium text-[#323338]">
                  {latestScore.toFixed(1)}점
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#676879]">
                {latestConfig.action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 통계 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3.5 shadow-sm">
          <div className="mb-1.5 inline-flex rounded-lg bg-blue-50 p-1.5">
            <Scan className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-[#323338]">{totalCount}</p>
          <p className="text-[11px] text-[#9DA0AE]">총 분석</p>
        </div>
        <div className="rounded-xl bg-white p-3.5 shadow-sm">
          <div className="mb-1.5 inline-flex rounded-lg bg-emerald-50 p-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-[#323338]">
            {bestScore > 0 ? bestScore.toFixed(0) : "-"}
          </p>
          <p className="text-[11px] text-[#9DA0AE]">최고 점수</p>
        </div>
        <div className="rounded-xl bg-white p-3.5 shadow-sm">
          <div className="mb-1.5 inline-flex rounded-lg bg-amber-50 p-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-[#323338]">
            {avgScore > 0 ? avgScore.toFixed(0) : "-"}
          </p>
          <p className="text-[11px] text-[#9DA0AE]">평균 점수</p>
        </div>
      </div>
    </div>
  );
}

function buildChartData(scans: ScanWithAnalysis[]): DataPoint[] {
  return scans
    .filter((s) => s.analyses?.length > 0)
    .map((s) => ({
      date: s.created_at,
      score: Number(s.analyses[0].score),
      grade: s.analyses[0].norwood_grade,
      scanId: s.id,
    }))
    .reverse(); // 오래된 순으로 정렬
}

export default function HistoryPage(): ReactElement {
  const { data: scans, isLoading, error } = useScanHistory();
  const router = useRouter();
  const chartData = useMemo(
    () => (scans ? buildChartData(scans) : []),
    [scans],
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PageContainer className="py-6">
        <h1 className="mb-6 text-lg font-bold text-[#323338] md:text-xl">
          {COPY.PAGE_TITLE_HISTORY}
        </h1>

        {/* 로딩 */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-white" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-white"
                />
              ))}
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="rounded-2xl bg-red-50 px-5 py-8 text-center">
            <p className="text-sm text-red-500">{COPY.ERROR_NETWORK}</p>
          </div>
        )}

        {/* 빈 상태 */}
        {scans && scans.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6161FF]/10">
              <Camera className="h-8 w-8 text-[#6161FF]" />
            </div>
            <h3 className="text-base font-bold text-[#323338]">
              아직 기록이 없어요
            </h3>
            <p className="mt-1 text-sm text-[#676879]">
              첫 번째 두피 분석을 시작해볼까요?
            </p>
            <Link
              href="/scan"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#6161FF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4F4FD9]"
            >
              <Camera className="h-4 w-4" />
              촬영 시작하기
            </Link>
          </div>
        )}

        {/* 스캔 목록 */}
        {scans && scans.length > 0 && (
          <>
            <SummaryStats scans={scans} />

            {/* 점수 추이 차트 (2개 이상일 때) */}
            {chartData.length >= 2 && (
              <div className="mb-6">
                <ScoreChart
                  data={chartData}
                  onPointClick={(scanId) => router.push(`/history/${scanId}`)}
                />
              </div>
            )}

            <h2 className="mb-3 text-sm font-semibold text-[#676879]">
              분석 기록
            </h2>

            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {scans.map((scan, idx) => {
                const analysis = scan.analyses?.[0];
                const grade = analysis?.norwood_grade;
                const gradeConfig = grade ? getGradeConfig(grade) : null;
                const score = analysis ? Number(analysis.score) : null;
                const thumbnail = scan.images?.[0]?.thumbnailUrl;

                // 이전 기록과 비교
                const prevAnalysis = scans[idx + 1]?.analyses?.[0];
                const prevScore = prevAnalysis
                  ? Number(prevAnalysis.score)
                  : null;
                const trend =
                  score !== null && prevScore !== null
                    ? getTrendBetween(score, prevScore)
                    : null;

                const dateStr = new Date(scan.created_at).toLocaleDateString(
                  "ko-KR",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  },
                );

                return (
                  <motion.div key={scan.id} variants={fadeSlideUp}>
                    <Link
                      href={`/history/${scan.id}`}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* 썸네일 */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F7]">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={COPY.A11Y_SCALP_PHOTO}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Camera className="h-6 w-6 text-[#9DA0AE]" />
                          </div>
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {gradeConfig && grade && (
                            <span
                              className="inline-flex shrink-0 items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2.5 text-[11px] font-bold text-white"
                              style={{
                                backgroundColor: gradeConfig.color,
                              }}
                            >
                              <EagleIcon grade={grade} size={18} />
                              {gradeConfig.eagleLabel}
                            </span>
                          )}
                          {score !== null && (
                            <span className="text-base font-bold text-[#323338]">
                              {score.toFixed(1)}점
                            </span>
                          )}
                          {trend && (
                            <span
                              className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend.color}`}
                            >
                              {trend.icon}
                              {trend.label}
                            </span>
                          )}
                        </div>

                        {/* 점수 바 */}
                        {score !== null && (
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${score}%`,
                                backgroundColor:
                                  gradeConfig?.color ?? "#6161FF",
                              }}
                            />
                          </div>
                        )}

                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs text-[#9DA0AE]">
                            {dateStr}
                          </span>
                          {scan.status === "analyzing" && (
                            <span className="text-xs font-medium text-[#6161FF]">
                              분석 중...
                            </span>
                          )}
                          {scan.status === "failed" && (
                            <span className="text-xs font-medium text-red-500">
                              분석 실패
                            </span>
                          )}
                          {scan.images && scan.images.length > 0 && (
                            <span className="text-[10px] text-[#9DA0AE]">
                              사진 {scan.images.length}장
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 shrink-0 text-[#D1D5DB] transition-colors group-hover:text-[#6161FF]" />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </PageContainer>
    </div>
  );
}
