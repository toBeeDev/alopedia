"use client";

import type React from "react";
import { useState, useEffect, useRef, type ReactElement } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EagleIcon } from "@/components/ui/eagle-icons";
import type { GradeLevel } from "@/constants/gradeConfig";

interface TestimonialItem {
  readonly quote: string;
  readonly author: string;
  readonly role: string;
  readonly category: string;
  readonly grade: GradeLevel;
}

const testimonials: TestimonialItem[] = [
  {
    quote: "6개월 기록했더니 정수리가 확실히 달라졌어요. 꾸준함이 답이에요.",
    author: "익명의 관리자",
    role: "피나스테리드 6개월 복용",
    category: "약물 후기",
    grade: 3,
  },
  {
    quote: "AI 분석으로 매주 비교하니까 변화가 눈에 보여서 동기부여가 돼요.",
    author: "꾸준히기록중",
    role: "정수리 관리 3개월째",
    category: "AI 분석",
    grade: 2,
  },
  {
    quote: "처음엔 반신반의했는데 3개월 비교해보니 실제로 개선돼서 놀랐어요.",
    author: "희망찾기",
    role: "미녹시딜 1년 사용",
    category: "약물 후기",
    grade: 2,
  },
  {
    quote: "모발이식 후 변화 추적에 AI 비교 기능이 정말 유용했어요.",
    author: "두피지킴이",
    role: "모발이식 2000모",
    category: "시술 후기",
    grade: 4,
  },
  {
    quote: "1등급 6개월 연속 유지 중! 기록하는 습관이 관리의 시작이었어요.",
    author: "희망을보다",
    role: "두피 관리 꾸준히",
    category: "AI 분석",
    grade: 1,
  },
];

const GRADE_COLORS: Record<GradeLevel, string> = {
  1: "#22C55E",
  2: "#EAB308",
  3: "#F97316",
  4: "#EF4444",
  5: "#A855F7",
};

export function Testimonial(): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const numberX = useTransform(x, [-200, 200], [-20, 20]);
  const numberY = useTransform(y, [-200, 200], [-10, 10]);

  function handleMouseMove(e: React.MouseEvent): void {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  }

  function goNext(): void {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }

  function goPrev(): void {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }

  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return (): void => clearInterval(timer);
  }, []);

  const current = testimonials[activeIndex];
  const accentColor = GRADE_COLORS[current.grade];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Oversized index number */}
      <motion.div
        className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none text-[16rem] font-bold leading-none tracking-tighter text-foreground/[0.03] sm:-left-8 sm:text-[24rem]"
        style={{ x: numberX, y: numberY }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Main content */}
      <div className="relative flex">
        {/* Left column - vertical text + progress */}
        <div className="hidden flex-col items-center justify-center border-r border-border pr-10 sm:flex sm:pr-16">
          <motion.span
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Reviews
          </motion.span>

          <div className="relative mt-8 h-32 w-px bg-border">
            <motion.div
              className="absolute left-0 top-0 w-full origin-top"
              style={{ backgroundColor: accentColor }}
              animate={{
                height: `${((activeIndex + 1) / testimonials.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Center - main content */}
        <div className="flex-1 py-8 sm:py-12 sm:pl-16">
          {/* Category badge with eagle icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="mb-6 sm:mb-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <EagleIcon grade={current.grade} size={16} />
                {current.category}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Quote with word reveal */}
          <div className="relative mb-8 min-h-[80px] sm:mb-12 sm:min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeIndex}
                className="text-2xl font-light leading-[1.2] tracking-tight text-foreground sm:text-3xl md:text-4xl"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {current.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={`${activeIndex}-${i}`}
                    className="mr-[0.3em] inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 20, rotateX: 90 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        transition: {
                          duration: 0.5,
                          delay: i * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: -10,
                        transition: { duration: 0.2, delay: i * 0.02 },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Author row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className="h-px w-8"
                  style={{ backgroundColor: accentColor }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {current.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {current.role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              {/* Dots indicator (mobile) */}
              <div className="flex items-center gap-1.5 sm:hidden">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex
                        ? "w-4 bg-foreground"
                        : "w-1.5 bg-foreground/20"
                    }`}
                    aria-label={`후기 ${i + 1}번으로 이동`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  aria-label="이전 후기"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  aria-label="다음 후기"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="h-0.5 bg-border sm:hidden">
        <motion.div
          className="h-full origin-left"
          style={{ backgroundColor: accentColor }}
          animate={{
            width: `${((activeIndex + 1) / testimonials.length) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
