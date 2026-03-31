"use client";

import { type ReactElement, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fadeSlideUp } from "@/lib/motion";
import type { DiaryCalendarDot } from "@/types/diary";

interface Props {
  year: number;
  month: number; // 1-12
  dots: DiaryCalendarDot[];
  selectedDate: string | null;
  onDateClick: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const GRADE_DOT: Record<number, string> = {
  1: "bg-green-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-purple-500",
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
  selectedDate,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  onToday,
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

  // Previous month trailing days
  const prevMonthDays = useMemo(() => {
    const prevLastDay = new Date(year, month - 1, 0).getDate();
    const days: number[] = [];
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      days.push(prevLastDay - i);
    }
    return days;
  }, [year, month, firstDayOffset]);

  // Next month leading days
  const nextMonthDays = useMemo(() => {
    const totalCells = prevMonthDays.length + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const days: number[] = [];
    for (let i = 1; i <= remaining; i++) {
      days.push(i);
    }
    return days;
  }, [prevMonthDays.length, daysInMonth]);

  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      {/* Header: month nav centered + 오늘 button */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onToday}
          className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          오늘
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="이전 달"
            onClick={onPrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-base font-bold text-foreground min-w-[100px] text-center">
            {year}년 {month}월
          </span>

          <button
            type="button"
            aria-label="다음 달"
            onClick={onNextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Spacer to balance "오늘" button width */}
        <div className="w-[42px]" />
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={[
              "flex items-center justify-center py-2 text-xs font-semibold",
              i === 0
                ? "text-red-400"
                : i === 6
                  ? "text-blue-400"
                  : "text-muted-foreground/50",
            ].join(" ")}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {/* Previous month trailing days */}
        {prevMonthDays.map((day) => (
          <div
            key={`prev-${day}`}
            className="flex flex-col items-center justify-center py-2.5"
          >
            <span className="text-sm text-muted-foreground/30">{day}</span>
          </div>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = formatDateStr(year, month, day);
          const dot = dotMap.get(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const grade = dot?.norwoodGrade ?? null;
          const hasEntry = dot?.hasEntry ?? false;
          const isFuture = dateStr > today;

          return (
            <button
              key={dateStr}
              type="button"
              aria-label={`${month}월 ${day}일`}
              onClick={() => !isFuture && onDateClick(dateStr)}
              disabled={isFuture}
              className={[
                "flex flex-col items-center justify-center py-2.5 transition-colors group relative",
                isFuture ? "cursor-default" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all",
                  // Future: dimmed
                  isFuture
                    ? "text-muted-foreground/25 font-normal"
                    : "",
                  // Selected (not today): muted filled circle
                  !isFuture && isSelected && !isToday
                    ? "bg-muted-foreground/20 text-foreground font-bold ring-2 ring-muted-foreground/30"
                    : "",
                  // Today + selected: primary filled
                  !isFuture && isToday && isSelected
                    ? "bg-primary text-primary-foreground font-bold"
                    : "",
                  // Today (not selected): outlined ring
                  !isFuture && isToday && !isSelected
                    ? "ring-2 ring-primary text-primary font-bold"
                    : "",
                  // Has entry but not selected/today
                  !isFuture && !isSelected && !isToday && hasEntry
                    ? "font-semibold text-foreground"
                    : "",
                  // Default past/present
                  !isFuture && !isSelected && !isToday && !hasEntry
                    ? "font-medium text-foreground/70 group-hover:bg-muted"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {day}
              </span>

              {/* Entry dot indicator */}
              {hasEntry && !isFuture && (
                <span
                  className={[
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    isToday || isSelected ? "bg-background/60" : "",
                    grade !== null && !isToday && !isSelected
                      ? GRADE_DOT[grade]
                      : !isToday && !isSelected
                        ? "bg-primary"
                        : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}
            </button>
          );
        })}

        {/* Next month leading days */}
        {nextMonthDays.map((day) => (
          <div
            key={`next-${day}`}
            className="flex flex-col items-center justify-center py-2.5"
          >
            <span className="text-sm text-muted-foreground/30">{day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
