"use client";

import { use, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { COPY } from "@/constants/copy";
import { useDiaryEntry, useDeleteDiaryEntry } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

interface Props {
  params: Promise<{ id: string }>;
}

export default function DiaryDetailPage({ params }: Props): ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useDiaryEntry(id);
  const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteDiaryEntry();

  const entry = data?.entry ?? null;
  const isOwner = !!user && !!entry && user.id === entry.userId;

  const grade = entry?.analysis?.norwoodGrade ?? null;
  const score = entry?.analysis?.score ?? null;
  const images = entry?.scan?.images ?? [];
  const checkedItems = (entry?.checklists ?? []).filter((c) => c.checked);
  const formattedDate = entry
    ? new Date(entry.date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  async function handleDelete(): Promise<void> {
    if (!window.confirm("이 기록을 삭제할까요?")) return;
    await deleteEntry(id);
    toast.success(COPY.DIARY_ENTRY_DELETED);
    router.push("/diary");
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      </PageContainer>
    );
  }

  if (!entry) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">기록을 찾을 수 없어요.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 py-6"
      >
        {/* Top bar */}
        <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="수정하기"
                onClick={() => router.push(`/diary/${id}/edit`)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="삭제하기"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Date + grade headline */}
        <motion.div variants={fadeSlideUp} className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          {grade !== null && (
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold text-foreground">
                {COPY.GRADE_HEADLINE[grade]}
              </h1>
              {score !== null && (
                <span className="text-sm font-medium text-muted-foreground">
                  {score.toFixed(1)}점
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Photo grid */}
        {images.length > 0 && (
          <motion.div
            variants={fadeSlideUp}
            className="grid grid-cols-3 gap-2"
          >
            {images.map((img, idx) => (
              <div
                key={`${img.type}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  src={img.thumbnailUrl || img.url}
                  alt={COPY.A11Y_SCALP_PHOTO}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 200px"
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Checklist pills */}
        {checkedItems.length > 0 && (
          <motion.div variants={fadeSlideUp} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              체크리스트
            </p>
            <div className="flex flex-wrap gap-2">
              {checkedItems.map((c) => (
                <span
                  key={`${c.category}-${c.item}`}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {c.item}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Memo */}
        {entry.memo && (
          <motion.div variants={fadeSlideUp} className="rounded-xl bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {COPY.DIARY_MEMO_LABEL}
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{entry.memo}</p>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
