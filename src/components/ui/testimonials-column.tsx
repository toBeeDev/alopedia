"use client";

import React, { type ReactElement } from "react";
import { motion } from "framer-motion";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  grade: number | null;
}

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
        style={{ willChange: "transform" }}
      >
        {[...new Array(2).fill(0)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, name, role, grade }, i) => {
              const gc = grade !== null ? getGradeConfig(grade) : null;
              return (
                <div
                  className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-sm"
                  key={i}
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-bold text-muted-foreground/70">
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold leading-5 text-foreground">
                        {name}
                      </div>
                      <div className="text-[11px] leading-4 text-muted-foreground/70">
                        {role}
                      </div>
                    </div>
                    {gc && grade !== null && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2 text-[10px] font-bold text-white"
                        style={{ backgroundColor: gc.color }}
                      >
                        <EagleIcon grade={grade} size={16} /> {gc.eagleLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
