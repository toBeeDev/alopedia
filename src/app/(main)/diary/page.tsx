"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { COPY } from "@/constants/copy";
import { useDiaryEntries, useDiaryCalendar } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import DiaryCalendar from "@/components/diary/DiaryCalendar";
import DiaryEntryCard from "@/components/diary/DiaryEntryCard";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

function formatMonthStr(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getTodayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Count consecutive days ending at today from a sorted array of date strings (asc) */
function calculateStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;

  const today = getTodayStr();
  let streak = 0;
  let cursor = new Date(today);

  // Walk backwards from today
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const cursorStr = cursor.toISOString().slice(0, 10);
    if (sortedDates[i] === cursorStr) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (sortedDates[i] < cursorStr) {
      // gap found
      break;
    }
    // sortedDates[i] > cursorStr means future entry — skip
  }

  return streak;
}

export default function DiaryPage(): ReactElement {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);

  const router = useRouter();
  const { user } = useAuth();
  const monthStr = formatMonthStr(year, month);
  const { data } = useDiaryEntries(monthStr);
  const dots = useDiaryCalendar(monthStr);

  const entries = data?.entries ?? [];
  const today = getTodayStr();

  const todayEntry = entries.find((e) => e.date === today) ?? null;
  const sortedDates = [...entries.map((e) => e.date)].sort();
  const streak = calculateStreak(sortedDates);

  function handlePrevMonth(): void {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function handleNextMonth(): void {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleDateClick(date: string): void {
    const entry = entries.find((e) => e.date === date);
    if (entry) {
      router.push(`/diary/${entry.id}`);
    } else if (date === today) {
      router.push("/diary/new");
    }
  }

  const showAddButton = !todayEntry && user !== null;

  return (
    <PageContainer>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 py-6"
      >
        {/* Header */}
        <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold text-foreground">{COPY.PAGE_TITLE_DIARY}</h1>
            {streak > 0 && (
              <p className="text-sm text-muted-foreground">{COPY.DIARY_STREAK(streak)}</p>
            )}
          </div>

          {showAddButton && (
            <button
              type="button"
              onClick={() => router.push("/diary/new")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {COPY.DIARY_ADD_CTA}
            </button>
          )}
        </motion.div>

        {/* Calendar */}
        <motion.div variants={fadeSlideUp}>
          <DiaryCalendar
            year={year}
            month={month}
            dots={dots}
            onDateClick={handleDateClick}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            todayEntry={todayEntry?.id ?? null}
          />
        </motion.div>

        {/* Entry list for the month */}
        {entries.length > 0 ? (
          <motion.div variants={staggerContainer} className="flex flex-col gap-3">
            {[...entries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry) => (
                <motion.div key={entry.id} variants={fadeSlideUp}>
                  <DiaryEntryCard
                    entry={entry}
                    isOwner={user?.id === entry.userId}
                    onClick={() => router.push(`/diary/${entry.id}`)}
                  />
                </motion.div>
              ))}
          </motion.div>
        ) : (
          <motion.p
            variants={fadeSlideUp}
            className="text-center text-sm text-muted-foreground py-8"
          >
            {COPY.DIARY_EMPTY}
          </motion.p>
        )}
      </motion.div>
    </PageContainer>
  );
}
