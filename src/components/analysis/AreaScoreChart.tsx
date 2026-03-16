"use client";

import { type ReactElement } from "react";
import { motion } from "framer-motion";
import type { AreaScores } from "@/types/database";

interface AreaScoreChartProps {
  areaScores: AreaScores;
}

const AREA_CONFIG: { key: keyof AreaScores; label: string }[] = [
  { key: "crown", label: "정수리" },
  { key: "hairline", label: "헤어라인" },
  { key: "density", label: "모발 밀도" },
];

function getScoreColor(score: number): string {
  if (score >= 85) return "#22C55E";
  if (score >= 68) return "#EAB308";
  if (score >= 45) return "#F97316";
  if (score >= 25) return "#EF4444";
  return "#A855F7";
}

export default function AreaScoreChart({
  areaScores,
}: AreaScoreChartProps): ReactElement {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[#334155]">
        부위별 점수
      </h3>
      <div className="space-y-3">
        {AREA_CONFIG.map(({ key, label }, idx) => {
          const score = areaScores[key];
          const color = getScoreColor(score);
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B]">
                  {label}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color }}
                >
                  {score}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#F1F5F9]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                    delay: 0.2 + idx * 0.1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
