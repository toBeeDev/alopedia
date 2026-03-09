"use client";

import { useState, useEffect, type ReactElement } from "react";
import { motion } from "framer-motion";
import GradeIndicator from "@/components/analysis/GradeIndicator";
import HospitalPopup from "@/components/analysis/HospitalPopup";
import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail } from "@/types/database";

interface ResultCardProps {
  grade: number;
  score: number;
  details: AnalysisDetail;
  createdAt: string;
}

const DETAIL_LABELS: Record<keyof AnalysisDetail, string> = {
  hairline: "헤어라인",
  density: "모발 밀도",
  thickness: "모발 굵기",
  scalpCondition: "두피 상태",
  advice: "조언",
};

export default function ResultCard({
  grade,
  score,
  details,
  createdAt,
}: ResultCardProps): ReactElement {
  const config = getGradeConfig(grade);
  const [showHospitalPopup, setShowHospitalPopup] = useState(false);

  // Grade 4-5는 자동으로 병원 권유 팝업 표시
  useEffect(() => {
    if (config.showHospitalPopup) {
      const timer = setTimeout(() => setShowHospitalPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, [config.showHospitalPopup]);

  return (
    <>
      <motion.div
        className="mx-auto max-w-lg space-y-6 rounded-3xl bg-white p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 등급 + 점수 */}
        <GradeIndicator grade={grade} score={score} />

        {/* 헤드라인 */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#323338]">
            {COPY.GRADE_HEADLINE[grade] ?? "분석 완료"}
          </h2>
          <p className="mt-1 text-sm text-[#676879]">
            {COPY.GRADE_DESCRIPTION[grade] ?? ""}
          </p>
        </div>

        {/* 상세 분석 */}
        <div className="space-y-4">
          {(Object.keys(DETAIL_LABELS) as (keyof AnalysisDetail)[]).map(
            (key) => (
              <div key={key} className="rounded-xl bg-[#F5F5F7] p-4">
                <h3 className="mb-1 text-sm font-semibold text-[#323338]">
                  {DETAIL_LABELS[key]}
                </h3>
                <p className="text-sm leading-relaxed text-[#676879]">
                  {details[key]}
                </p>
              </div>
            ),
          )}
        </div>

        {/* 분석 날짜 */}
        <p className="text-center text-xs text-[#9DA0AE]">
          {new Date(createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          분석
        </p>

        {/* 면책 고지 (CRITICAL — 항상 표시) */}
        <div className="rounded-xl border border-[#EEEFF2] bg-[#FAFAFA] px-4 py-3 text-center">
          <p className="text-xs font-medium text-[#9DA0AE]">
            {COPY.DISCLAIMER_SHORT}
          </p>
        </div>
      </motion.div>

      {/* 병원 권유 팝업 (Grade 4-5) */}
      <HospitalPopup
        isOpen={showHospitalPopup}
        onClose={() => setShowHospitalPopup(false)}
      />
    </>
  );
}
