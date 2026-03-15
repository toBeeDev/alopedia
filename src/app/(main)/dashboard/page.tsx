"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import {
  Camera,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Calendar,
  Flame,
  BarChart3,
  MessageCircle,
  BookOpen,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-column";
import { useScanHistory } from "@/hooks/useScanHistory";
import { useProfile } from "@/hooks/useProfile";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
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

/* ── Quick Action Card ── */

function QuickAction({
  icon,
  label,
  desc,
  href,
  gradient,
}: {
  icon: ReactElement;
  label: string;
  desc: string;
  href: string;
  gradient: string;
}): ReactElement {
  return (
    <Link href={href} className="group block">
      <motion.div
        variants={fadeSlideUp}
        className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div
          className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[0.07] blur-xl ${gradient}`}
        />
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            {icon}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-muted-foreground/70" />
        </div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{desc}</p>
      </motion.div>
    </Link>
  );
}

/* ── Page ── */

export default function DashboardPage(): ReactElement {
  const { data: scans, isLoading: scansLoading } = useScanHistory();
  const { data: profileData } = useProfile();
  const profile = profileData?.profile;

  const latestScan = scans?.[0];
  const latestAnalysis = latestScan?.analyses?.[0];
  const gradeConfig = latestAnalysis
    ? getGradeConfig(latestAnalysis.norwood_grade)
    : null;
  const scanCount = scans?.length ?? 0;

  const prevAnalysis = scans?.[1]?.analyses?.[0];
  const scoreDiff =
    latestAnalysis && prevAnalysis
      ? latestAnalysis.score - prevAnalysis.score
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted via-background to-muted pb-24">
      <PageContainer className="py-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ── 1. 인사 헤더 ── */}
          <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground/70">
                {new Date().toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </p>
              <h2 className="mt-0.5 text-xl font-bold text-foreground">
                {profile?.nickname
                  ? `${profile.nickname}님, 안녕하세요`
                  : "안녕하세요"}
              </h2>
            </div>
            {profile?.streak_current ? (
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1.5 ring-1 ring-orange-100 dark:from-orange-500/10 dark:to-amber-500/10 dark:ring-orange-500/20">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {profile.streak_current}일 연속
                </span>
              </div>
            ) : null}
          </motion.div>

          {/* ── 2. 메인 분석 카드 (Hero) ── */}
          {latestAnalysis && gradeConfig ? (
            <motion.div variants={fadeSlideUp}>
              <Link
                href={`/history/${latestScan!.id}`}
                className="group block overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border transition-all hover:shadow-lg"
              >
                <div
                  className="h-1.5"
                  style={{
                    background: `linear-gradient(90deg, ${gradeConfig.color}40, ${gradeConfig.color})`,
                  }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground/70">
                          최근 두피 분석
                        </span>
                        {scoreDiff !== null && (
                          <span
                            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              scoreDiff > 0
                                ? "bg-emerald-500/10 text-emerald-600"
                                : scoreDiff < 0
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <TrendingUp
                              className={`h-3 w-3 ${scoreDiff < 0 ? "rotate-180" : ""}`}
                            />
                            {scoreDiff > 0 ? "+" : ""}
                            {scoreDiff.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-2xl font-extrabold tracking-tight"
                        style={{ color: gradeConfig.color }}
                      >
                        {gradeConfig.eagleLabel}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {gradeConfig.eagleDesc}
                      </p>

                      <div className="mt-5 flex items-center gap-6">
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground">점수</p>
                          <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                            {latestAnalysis.score}
                            <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">점</span>
                          </p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground">등급</p>
                          <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                            {latestAnalysis.norwood_grade}
                            <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">단계</span>
                          </p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground">기록</p>
                          <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                            {scanCount}
                            <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">회</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${gradeConfig.color}10` }}
                    >
                      <EagleIcon grade={latestAnalysis.norwood_grade} size={52} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-foreground">
                    상세 분석 보기
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            !scansLoading && (
              <motion.div variants={fadeSlideUp}>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 p-8 text-center shadow-lg">
                  <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-card/10 blur-2xl" />
                  <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-card/10 blur-2xl" />
                  <div className="relative">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card/20 backdrop-blur-sm">
                      <Camera className="h-8 w-8 text-background" />
                    </div>
                    <h3 className="text-lg font-bold text-background">
                      첫 번째 두피 분석을 시작해보세요
                    </h3>
                    <p className="mx-auto mt-2 max-w-[280px] text-sm text-background/70">
                      AI가 두피 상태를 분석하고 맞춤 관리 방법을 알려드려요
                    </p>
                    <Link
                      href="/scan"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-card px-7 py-3 text-sm font-bold text-foreground shadow-lg shadow-black/10 transition-all hover:shadow-xl active:scale-95"
                    >
                      <Camera className="h-4 w-4" />
                      두피 촬영하기
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          )}

          {/* ── 3. 빠른 메뉴 그리드 ── */}
          <section>
            <motion.div variants={fadeSlideUp} className="mb-3">
              <h3 className="text-sm font-bold text-foreground">빠른 메뉴</h3>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <QuickAction
                icon={<Camera className="h-5 w-5 text-foreground" />}
                label="두피 촬영"
                desc="AI 분석 시작하기"
                href="/scan"
                gradient="bg-foreground"
              />
              <QuickAction
                icon={<Calendar className="h-5 w-5 text-emerald-500" />}
                label="분석 기록"
                desc="변화 타임라인"
                href="/history"
                gradient="bg-emerald-500"
              />
              <QuickAction
                icon={<MessageCircle className="h-5 w-5 text-amber-500" />}
                label="커뮤니티"
                desc="후기 & 정보 공유"
                href="/board"
                gradient="bg-amber-500"
              />
              <QuickAction
                icon={<BookOpen className="h-5 w-5 text-blue-500" />}
                label="분석 가이드"
                desc="등급 체계 안내"
                href="/guide"
                gradient="bg-blue-500"
              />
              <QuickAction
                icon={<BarChart3 className="h-5 w-5 text-rose-500" />}
                label="두피 통계"
                desc="점수 추이 확인"
                href="/history"
                gradient="bg-rose-500"
              />
              <QuickAction
                icon={<User className="h-5 w-5 text-violet-500" />}
                label="내 프로필"
                desc="레벨 & 뱃지"
                href="/profile"
                gradient="bg-violet-500"
              />
            </div>
          </section>

          {/* ── 4. 커뮤니티 후기 (Scrolling Testimonials) ── */}
          <motion.section variants={fadeSlideUp}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  다른 분들의 경험
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  커뮤니티에서 공유된 후기를 확인해보세요
                </p>
              </div>
              <Link
                href="/board"
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                전체 보기
                <Sparkles className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex justify-center gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[420px]">
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

          {/* ── 6. 면책 조항 ── */}
          <motion.div
            variants={fadeSlideUp}
            className="rounded-2xl bg-muted px-5 py-4 ring-1 ring-border"
          >
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground/70">
              {COPY.DISCLAIMER_FULL}
            </p>
          </motion.div>
        </motion.div>
      </PageContainer>
    </div>
  );
}
