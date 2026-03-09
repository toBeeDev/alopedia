"use client";

import type { ReactElement } from "react";
import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";

interface GradeIndicatorProps {
  grade: number;
  score: number;
}

export default function GradeIndicator({
  grade,
  score,
}: GradeIndicatorProps): ReactElement {
  const config = getGradeConfig(grade);

  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-5"
      style={{ backgroundColor: `${config.color}10` }}
      aria-label={COPY.A11Y_GRADE(grade, config.label)}
    >
      {/* 등급 원형 */}
      <div
        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
        style={{ backgroundColor: config.color }}
      >
        {grade}
      </div>

      {/* 등급 정보 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#676879]">
          두피 건강 점수 <span className="font-semibold text-[#323338]">{score.toFixed(1)}</span>점
        </p>
      </div>
    </div>
  );
}
