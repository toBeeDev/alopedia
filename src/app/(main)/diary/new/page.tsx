"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, CheckCircle2 } from "lucide-react";
import { COPY } from "@/constants/copy";
import { useCreateDiaryEntry } from "@/hooks/useDiary";
import { useScanSessionStore } from "@/stores/scanSession";
import { compressImage } from "@/lib/image/compressClient";
import DiaryEntryForm from "@/components/diary/DiaryEntryForm";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const ScanSession = dynamic(
  () => import("@/components/scan/ScanSession"),
  { ssr: false },
);

/** Vercel Serverless Function body 제한 (4.5MB) */
const VERCEL_BODY_LIMIT = 4.5 * 1024 * 1024;

export default function DiaryNewPage(): ReactElement {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateDiaryEntry();
  const { images } = useScanSessionStore();

  const [scanId, setScanId] = useState<string | undefined>(undefined);
  const [scanUploading, setScanUploading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const hasPhotos = images.length > 0;

  /** Upload captured photos to /api/scans and return the scan id */
  async function uploadScanPhotos(): Promise<string | undefined> {
    if (images.length === 0) return undefined;
    if (scanId) return scanId;

    setScanUploading(true);
    try {
      const formData = new FormData();
      const compressedBlobs: Blob[] = [];

      await Promise.all(
        images.map(async (img, i) => {
          const key = `photo_${i}`;
          const file =
            img.blob instanceof File
              ? img.blob
              : new File([img.blob], `${key}.jpg`, { type: "image/jpeg" });
          const compressed = await compressImage(file);
          compressedBlobs.push(compressed);
          formData.append(key, compressed, `${key}.jpg`);
        }),
      );

      const totalSize = compressedBlobs.reduce((sum, b) => sum + b.size, 0);
      if (totalSize > VERCEL_BODY_LIMIT) {
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);
        throw new Error(
          `압축 후에도 이미지 총 용량(${sizeMB}MB)이 너무 커요. 더 작은 사진으로 다시 시도해주세요.`,
        );
      }

      const uploadRes = await fetch("/api/scans", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "사진 업로드에 실패했어요.");
      }

      const { scan } = (await uploadRes.json()) as { scan: { id: string } };
      setScanId(scan.id);
      return scan.id;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "사진 업로드에 실패했어요.");
      return undefined;
    } finally {
      setScanUploading(false);
    }
  }

  async function handleSubmit(data: {
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    checklists: { category: string; item: string; checked: boolean }[];
  }): Promise<void> {
    // Upload photos first (if any were captured)
    const resolvedScanId = await uploadScanPhotos();

    await mutateAsync({ ...data, date: today, scanId: resolvedScanId });
    toast.success(COPY.DIARY_ENTRY_SAVED);
    router.push("/diary");
  }

  const isSubmitting = isPending || scanUploading;

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

        {/* Scan section */}
        <motion.div variants={fadeSlideUp} className="flex flex-col gap-3">
          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setShowScanner((prev) => !prev)}
            className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
          >
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              두피 사진 첨부 (선택)
            </span>
            <span className="flex items-center gap-1.5">
              {hasPhotos ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-600">
                    {images.length}장 선택됨
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {showScanner ? "접기" : "열기"}
                </span>
              )}
            </span>
          </button>

          {/* ScanSession panel */}
          {showScanner && (
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              {/* Contextual note */}
              <div className="border-b border-border bg-muted/40 px-4 py-2.5">
                <p className="text-xs text-muted-foreground">
                  사진을 선택하면 일기 저장 시 함께 업로드됩니다.{" "}
                  <span className="font-medium text-foreground/70">
                    AI 분석은 별도 스캔 메뉴에서 진행할 수 있어요.
                  </span>
                </p>
              </div>
              <ScanSession />
            </div>
          )}
        </motion.div>

        {/* Form */}
        <DiaryEntryForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={COPY.DIARY_ADD_CTA}
        />
      </motion.div>
    </PageContainer>
  );
}
