"use client";

import { useState, type ReactElement } from "react";
import { motion } from "framer-motion";
import { getGradeConfig } from "@/constants/gradeConfig";

interface DataPoint {
  date: string;
  score: number;
  grade: number;
  scanId: string;
}

interface ScoreChartProps {
  data: DataPoint[];
  onPointClick?: (scanId: string) => void;
}

const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 16, bottom: 32, left: 40 };

/** 등급별 배경 구간 */
const GRADE_ZONES = [
  { min: 80, max: 100, color: "#22C55E", opacity: 0.06 },
  { min: 60, max: 80, color: "#EAB308", opacity: 0.06 },
  { min: 40, max: 60, color: "#F97316", opacity: 0.06 },
  { min: 20, max: 40, color: "#EF4444", opacity: 0.06 },
  { min: 0, max: 20, color: "#A855F7", opacity: 0.06 },
] as const;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ScoreChart({
  data,
  onPointClick,
}: ScoreChartProps): ReactElement {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const innerWidth =
    CHART_PADDING.left + (data.length > 1 ? (data.length - 1) * 80 : 80);
  const svgWidth = innerWidth + CHART_PADDING.right;
  const svgHeight = CHART_HEIGHT + CHART_PADDING.top + CHART_PADDING.bottom;

  const plotWidth = innerWidth - CHART_PADDING.left;
  const plotHeight = CHART_HEIGHT;

  function xPos(i: number): number {
    if (data.length <= 1) return CHART_PADDING.left + plotWidth / 2;
    return CHART_PADDING.left + (i / (data.length - 1)) * plotWidth;
  }

  function yPos(score: number): number {
    const clamped = Math.max(0, Math.min(100, score));
    return CHART_PADDING.top + plotHeight - (clamped / 100) * plotHeight;
  }

  // 라인 path
  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(d.score)}`)
    .join(" ");

  // 그라데이션 영역 path (라인 아래 채우기)
  const areaPath = `${linePath} L ${xPos(data.length - 1)} ${yPos(0)} L ${xPos(0)} ${yPos(0)} Z`;

  // Y축 눈금
  const yTicks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[#323338]">점수 추이</h3>

      <div className="overflow-x-auto scrollbar-none">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="min-w-full"
          style={{ minWidth: svgWidth }}
        >
          {/* 등급별 배경 구간 */}
          {GRADE_ZONES.map((zone) => (
            <rect
              key={zone.min}
              x={CHART_PADDING.left}
              y={yPos(zone.max)}
              width={plotWidth}
              height={yPos(zone.min) - yPos(zone.max)}
              fill={zone.color}
              opacity={zone.opacity}
            />
          ))}

          {/* Y축 그리드 + 라벨 */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={CHART_PADDING.left}
                y1={yPos(tick)}
                x2={CHART_PADDING.left + plotWidth}
                y2={yPos(tick)}
                stroke="#F1F5F9"
                strokeWidth={1}
              />
              <text
                x={CHART_PADDING.left - 8}
                y={yPos(tick) + 4}
                textAnchor="end"
                className="fill-[#9DA0AE] text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* 그라데이션 영역 */}
          <defs>
            <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6161FF" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6161FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath}
            fill="url(#scoreAreaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* 라인 */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#6161FF"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* 데이터 포인트 */}
          {data.map((d, i) => {
            const config = getGradeConfig(d.grade);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.scanId}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onPointClick?.(d.scanId)}
                className="cursor-pointer"
              >
                {/* 히트 영역 (터치 대응) */}
                <circle
                  cx={xPos(i)}
                  cy={yPos(d.score)}
                  r={16}
                  fill="transparent"
                />

                {/* 외곽 링 */}
                <motion.circle
                  cx={xPos(i)}
                  cy={yPos(d.score)}
                  r={isHovered ? 8 : 5}
                  fill="white"
                  stroke={config.color}
                  strokeWidth={2.5}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                />

                {/* 내부 도트 */}
                <motion.circle
                  cx={xPos(i)}
                  cy={yPos(d.score)}
                  r={isHovered ? 4 : 2.5}
                  fill={config.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                />

                {/* 툴팁 */}
                {isHovered && (
                  <g>
                    <rect
                      x={xPos(i) - 36}
                      y={yPos(d.score) - 38}
                      width={72}
                      height={26}
                      rx={8}
                      fill="#323338"
                    />
                    <text
                      x={xPos(i)}
                      y={yPos(d.score) - 21}
                      textAnchor="middle"
                      className="fill-white text-[11px] font-semibold"
                    >
                      {d.score.toFixed(1)}점
                    </text>
                  </g>
                )}

                {/* X축 날짜 */}
                <text
                  x={xPos(i)}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="fill-[#9DA0AE] text-[10px]"
                >
                  {formatDate(d.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 범례 */}
      <div className="mt-3 flex flex-wrap gap-3">
        {GRADE_ZONES.map((zone) => (
          <div key={zone.min} className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: zone.color }}
            />
            <span className="text-[10px] text-[#9DA0AE]">
              {zone.min}-{zone.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { DataPoint };
