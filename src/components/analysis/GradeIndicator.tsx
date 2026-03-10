"use client";

import type { ReactElement } from "react";
import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import { EagleIcon } from "@/components/ui/eagle-icons";

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
      aria-label={COPY.A11Y_GRADE(grade, config.eagleLabel)}
    >
      <div
        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <EagleIcon grade={grade} size={40} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: config.color }}>
            {config.eagleLabel}
          </span>
          <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-[#9DA0AE]">
            LV.{grade}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#676879]">
          두피 건강 점수 <span className="font-semibold text-[#323338]">{score.toFixed(1)}</span>점
        </p>
      </div>
    </div>
  );
}
