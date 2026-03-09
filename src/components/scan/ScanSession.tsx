"use client";

import { useCallback, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, RotateCcw, Scan, Camera, ImagePlus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useScanSessionStore } from "@/stores/scanSession";
import { COPY } from "@/constants/copy";
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
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="mx-auto w-full max-w-lg px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6161FF]/10">
            <Scan className="h-7 w-7 text-[#6161FF]" />
          </div>
          <h1 className="text-xl font-bold text-[#323338]">두피 사진 업로드</h1>
          <p className="mt-2 text-sm text-[#676879]">
            두피 사진을 촬영하거나 갤러리에서 선택해주세요.
          </p>
        </motion.div>

        {/* Upload card */}
        <motion.div variants={fadeSlideUp} initial="hidden" animate="visible">
          <div className="rounded-2xl bg-white shadow-sm">
            {/* Tips */}
            <div className="border-b border-[#F5F5F7] px-5 py-4">
              <p className="mb-2 text-xs font-semibold text-[#323338]">
                촬영 가이드
              </p>
              <div className="flex flex-col gap-1.5">
                {TIPS.map((tip) => (
                  <div key={tip.emoji} className="flex items-center gap-2 text-xs text-[#676879]">
                    <span>{tip.emoji}</span>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop zone + previews */}
            <div className="p-4" onDragOver={onDragOver} onDrop={onDrop}>
              {images.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-[#E0E0E0] bg-[#FAFAFA] p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F0F5]">
                    <Upload className="h-5 w-5 text-[#9DA0AE]" />
                  </div>
                  <p className="text-sm font-medium text-[#676879]">
                    사진을 드래그하거나 아래 버튼으로 추가
                  </p>
                  <p className="mt-1 text-xs text-[#9DA0AE]">
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
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="삭제"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add more */}
                  {!isFull && (
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#E0E0E0] bg-[#FAFAFA] text-[#9DA0AE] transition-colors hover:border-[#6161FF] hover:text-[#6161FF]">
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
                <p className="mt-2 text-right text-xs text-[#9DA0AE]">
                  {images.length}/{MAX_IMAGES}장
                </p>
              )}

              {/* Action buttons */}
              {!isFull && (
                <div className="mt-3 flex gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6161FF] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4338ca] active:scale-[0.98]">
                    <Camera className="h-4 w-4" />
                    촬영하기
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleFiles(Array.from(e.target.files));
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F5F5F7] px-4 py-2.5 text-sm font-semibold text-[#676879] transition-colors hover:bg-[#EEEFF2] active:scale-[0.98]">
                    <ImagePlus className="h-4 w-4" />
                    갤러리
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
            animate={{ opacity: canSubmit ? 1 : 0.4 }}
            disabled={!canSubmit}
            onClick={() => router.push("/scan/uploading")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6161FF] py-4 text-base font-semibold text-white shadow-lg shadow-[#6161FF]/25 transition-all hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Upload className="h-5 w-5" />
            AI 분석 시작하기
          </motion.button>

          {images.length > 0 && (
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 py-3 text-sm text-[#676879] transition-colors hover:text-[#323338]"
            >
              <RotateCcw className="h-4 w-4" />
              전체 초기화
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#9DA0AE]">
          {COPY.DISCLAIMER_SHORT}
        </p>
      </div>
    </div>
  );
}
