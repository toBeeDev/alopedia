"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COPY } from "@/constants/copy";
import { usePublicDiary } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import DiaryEntryCard from "@/components/diary/DiaryEntryCard";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

export default function DiaryPublicPage(): ReactElement {
  const [page, setPage] = useState<number>(1);
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = usePublicDiary(page);

  const entries = data?.entries ?? [];
  const total = data?.pagination?.total ?? 0;
  const pageSize = data?.pagination?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <PageContainer>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 py-6"
      >
        {/* Header */}
        <motion.h1
          variants={fadeSlideUp}
          className="text-xl font-bold text-foreground"
        >
          {COPY.DIARY_PUBLIC_TITLE}
        </motion.h1>

        {/* Entry list */}
        {isLoading ? (
          <motion.p
            variants={fadeSlideUp}
            className="text-center text-sm text-muted-foreground py-8"
          >
            불러오는 중...
          </motion.p>
        ) : entries.length === 0 ? (
          <motion.p
            variants={fadeSlideUp}
            className="text-center text-sm text-muted-foreground py-8"
          >
            {COPY.DIARY_PUBLIC_EMPTY}
          </motion.p>
        ) : (
          <motion.div variants={staggerContainer} className="flex flex-col gap-3">
            {entries.map((entry) => (
              <motion.div key={entry.id} variants={fadeSlideUp}>
                <DiaryEntryCard
                  entry={entry}
                  isOwner={user?.id === entry.userId}
                  showAuthor
                  onClick={() => router.push(`/diary/${entry.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            variants={fadeSlideUp}
            className="flex items-center justify-center gap-4"
          >
            <button
              type="button"
              aria-label="이전 페이지"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              aria-label="다음 페이지"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
