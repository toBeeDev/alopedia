"use client";

import { useState, useEffect, type ReactElement } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Ruler,
  Layers,
  CircleDot,
  ShieldCheck,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import GradeIndicator from "@/components/analysis/GradeIndicator";
import HospitalPopup from "@/components/analysis/HospitalPopup";
import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail, ScanImage } from "@/types/database";

interface ResultCardProps {
  grade: number;
  score: number;
  details: AnalysisDetail;
  createdAt: string;
  images?: ScanImage[];
}

const DETAIL_CONFIG: Record<
  keyof AnalysisDetail,
  { label: string; icon: typeof Ruler; color: string; bgColor: string }
> = {
  hairline: {
    label: "헤어라인",
    icon: Ruler,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  density: {
    label: "모발 밀도",
    icon: Layers,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  thickness: {
    label: "모발 굵기",
    icon: CircleDot,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  scalpCondition: {
    label: "두피 상태",
    icon: ShieldCheck,
    color: "text-violet-500",
    bgColor: "bg-violet-50",
  },
  advice: {
    label: "조언",
    icon: Lightbulb,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
  },
};

const SCAN_TYPE_LABELS: Record<string, string> = {
  top: "정수리",
  front: "전면이마",
  side: "측면이마",
};

function ScoreRing({ score, color }: { score: number; color: string }): ReactElement {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="10"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-[#1E293B]">
          {score.toFixed(0)}
        </span>
        <span className="text-xs text-[#94A3B8]">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  icon: typeof Ruler;
  color: string;
  bgColor: string;
}): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-md ${bgColor}`}
      >
        <Icon className={`h-3.5 w-3.5 ${color}`} strokeWidth={2} />
      </div>
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
    </div>
  );
}

function getTrendIcon(score: number): ReactElement {
  if (score >= 60)
    return <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={2} />;
  if (score >= 40)
    return <Minus className="h-4 w-4 text-amber-500" strokeWidth={2} />;
  return <TrendingDown className="h-4 w-4 text-red-500" strokeWidth={2} />;
}

function getTrendLabel(score: number): string {
  if (score >= 80) return "매우 건강";
  if (score >= 60) return "양호";
  if (score >= 40) return "주의 필요";
  if (score >= 20) return "관리 필요";
  return "전문 상담 필요";
}

export default function ResultCard({
  grade,
  score,
  details,
  createdAt,
  images,
}: ResultCardProps): ReactElement {
  const config = getGradeConfig(grade);
  const [showHospitalPopup, setShowHospitalPopup] = useState(false);

  useEffect(() => {
    if (config.showHospitalPopup) {
      const timer = setTimeout(() => setShowHospitalPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, [config.showHospitalPopup]);

  const dateStr = new Date(createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ── Desktop: 2-column / Mobile: single column ── */}
        <div className="flex flex-col gap-6 xl:flex-row">
          {/* ── Left Column: Score + Images ── */}
          <div className="flex flex-col gap-4 xl:w-[400px] xl:flex-shrink-0">
            {/* Score Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <GradeIndicator grade={grade} score={score} />

              <div className="mt-5 flex items-center justify-center">
                <ScoreRing score={score} color={config.color} />
              </div>

              {/* Score breakdown */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3">
                <div className="flex items-center gap-2">
                  {getTrendIcon(score)}
                  <span className="text-sm font-medium text-[#334155]">
                    {getTrendLabel(score)}
                  </span>
                </div>
                <span className="text-xs text-[#94A3B8]">{dateStr}</span>
              </div>

              {/* Grade scale mini */}
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-[10px] text-[#94A3B8]">
                  <span>정상</span>
                  <span>전문 상담</span>
                </div>
                <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <div
                      key={g}
                      className="flex-1 transition-opacity"
                      style={{
                        backgroundColor: getGradeConfig(g).color,
                        opacity: g === grade ? 1 : 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Uploaded Images */}
            {images && images.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[#334155]">
                  촬영 사진
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div key={img.url} className="relative">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F1F5F9]">
                        <Image
                          src={img.thumbnailUrl}
                          alt={SCAN_TYPE_LABELS[img.type] ?? img.type}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <p className="mt-1 text-center text-[10px] text-[#94A3B8]">
                        {SCAN_TYPE_LABELS[img.type] ?? img.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer - desktop only, inside left column */}
            <div className="hidden rounded-xl border border-[#EEEFF2] bg-[#FAFAFA] px-4 py-3 text-center xl:block">
              <p className="text-xs font-medium text-[#9DA0AE]">
                {COPY.DISCLAIMER_SHORT}
              </p>
            </div>
          </div>

          {/* ── Right Column: Analysis Details ── */}
          <div className="flex-1 space-y-4">
            {/* Headline */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1E293B]">
                {COPY.GRADE_HEADLINE[grade] ?? "분석 완료"}
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                {COPY.GRADE_DESCRIPTION[grade] ?? ""}
              </p>

              {/* Category icons row */}
              <div className="mt-4 flex flex-wrap gap-3">
                {(Object.keys(DETAIL_CONFIG) as (keyof AnalysisDetail)[]).map(
                  (key) => (
                    <ScoreBar key={key} {...DETAIL_CONFIG[key]} />
                  ),
                )}
              </div>
            </div>

            {/* Detail cards */}
            {(Object.keys(DETAIL_CONFIG) as (keyof AnalysisDetail)[]).map(
              (key) => {
                const { label, icon: Icon, color, bgColor } =
                  DETAIL_CONFIG[key];
                return (
                  <motion.div
                    key={key}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * Object.keys(DETAIL_CONFIG).indexOf(key) }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${color}`}
                          strokeWidth={1.8}
                        />
                      </div>
                      <h3 className="text-base font-semibold text-[#1E293B]">
                        {label}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#64748B]">
                      {details[key]}
                    </p>
                  </motion.div>
                );
              },
            )}

            {/* Disclaimer - mobile only */}
            <div className="rounded-xl border border-[#EEEFF2] bg-[#FAFAFA] px-4 py-3 text-center xl:hidden">
              <p className="text-xs font-medium text-[#9DA0AE]">
                {COPY.DISCLAIMER_SHORT}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <HospitalPopup
        isOpen={showHospitalPopup}
        onClose={() => setShowHospitalPopup(false)}
      />
    </>
  );
}
