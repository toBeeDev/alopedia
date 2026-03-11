"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { COPY } from "@/constants/copy";

interface HandWrittenTitleProps {
  title?: string;
  subtitle?: string;
}

const HAIR_STRANDS = [
  {
    d: "M 350 210 Q 320 140, 300 40 Q 290 -10, 275 -50",
    w: 7,
    o: 0.55,
    delay: 0,
  },
  { d: "M 450 190 C 440 130, 460 70, 435 -20", w: 8, o: 0.6, delay: 0.15 },
  {
    d: "M 530 182 Q 520 100, 528 10 Q 532 -30, 522 -70",
    w: 7.5,
    o: 0.65,
    delay: 0.08,
  },
  { d: "M 600 178 C 598 110, 604 40, 600 -40", w: 9, o: 0.75, delay: 0.05 },
  { d: "M 670 182 C 680 120, 665 50, 685 -30", w: 7.5, o: 0.65, delay: 0.1 },
  { d: "M 750 190 C 760 130, 745 70, 770 -20", w: 8, o: 0.6, delay: 0.18 },
  {
    d: "M 850 210 Q 875 140, 895 40 Q 905 -10, 920 -50",
    w: 7,
    o: 0.55,
    delay: 0.25,
  },
] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
function HandWrittenTitle({
  title = "Alopedia",
  subtitle = COPY.APP_TAGLINE,
}: HandWrittenTitleProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 2.5,
          ease: [0.43, 0.13, 0.23, 0.96],
          delay: i * 0.15,
        },
        opacity: { duration: 0.5, delay: i * 0.15 },
      },
    }),
  } as any;

  const hairGrow = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (strand: { delay: number }) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 2.2,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.6 + strand.delay,
        },
        opacity: {
          duration: 0.01,
          delay: 0.6 + strand.delay,
        },
      },
    }),
  } as any;

  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center">
      {/* SVG 원 + 모발 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 700"
          initial="hidden"
          animate="visible"
          className="h-full w-full max-w-5xl"
          preserveAspectRatio="xMidYMid meet"
        >
          <title>Alopedia</title>

          {/* 원형 */}
          <motion.path
            d="M 950 190
               C 1250 400, 1050 580, 600 620
               C 250 620, 150 580, 150 400
               C 150 220, 350 180, 600 180
               C 850 180, 950 280, 950 280"
            fill="none"
            strokeWidth="10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            custom={0}
            className="text-black dark:text-white opacity-90"
          />

          {/* 모발 - 다양한 형태 */}
          {HAIR_STRANDS.map((strand, i) => (
            <motion.path
              key={i}
              d={strand.d}
              fill="none"
              strokeWidth={strand.w}
              stroke="currentColor"
              strokeLinecap="round"
              variants={hairGrow}
              custom={strand}
              className="text-black dark:text-white"
            />
          ))}
        </motion.svg>
      </div>

      {/* 타이틀 텍스트 */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.h1
          className="text-5xl font-bold tracking-tighter text-black dark:text-white md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="mt-3 text-base text-black/60 dark:text-white/60 md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* CTA 버튼 영역 */}
      <motion.div
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom,0px)_+_0.5rem)] flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1.8,
          duration: 0.6,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        {/* 로그인하기 — 튕기는 바운스 */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.6,
          }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#6161FF] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6161FF]/25 transition-all hover:bg-[#4338ca] hover:shadow-xl hover:shadow-[#6161FF]/30 active:scale-95"
          >
            {COPY.HERO_LOGIN_CTA}
          </Link>
        </motion.div>

        {/* 구경하기 — 게시판 미리보기 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.6 }}
        >
          <Link
            href="/board"
            className="group flex items-center gap-1 text-sm font-medium text-black/40 transition-colors hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
          >
            {COPY.HERO_BROWSE_CTA}
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export { HandWrittenTitle };
