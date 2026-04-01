"use client";

import { use, useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { COPY } from "@/constants/copy";
import { useDiaryEntry, useUpdateDiaryEntry } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import DiaryEntryForm from "@/components/diary/DiaryEntryForm";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import type { ChecklistState } from "@/components/diary/DiaryEntryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default function DiaryEditPage({ params }: Props): ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading } = useDiaryEntry(id);
  const { mutateAsync, isPending } = useUpdateDiaryEntry();

  const entry = data?.entry ?? null;
  const isOwner = !!user && !!entry && user.id === entry.userId;
  const images = entry?.scan?.images ?? [];
  const [previewBlur, setPreviewBlur] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && !isLoading && entry && !isOwner) {
      router.replace("/diary");
    }
  }, [authLoading, isLoading, entry, isOwner, router]);

  async function handleSubmit(data: {
    title: string;
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    blurLevel: "none" | "low" | "medium" | "high";
    checklists: { category: string; item: string; checked: boolean }[];
  }): Promise<void> {
    const result = await mutateAsync({ id, ...data });
    toast.success(COPY.DIARY_ENTRY_UPDATED);
    const updated = (result as { entry?: { slug?: string } })?.entry;
    router.push(`/diary/${updated?.slug ?? id}`);
  }

  if (authLoading || isLoading || !user) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      </PageContainer>
    );
  }

  if (!entry || !isOwner) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">기록을 찾을 수 없어요.</p>
        </div>
      </PageContainer>
    );
  }

  const initialChecklists: ChecklistState[] = (entry.checklists ?? []).map((c) => ({
    category: c.category,
    item: c.item,
    checked: c.checked,
  }));

  const formattedDate = new Date(entry.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageContainer>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 py-6"
      >
        {/* Top bar */}
        <motion.div variants={fadeSlideUp} className="flex items-center gap-3">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{COPY.DIARY_EDIT_CTA}</h1>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </motion.div>

        {/* Scan photo preview (read-only) */}
        {images.length > 0 && (
          <motion.div variants={fadeSlideUp} className="flex gap-2">
            {images.map((img, idx) => (
              <div
                key={`${img.type}-${idx}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  src={img.thumbnailUrl || img.url}
                  alt={COPY.A11Y_SCALP_PHOTO}
                  fill
                  className={`object-cover transition-all duration-300 ${previewBlur}`}
                  sizes="80px"
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Edit form */}
        <DiaryEntryForm
          initialData={{
            title: entry.title ?? "",
            memo: entry.memo ?? "",
            isPublic: entry.isPublic,
            isPhotoPublic: entry.isPhotoPublic,
            blurLevel: entry.blurLevel ?? "medium",
            checklists: initialChecklists,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="수정 완료"
          onBlurChange={(level) => {
            if (level === "none") {
              setPreviewBlur("");
            } else {
              setPreviewBlur(
                level === "low" ? "blur-sm" : level === "high" ? "blur-2xl" : "blur-lg",
              );
            }
          }}
        />
      </motion.div>
    </PageContainer>
  );
}
