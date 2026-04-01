"use client";

import { useState, useRef, useEffect, useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Lock, Globe, Pencil, CalendarDays, X } from "lucide-react";
import { COPY } from "@/constants/copy";
import { useDiaryEntries, useDiaryCalendar, usePublicDiaryInfinite } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import DiaryCalendar from "@/components/diary/DiaryCalendar";
import DiaryEntryCard from "@/components/diary/DiaryEntryCard";
import DiaryFeedCard from "@/components/diary/DiaryFeedCard";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import type { DiaryEntry } from "@/types/diary";

function diaryPath(entry: DiaryEntry): string {
  return `/diary/${entry.slug ?? entry.id}`;
}

type DiaryFilter = "public" | "mine";

function formatMonthStr(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getTodayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function calculateStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  const today = getTodayStr();
  let streak = 0;
  let cursor = new Date(today);

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const cursorStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (sortedDates[i] === cursorStr) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (sortedDates[i] < cursorStr) {
      break;
    }
  }
  return streak;
}

export default function DiaryPage(): ReactElement {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [filter, setFilter] = useState<DiaryFilter>("mine");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendarMobile, setShowCalendarMobile] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const monthStr = formatMonthStr(year, month);
  const { data, isLoading } = useDiaryEntries(monthStr);
  const dots = useDiaryCalendar(monthStr);

  // Public feed (infinite scroll)
  const {
    data: publicData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: publicLoading,
  } = usePublicDiaryInfinite();

  const publicEntries = publicData?.pages.flatMap((p) => p.entries) ?? [];

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || filter !== "public") return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, filter]);

  const entries = data?.entries ?? [];
  const today = getTodayStr();
  const todayEntry = entries.find((e) => e.date === today) ?? null;
  const sortedDates = [...entries.map((e) => e.date)].sort();
  const streak = calculateStreak(sortedDates);

  // My entries sorted descending
  const myEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  function handlePrevMonth(): void {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function handleNextMonth(): void {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  function handleToday(): void {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSelectedDate(today);
  }

  function handleDateClick(date: string): void {
    // Block future dates
    if (date > today) return;
    setSelectedDate(date);
    // Switch to mine tab when clicking calendar
    setFilter("mine");
    const entry = entries.find((e) => e.date === date);
    if (entry && window.innerWidth < 1024) {
      router.push(diaryPath(entry));
    }
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const showAddButton = isCurrentMonth && !todayEntry && user !== null;

  return (
    <PageContainer>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5 py-6"
      >
        {/* Header */}
        <motion.div variants={fadeSlideUp} className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {COPY.PAGE_TITLE_DIARY}
            </h1>
            {streak > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {COPY.DIARY_STREAK(streak)}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile calendar toggle */}
            <button
              type="button"
              onClick={() => setShowCalendarMobile((v) => !v)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="캘린더 보기"
            >
              <CalendarDays className="h-4 w-4" />
            </button>

            {showAddButton && (
              <button
                type="button"
                onClick={() => router.push("/diary/new")}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:opacity-90 active:scale-95"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{COPY.DIARY_ADD_CTA}</span>
                <span className="sm:hidden">기록</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Mobile calendar overlay */}
        <AnimatePresence>
          {showCalendarMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-card p-5 relative">
                <button
                  type="button"
                  onClick={() => setShowCalendarMobile(false)}
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  aria-label="캘린더 닫기"
                >
                  <X className="h-4 w-4" />
                </button>
                <DiaryCalendar
                  year={year}
                  month={month}
                  dots={dots}
                  selectedDate={selectedDate}
                  onDateClick={(date) => {
                    handleDateClick(date);
                    setShowCalendarMobile(false);
                  }}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onToday={handleToday}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Calendar (desktop only) */}
          <motion.div
            variants={fadeSlideUp}
            className="hidden lg:block lg:w-[380px] lg:shrink-0 rounded-2xl border border-border bg-card p-5 self-start sticky top-24"
          >
            <DiaryCalendar
              year={year}
              month={month}
              dots={dots}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleToday}
            />
          </motion.div>

          {/* Right: Feed panel */}
          <motion.div
            variants={fadeSlideUp}
            className="flex-1 flex flex-col min-w-0"
          >
            {/* Filter chips */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFilter("public")}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all cursor-pointer",
                  filter === "public"
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                ].join(" ")}
              >
                <Globe className="h-3.5 w-3.5" />
                전체 일기
              </button>
              <button
                type="button"
                onClick={() => setFilter("mine")}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all cursor-pointer",
                  filter === "mine"
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                ].join(" ")}
              >
                <Lock className="h-3.5 w-3.5" />
                나만의 일기
              </button>
            </div>

            {/* Content based on filter */}
            {filter === "mine" ? (
              /* My diary entries */
              isLoading ? (
                <div className="flex flex-col gap-2.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 rounded-xl bg-muted/40 animate-pulse"
                    />
                  ))}
                </div>
              ) : (() => {
                const selectedEntry = selectedDate
                  ? entries.find((e) => e.date === selectedDate)
                  : null;
                const selectedDateLabel = selectedDate
                  ? new Date(selectedDate + "T00:00:00").toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })
                  : null;

                return (
                  <div className="flex flex-col gap-4">
                    {/* Selected date highlight */}
                    {selectedDate && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {selectedDateLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedDate(null)}
                            className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground"
                          >
                            전체 보기
                          </button>
                        </div>
                        {selectedEntry ? (
                          <DiaryEntryCard
                            entry={selectedEntry}
                            isOwner
                            onClick={() => router.push(diaryPath(selectedEntry))}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 py-8 rounded-xl border border-dashed border-border">
                            <p className="text-sm text-muted-foreground">
                              이 날은 기록이 없어요
                            </p>
                            {selectedDate === today && (
                              <button
                                type="button"
                                onClick={() => router.push("/diary/new")}
                                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                              >
                                <Plus className="h-3 w-3" />
                                오늘 기록하기
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Full list */}
                    {!selectedDate && (
                      myEntries.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {myEntries.map((entry) => (
                            <DiaryEntryCard
                              key={entry.id}
                              entry={entry}
                              isOwner
                              onClick={() => router.push(diaryPath(entry))}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-border">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                            <Pencil className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
                            {COPY.DIARY_EMPTY}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                );
              })()
            ) : (
              /* Public feed (infinite scroll) */
              <>
                {publicLoading ? (
                  <div className="flex flex-col gap-2.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 rounded-xl bg-muted/40 animate-pulse"
                      />
                    ))}
                  </div>
                ) : publicEntries.length > 0 ? (
                  <div className="flex flex-col">
                    {publicEntries.map((entry) => (
                      <DiaryFeedCard
                        key={entry.id}
                        entry={entry}
                        isOwner={user?.id === entry.userId}
                        onClick={() => router.push(diaryPath(entry))}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                      <Globe className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center max-w-[200px]">
                      아직 공개된 글이 없어요
                    </p>
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={loadMoreRef} className="h-10" />
                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
