"use client";

import React, { type ReactElement } from "react";
import { motion } from "framer-motion";

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  grade: number | null;
}

const GRADE_COLORS: Record<number, string> = {
  1: "#22C55E",
  2: "#EAB308",
  3: "#F97316",
  4: "#EF4444",
  5: "#A855F7",
};

export function TestimonialsColumn({
  className,
  testimonials,
  duration = 10,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}): ReactElement {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-4 pb-4"
      >
        {[...new Array(2).fill(0)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, name, role, grade }, i) => (
              <div
                className="w-full max-w-xs rounded-2xl border border-[#EEEFF2] bg-white p-5 shadow-sm"
                key={i}
              >
                <p className="text-sm leading-relaxed text-[#676879]">{text}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-xs font-bold text-[#9DA0AE]">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold leading-5 text-[#323338]">
                      {name}
                    </div>
                    <div className="text-[11px] leading-4 text-[#9DA0AE]">
                      {role}
                    </div>
                  </div>
                  {grade !== null && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: GRADE_COLORS[grade] ?? "#9DA0AE",
                      }}
                    >
                      {grade}등급
                    </span>
                  )}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
