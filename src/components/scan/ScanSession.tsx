"use client";

import { useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, RotateCcw, Scan, ImagePlus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useScanSessionStore } from "@/stores/scanSession";
import { useDailyRemaining } from "@/hooks/useDailyRemaining";
import { fadeSlideUp } from "@/lib/motion";
import type { CapturedImage, AllowedMimeType } from "@/types/scan";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, MAX_IMAGES, MIN_IMAGES } from "@/types/scan";

const TIPS = [
  { emoji: "🔵", text: "정수리 — 꼭대기를 내려다보는 각도" },
  { emoji: "🟢", text: "전면이마 — 헤어라인이 보이는 정면" },
  { emoji: "🟡", text: "측면이마 — 관자놀이 부근 측면" },
];

function createCapturedImage(file: File): Promise<CapturedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = (): void => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        blob: file,
        previewUrl: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = (): void => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러올 수 없습니다."));
    };
    img.src = url;
  });
}

export default function ScanSession(): ReactElement {
  const router = useRouter();
  const { images, addImages, removeImage, reset } = useScanSessionStore();
  const { data: dailyData } = useDailyRemaining();
  const isLimitReached = dailyData?.remaining === 0;

  const isFull = images.length >= MAX_IMAGES;
  const canSubmit = images.length >= MIN_IMAGES;

  const handleFiles = useCallback(
    async (files: File[]): Promise<void> => {
      const valid = files.filter((file) => {
        if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
          alert("JPEG, PNG, WebP 이미지만 업로드할 수 있어요.");
          return false;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          alert("10MB 이하의 이미지만 업로드할 수 있어요.");
          return false;
        }
        return true;
      });
      if (valid.length === 0) return;

      try {
        const captured = await Promise.all(valid.map(createCapturedImage));
        addImages(captured);
      } catch {
        alert("이미지를 불러올 수 없습니다.");
      }
    },
    [addImages],
  );

  const handleRemove = useCallback(
    (id: string): void => {
      const img = images.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      removeImage(id);
    },
    [images, removeImage],
  );

  function handleReset(): void {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    reset();
  }

  /* Drag & drop */
  function onDragOver(e: React.DragEvent): void {
    e.preventDefault();
  }
  function onDrop(e: React.DragEvent): void {
    e.preventDefault();
    if (!isFull) handleFiles(Array.from(e.dataTransfer.files));
  }

  return (
    <div className="flex flex-col bg-background">
      <div className="mx-auto w-full max-w-lg px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/10">
            <Scan className="h-7 w-7 text-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">두피 사진 업로드</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            두피 사진을 선택해서 업로드해주세요.
          </p>
          {dailyData && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 ring-1 ring-border">
              <span
                className={`text-xs font-bold ${
                  dailyData.remaining > 0
                    ? "text-foreground"
                    : "text-destructive"
                }`}
              >
                오늘 {dailyData.remaining}/{dailyData.limit}회 남음
              </span>
            </div>
          )}
        </motion.div>

        {/* Upload card */}
        <motion.div variants={fadeSlideUp} initial="hidden" animate="visible">
          <div className="rounded-2xl bg-card shadow-sm">
            {/* Tips */}
            <div className="border-b border-accent px-5 py-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  촬영 가이드
                </p>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-foreground/60">
                  필수 {MIN_IMAGES}장
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {TIPS.map((tip, idx) => (
                  <div key={tip.emoji} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{tip.emoji}</span>
                    <span>{tip.text}</span>
                    {idx < MIN_IMAGES && (
                      <span className="text-[10px] font-medium text-foreground/40">필수</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground/60">
                위 순서대로 {MIN_IMAGES}장을 업로드하면 AI가 더 정확하게 분석해요.
              </p>
            </div>

            {/* Drop zone + previews */}
            <div className="p-4" onDragOver={onDragOver} onDrop={onDrop}>
              {images.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                    <Upload className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    사진을 드래그하거나 아래 버튼으로 추가
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    JPG, PNG, WebP · 최대 10MB · 최대 {MAX_IMAGES}장
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <AnimatePresence mode="popLayout">
                    {images.map((img) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="group relative aspect-square overflow-hidden rounded-xl"
                      >
                        <Image
                          src={img.previewUrl}
                          alt="두피 이미지"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => handleRemove(img.id)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label="삭제"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add more */}
                  {!isFull && (
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground/70 transition-colors hover:border-foreground hover:text-foreground">
                      <ImagePlus className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleFiles(Array.from(e.target.files));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Counter */}
              {images.length > 0 && (
                <p className="mt-2 text-right text-xs text-muted-foreground/70">
                  {images.length}/{MAX_IMAGES}장
                </p>
              )}

              {/* Action button */}
              {!isFull && (
                <div className="mt-3">
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 active:scale-[0.98]">
                    <ImagePlus className="h-4 w-4" />
                    사진 선택하기
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleFiles(Array.from(e.target.files));
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mt-8 space-y-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: canSubmit && !isLimitReached ? 1 : 0.4 }}
            disabled={!canSubmit || isLimitReached}
            onClick={() => router.push("/scan/uploading")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-semibold text-background shadow-lg shadow-black/15 transition-all hover:bg-foreground/85 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Upload className="h-5 w-5" />
            {isLimitReached
              ? "오늘 분석 횟수를 모두 사용했어요"
              : "AI 분석 시작하기"}
          </motion.button>

          {images.length > 0 && (
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              전체 초기화
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
