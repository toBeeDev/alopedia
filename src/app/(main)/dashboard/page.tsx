"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import {
  Camera,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-column";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  ScanIcon3D,
  HistoryIcon3D,
  GuideIcon3D,
  CommunityIcon3D,
  ProfileIcon3D,
} from "@/components/ui/icon-3d";
import { useScanHistory } from "@/hooks/useScanHistory";
import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

/* ── Community posts data ── */

const COMMUNITY_COL_1: Testimonial[] = [
  {
    text: "피나스테리드 6개월째 복용 중인데 정수리가 확실히 달라졌어요. 꾸준함이 답인 것 같습니다.",
    name: "익명의 관리자",
    role: "약물 후기",
    grade: 3,
  },
  {
    text: "AI 분석으로 매주 기록하다 보니 변화가 눈에 보여서 관리 동기부여가 확실히 됩니다.",
    name: "꾸준히기록중",
    role: "AI 분석",
    grade: 2,
  },
  {
    text: "처음엔 반신반의했는데 3개월 기록 비교해보니 실제로 개선되고 있어서 놀랐어요.",
    name: "희망찾기",
    role: "자유게시판",
    grade: 2,
  },
];

const COMMUNITY_COL_2: Testimonial[] = [
  {
    text: "모발이식 2000모 했는데 6개월 지나니 자연스러워졌어요. AI 비교 기능이 변화 확인에 좋습니다.",
    name: "두피지킴이",
    role: "시술 후기",
    grade: 4,
  },
  {
    text: "미녹시딜 1년 사용 경험자입니다. 꾸준히 바르면 효과 있어요. 6개월은 인내심이 필요합니다.",
    name: "꾸준함이답",
    role: "약물 후기",
    grade: 2,
  },
  {
    text: "메조테라피 10회 완료했는데 두피 상태가 확실히 좋아졌어요. 유지 관리가 핵심이에요.",
    name: "메조테라피경험자",
    role: "시술 후기",
    grade: 3,
  },
];

const COMMUNITY_COL_3: Testimonial[] = [
  {
    text: "1등급 6개월 연속 유지 중! 기록하는 습관이 관리의 시작이었어요.",
    name: "희망을보다",
    role: "AI 분석",
    grade: 1,
  },
  {
    text: "이식 전 4등급에서 6개월 만에 2등급으로. AI 분석 수치로 비교하니 감동이에요.",
    name: "이식후관리",
    role: "시술 후기",
    grade: 2,
  },
  {
    text: "두타스테리드로 전환한 지 4개월인데 부작용 없이 효과가 나타나기 시작했습니다.",
    name: "탈모초보",
    role: "Q&A",
    grade: null,
  },
];

/* ── Bento features with Unsplash backgrounds ── */

const BENTO_FEATURES = [
  {
    icon: <ScanIcon3D />,
    name: "AI 두피 분석",
    description:
      "사진을 촬영하면 AI가 노우드-해밀턴 스케일 기반으로 두피 상태를 분석합니다.",
    href: "/scan",
    cta: "촬영하기",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    icon: <HistoryIcon3D />,
    name: "변화 추적",
    description:
      "타임라인으로 두피 상태 변화를 한눈에 확인하세요.",
    href: "/history",
    cta: "기록 보기",
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    icon: <GuideIcon3D />,
    name: "분석 가이드",
    description:
      "AI 분석 방법, 등급 체계와 촬영 가이드를 확인하세요.",
    href: "/guide",
    cta: "가이드 보기",
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
  },
  {
    icon: <CommunityIcon3D />,
    name: "익명 커뮤니티",
    description: "약물, 시술 후기를 익명으로 공유하고 실질적인 정보를 나눠보세요.",
    href: "/board",
    cta: "커뮤니티 가기",
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    icon: <ProfileIcon3D />,
    name: "내 프로필",
    description:
      "스트릭, 뱃지, 레벨로 두피 관리 습관을 만들어갑니다.",
    href: "/profile",
    cta: "프로필 보기",
    className: "col-span-2 lg:col-span-1 lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
  },
];

/* ── Page ── */

export default function DashboardPage(): ReactElement {
  const { data: scans, isLoading } = useScanHistory();
  const latestScan = scans?.[0];
  const latestAnalysis = latestScan?.analyses?.[0];
  const gradeConfig = latestAnalysis
    ? getGradeConfig(latestAnalysis.norwood_grade)
    : null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      <PageContainer className="py-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* ── 1. 인사 + 최근 분석 요약 ── */}
          <section>
            <motion.h2
              variants={fadeSlideUp}
              className="mb-4 text-xl font-bold text-[#323338] md:text-2xl"
            >
              {COPY.WELCOME}
            </motion.h2>

            {latestAnalysis && gradeConfig ? (
              <motion.div variants={fadeSlideUp}>
                <Link
                  href={`/history/${latestScan!.id}`}
                  className="block rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#9DA0AE]">최근 분석 결과</p>
                      <p
                        className="mt-1 text-lg font-bold"
                        style={{ color: gradeConfig.color }}
                      >
                        {gradeConfig.label}
                      </p>
                      <p className="mt-0.5 text-sm text-[#676879]">
                        {latestAnalysis.score}점
                      </p>
                    </div>
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
                      style={{ backgroundColor: gradeConfig.color }}
                    >
                      {latestAnalysis.norwood_grade}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-[#6161FF]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    상세 보기
                  </div>
                </Link>
              </motion.div>
            ) : (
              !isLoading && (
                <motion.div
                  variants={fadeSlideUp}
                  className="rounded-2xl bg-white p-6 text-center shadow-sm"
                >
                  <p className="text-sm text-[#676879]">
                    {COPY.EMPTY_HISTORY}
                  </p>
                  <Link
                    href="/scan"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#6161FF] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6161FF]/25 transition-all hover:bg-[#4338ca] active:scale-95"
                  >
                    <Camera className="h-4 w-4" />
                    두피 촬영하기
                  </Link>
                </motion.div>
              )
            )}
          </section>

          {/* ── 2. Alopedia로 할 수 있는 것들 (Bento Grid) ── */}
          <motion.section variants={fadeSlideUp}>
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#323338] md:text-lg">
                Alopedia로 할 수 있는 것들
              </h3>
              <p className="mt-0.5 text-xs text-[#9DA0AE]">
                두피 관리의 모든 것을 한 곳에서
              </p>
            </div>

            <BentoGrid className="lg:auto-rows-[11rem] lg:grid-rows-2">
              {BENTO_FEATURES.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
              ))}
            </BentoGrid>
          </motion.section>

          {/* ── 3. 커뮤니티 후기 (Scrolling Testimonials) ── */}
          <motion.section variants={fadeSlideUp}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#323338] md:text-lg">
                  다른 분들의 경험
                </h3>
                <p className="mt-0.5 text-xs text-[#9DA0AE]">
                  커뮤니티에서 공유된 후기를 확인해보세요
                </p>
              </div>
              <Link
                href="/board"
                className="flex items-center gap-1 text-xs font-medium text-[#6161FF] hover:underline"
              >
                전체 보기
                <Sparkles className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex justify-center gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[480px]">
              <TestimonialsColumn
                testimonials={COMMUNITY_COL_1}
                duration={18}
              />
              <TestimonialsColumn
                testimonials={COMMUNITY_COL_2}
                className="hidden sm:block"
                duration={22}
              />
              <TestimonialsColumn
                testimonials={COMMUNITY_COL_3}
                className="hidden lg:block"
                duration={16}
              />
            </div>
          </motion.section>

        </motion.div>
      </PageContainer>
    </div>
  );
}
