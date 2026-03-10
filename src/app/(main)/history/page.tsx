"use client";

import { type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { useScanHistory } from "@/hooks/useScanHistory";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

export default function HistoryPage(): ReactElement {
  const { data: scans, isLoading, error } = useScanHistory();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PageContainer className="py-6">
        <h1 className="mb-6 text-lg font-bold text-[#323338] md:text-xl">
          기록
        </h1>

        {/* 로딩 */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        )}

        {/* 에러 */}
        {error && (
          <p className="text-center text-sm text-red-500">
            {COPY.ERROR_NETWORK}
          </p>
        )}

        {/* 빈 상태 */}
        {scans && scans.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-[#676879]">{COPY.EMPTY_HISTORY}</p>
            <Link
              href="/scan"
              className="mt-4 inline-block rounded-full bg-[#6161FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4338ca]"
            >
              {COPY.HERO_CTA}
            </Link>
          </div>
        )}

        {/* 스캔 목록 */}
        {scans && scans.length > 0 && (
          <motion.div
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {scans.map((scan) => {
              const analysis = scan.analyses?.[0];
              const grade = analysis?.norwood_grade;
              const gradeConfig = grade ? getGradeConfig(grade) : null;
              const thumbnail = scan.images?.[0]?.thumbnailUrl;

              return (
                <motion.div key={scan.id} variants={fadeSlideUp}>
                  <Link
                    href={`/history/${scan.id}`}
                    className="flex items-center gap-4 rounded-2xl bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    {/* 썸네일 */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#F5F5F7]">
                      {thumbnail && (
                        <Image
                          src={thumbnail}
                          alt={COPY.A11Y_SCALP_PHOTO}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {gradeConfig && grade && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2.5 text-[11px] font-bold text-white"
                            style={{ backgroundColor: gradeConfig.color }}
                          >
                            <EagleIcon grade={grade} size={18} /> {gradeConfig.eagleLabel}
                          </span>
                        )}
                        {analysis && (
                          <span className="text-sm font-medium text-[#323338]">
                            {analysis.score.toFixed(1)}점
                          </span>
                        )}
                        {scan.status === "analyzing" && (
                          <span className="text-xs text-[#6161FF]">
                            분석 중...
                          </span>
                        )}
                        {scan.status === "failed" && (
                          <span className="text-xs text-red-500">분석 실패</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#9DA0AE]">
                        {new Date(scan.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-[#9DA0AE]" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </PageContainer>

    </div>
  );
}
