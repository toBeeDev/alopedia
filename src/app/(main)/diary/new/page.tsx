"use client";

import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { COPY } from "@/constants/copy";
import { useCreateDiaryEntry } from "@/hooks/useDiary";
import DiaryEntryForm from "@/components/diary/DiaryEntryForm";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

export default function DiaryNewPage(): ReactElement {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateDiaryEntry();

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(data: {
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    checklists: { category: string; item: string; checked: boolean }[];
  }): Promise<void> {
    await mutateAsync({ ...data, date: today });
    toast.success(COPY.DIARY_ENTRY_SAVED);
    router.push("/diary");
  }

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
          {COPY.DIARY_ADD_CTA}
        </motion.h1>

        {/* Scan section placeholder */}
        <motion.div
          variants={fadeSlideUp}
          className="rounded-2xl border-2 border-dashed border-border p-8 flex items-center justify-center"
        >
          <p className="text-sm text-muted-foreground text-center">
            사진 촬영 + AI 분석 (스캔 연동 예정)
          </p>
        </motion.div>

        {/* Form */}
        <DiaryEntryForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel={COPY.DIARY_ADD_CTA}
        />
      </motion.div>
    </PageContainer>
  );
}
