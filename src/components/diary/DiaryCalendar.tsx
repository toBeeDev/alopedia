"use client";

import { type ReactElement, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { fadeSlideUp } from "@/lib/motion";
import type { DiaryCalendarDot } from "@/types/diary";

interface Props {
  year: number;
  month: number; // 1-12
  dots: DiaryCalendarDot[];
  onDateClick: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  todayEntry: string | null; // entry id if exists
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const GRADE_COLORS: Record<number, string> = {
  1: "#22C55E",
  2: "#EAB308",
  3: "#F97316",
  4: "#EF4444",
  5: "#A855F7",
};

function formatDateStr(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function DiaryCalendar({
  year,
  month,
  dots,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  todayEntry,
}: Props): ReactElement {
  const today = useMemo(() => {
    const d = new Date();
    return formatDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }, []);

  const dotMap = useMemo(() => {
    const map = new Map<string, DiaryCalendarDot>();
    for (const dot of dots) {
      map.set(dot.date, dot);
    }
    return map;
  }, [dots]);

  const firstDayOffset = useMemo(
    () => new Date(year, month - 1, 1).getDay(),
    [year, month],
  );

  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [year, month],
  );

  const cells = useMemo(() => {
    const result: Array<{ day: number | null }> = [];
    for (let i = 0; i < firstDayOffset; i++) {
      result.push({ day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d });
    }
    return result;
  }, [firstDayOffset, daysInMonth]);

  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-card shadow-sm ring-1 ring-border overflow-hidden"
    >
      {/* Month navigation header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button
          type="button"
          aria-label="이전 달"
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-sm font-bold text-foreground">
          {year}년 {month}월
        </span>

        <button
          type="button"
          aria-label="다음 달"
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center pb-2 text-[11px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1 px-3 pb-4">
        {cells.map((cell, idx) => {
          if (cell.day === null) {
            return <div key={`blank-${idx}`} className="aspect-square" />;
          }

          const dateStr = formatDateStr(year, month, cell.day);
          const dot = dotMap.get(dateStr);
          const isToday = dateStr === today;
          const dotColor =
            dot?.norwoodGrade != null
              ? (GRADE_COLORS[dot.norwoodGrade] ?? null)
              : null;

          return (
            <button
              key={dateStr}
              type="button"
              aria-label={`${year}년 ${month}월 ${cell.day}일`}
              onClick={() => onDateClick(dateStr)}
              className={[
                "aspect-square flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors",
                "hover:bg-muted active:scale-95",
                isToday
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-card"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "text-xs leading-none",
                  isToday ? "font-bold text-primary" : "font-medium text-foreground",
                ].join(" ")}
              >
                {cell.day}
              </span>

              {/* Dot or Plus icon */}
              {dotColor != null ? (
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
              ) : isToday && todayEntry === null ? (
                <Plus className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              ) : (
                <span className="h-1.5 w-1.5 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
