"use client";

import { type ReactElement } from "react";
import {
  Camera,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ScanLine,
  ImageOff,
  Sun,
  Scissors,
  Eye,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { COPY } from "@/constants/copy";
import { GRADE_CONFIG, type GradeLevel } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { CrownAreaIcon, FrontAreaIcon, SideAreaIcon } from "@/components/ui/scan-area-icons";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

/** Detail analysis items */
const DETAIL_ITEMS = [
  {
    key: "hairline",
    label: "헤어라인",
    icon: Eye,
    desc: "전두부 헤어라인의 후퇴 정도와 형태를 분석합니다.",
  },
  {
    key: "density",
    label: "모발 밀도",
    icon: ScanLine,
    desc: "단위 면적당 모발의 수와 분포 균일도를 측정합니다.",
  },
  {
    key: "thickness",
    label: "모발 굵기",
    icon: Scissors,
    desc: "모발의 굵기와 미세모(연모화) 비율을 파악합니다.",
  },
  {
    key: "scalpCondition",
    label: "두피 상태",
    icon: Sparkles,
    desc: "두피의 색상, 각질, 염증 여부 등 전반적 건강도를 확인합니다.",
  },
] as const;

/** Trend types */
const TRENDS = [
  {
    label: "개선 중",
    icon: TrendingUp,
    color: "#22C55E",
    desc: "이전 기록 대비 점수가 상승하고 있어요.",
  },
  {
    label: "유지 중",
    icon: Minus,
    color: "#6161FF",
    desc: "현재 상태가 안정적으로 유지되고 있어요.",
  },
  {
    label: "관찰 필요",
    icon: TrendingDown,
    color: "#EF4444",
    desc: "점수가 하락 추세예요. 관리 방법을 점검해보세요.",
  },
] as const;

/** Fail cases */
const FAIL_CASES = [
  { icon: ImageOff, text: "두피가 충분히 보이지 않는 사진" },
  { icon: Sun, text: "너무 어둡거나 역광인 사진" },
  { icon: Camera, text: "흔들리거나 초점이 맞지 않는 사진" },
  { icon: AlertTriangle, text: "스크린샷, 캡처, 다운로드 이미지" },
] as const;

/** Photo guide steps */
const PHOTO_STEPS = [
  {
    step: "정수리",
    icon: CrownAreaIcon,
    desc: "머리 꼭대기를 내려다보는 각도로 촬영합니다. 정수리 중심이 잘 보이도록 해주세요.",
  },
  {
    step: "앞이마",
    icon: FrontAreaIcon,
    desc: "이마를 정면에서 촬영합니다. 헤어라인 전체가 보이도록 머리카락을 뒤로 넘겨주세요.",
  },
  {
    step: "측면이마",
    icon: SideAreaIcon,
    desc: "관자놀이 부근을 측면에서 촬영합니다. M자 형태 여부를 확인할 수 있어요.",
  },
] as const;

const GRADE_KEYS = [1, 2, 3, 4, 5] as const;

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement {
  return (
    <motion.div variants={fadeSlideUp} className="mb-4">
      <h2 className="text-base font-bold text-[#323338] md:text-lg">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-[#676879]">
        {description}
      </p>
    </motion.div>
  );
}

export default function GuidePage(): ReactElement {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      <PageContainer className="py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* ── Hero ── */}
          <motion.div variants={fadeSlideUp} className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6161FF]/10">
              <ScanLine className="h-7 w-7 text-[#6161FF]" />
            </div>
            <h1 className="text-xl font-bold text-[#323338] md:text-2xl">
              {COPY.GUIDE_HERO}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#676879] md:text-base">
              {COPY.GUIDE_HERO_DESC}
            </p>
          </motion.div>

          {/* ── 1. 노우드-해밀턴 척도 ── */}
          <section>
            <SectionHeader
              title={COPY.GUIDE_SECTION_SCALE}
              description={COPY.GUIDE_SECTION_SCALE_DESC}
            />
            <motion.div
              variants={fadeSlideUp}
              className="overflow-x-auto rounded-2xl bg-white shadow-sm scrollbar-none"
            >
              <div className="flex min-w-max">
                {GRADE_KEYS.map((g) => {
                  const c = GRADE_CONFIG[g as GradeLevel];
                  return (
                    <div
                      key={g}
                      className="flex flex-1 flex-col items-center gap-1 border-r border-[#EEEFF2] px-4 py-4 last:border-r-0"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${c.color}15` }}
                      >
                        <EagleIcon grade={g} size={28} />
                      </div>
                      <span className="whitespace-nowrap text-[11px] font-semibold text-[#323338]">
                        {c.eagleLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </section>

          {/* ── 2. 두피 상태 등급 ── */}
          <section>
            <SectionHeader
              title={COPY.GUIDE_SECTION_GRADE}
              description={COPY.GUIDE_SECTION_GRADE_DESC}
            />
            <motion.div variants={fadeSlideUp} className="space-y-2">
              {GRADE_KEYS.map((g) => {
                const c = GRADE_CONFIG[g as GradeLevel];
                const headline = COPY.GRADE_HEADLINE[g];
                const desc = COPY.GRADE_DESCRIPTION[g];
                return (
                  <div
                    key={g}
                    className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div
                      className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${c.color}15` }}
                    >
                      <EagleIcon grade={g} size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="whitespace-nowrap text-sm font-bold"
                          style={{ color: c.color }}
                        >
                          LV.{g} {c.eagleLabel}
                        </span>
                        <span className="whitespace-nowrap rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[10px] font-medium text-[#9DA0AE]">
                          {c.action}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-[#676879]">
                        {c.eagleDesc}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9DA0AE]">
                        {headline} · {desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </section>

          {/* ── 3. 상태 표시 아이콘 (색상 분류 통합) ── */}
          <section>
            <SectionHeader
              title={COPY.GUIDE_SECTION_ICONS}
              description={COPY.GUIDE_SECTION_ICONS_DESC}
            />
            <motion.div variants={fadeSlideUp} className="overflow-x-auto scrollbar-none">
              <div className="flex min-w-max gap-2">
                {GRADE_KEYS.map((g) => {
                  const c = GRADE_CONFIG[g as GradeLevel];
                  return (
                    <div
                      key={g}
                      className="flex w-20 flex-shrink-0 flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm"
                    >
                      <EagleIcon grade={g} size={28} />
                      <span className="whitespace-nowrap text-[10px] font-semibold text-[#323338]">
                        {c.eagleLabel}
                      </span>
                      <div
                        className="h-2.5 w-full rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </section>

          {/* ── 4. 두피 추세 ── */}
          <section>
            <SectionHeader
              title={COPY.GUIDE_SECTION_TREND}
              description={COPY.GUIDE_SECTION_TREND_DESC}
            />
            <motion.div variants={fadeSlideUp} className="space-y-2">
              {TRENDS.map(({ label, icon: Icon, color, desc }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div>
                    <span
                      className="text-sm font-bold"
                      style={{ color }}
                    >
                      {label}
                    </span>
                    <p className="mt-0.5 text-xs text-[#676879]">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </section>

          {/* ── 5. 상세 분석 항목 ── */}
          <section>
            <SectionHeader
              title={COPY.GUIDE_SECTION_DETAIL}
              description={COPY.GUIDE_SECTION_DETAIL_DESC}
            />
            <motion.div
              variants={fadeSlideUp}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {DETAIL_ITEMS.map(({ key, label, icon: Icon, desc }) => (
                <div
                  key={key}
                  className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#6161FF]/10">
                    <Icon className="h-5 w-5 text-[#6161FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#323338]">{label}</p>
                    <p className="mt-0.5 text-xs text-[#676879]">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </section>

          {/* ── 6. 촬영 가이드 ── */}
          <section>
            <SectionHeader
              title={COPY.GUIDE_SECTION_PHOTOS}
              description={COPY.GUIDE_SECTION_PHOTOS_DESC}
            />
            <motion.div variants={fadeSlideUp} className="space-y-2">
              {PHOTO_STEPS.map(({ step, icon: AreaIcon, desc }, i) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7]">
                    <AreaIcon size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#323338]">
                      <span className="text-[#6161FF]">{i + 1}.</span> {step}
                    </p>
                    <p className="mt-0.5 text-xs text-[#676879]">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </section>

          {/* ── 7. 분석 불가 케이스 ── */}
          <section>
            <SectionHeader
              title={COPY.GUIDE_SECTION_FAIL}
              description={COPY.GUIDE_SECTION_FAIL_DESC}
            />
            <motion.div
              variants={fadeSlideUp}
              className="rounded-2xl border border-red-100 bg-red-50/50 p-4"
            >
              <div className="space-y-3">
                {FAIL_CASES.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                      <Icon className="h-4 w-4 text-red-400" />
                    </div>
                    <p className="text-xs font-medium text-[#323338]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ── Disclaimer ── */}
          <motion.div
            variants={fadeSlideUp}
            className="rounded-xl border border-[#EEEFF2] bg-[#FAFAFA] px-4 py-3 text-center"
          >
            <p className="text-xs font-medium text-[#9DA0AE]">
              {COPY.DISCLAIMER_SHORT}
            </p>
            <p className="mt-1 text-[10px] text-[#9DA0AE]">
              {COPY.DISCLAIMER_FULL}
            </p>
          </motion.div>
        </motion.div>
      </PageContainer>
    </div>
  );
}
