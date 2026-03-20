"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Upload, RotateCcw, ImagePlus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useScanSessionStore } from "@/stores/scanSession";
import { hasGuestUsed } from "@/lib/guest/guestLimit";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { CrownAreaIcon, FrontAreaIcon, SideAreaIcon } from "@/components/ui/scan-area-icons";
import { toast } from "sonner";
import { COPY } from "@/constants/copy";
import { fadeSlideUp } from "@/lib/motion";
import type { CapturedImage, AllowedMimeType } from "@/types/scan";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, MAX_IMAGES, MIN_IMAGES } from "@/types/scan";

const TIPS = [
  { icon: CrownAreaIcon, text: COPY.SCAN_TIP_CROWN },
  { icon: FrontAreaIcon, text: COPY.SCAN_TIP_FRONT },
  { icon: SideAreaIcon, text: COPY.SCAN_TIP_SIDE },
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

export default function GuestTryPage(): ReactElement {
  const router = useRouter();
  const { images, addImages, removeImage, reset } = useScanSessionStore();
  const [alreadyUsed, setAlreadyUsed] = useState(false);

  useEffect(() => {
    setAlreadyUsed(hasGuestUsed());
  }, []);

  const isFull = images.length >= MAX_IMAGES;
  const canSubmit = images.length >= MIN_IMAGES;

  const handleFiles = useCallback(
    async (files: File[]): Promise<void> => {
      const valid = files.filter((file) => {
        if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
          toast.error(COPY.SCAN_UPLOAD_INVALID_TYPE);
          return false;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(COPY.SCAN_UPLOAD_TOO_LARGE);
          return false;
        }
        return true;
      });
      if (valid.length === 0) return;

      try {
        const captured = await Promise.all(valid.map(createCapturedImage));
        addImages(captured);
      } catch {
        toast.error(COPY.SCAN_UPLOAD_LOAD_ERROR);
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

  function onDragOver(e: React.DragEvent): void {
    e.preventDefault();
  }

  function onDrop(e: React.DragEvent): void {
    e.preventDefault();
    if (!isFull) handleFiles(Array.from(e.dataTransfer.files));
  }

  // Already used: show signup CTA
  if (alreadyUsed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <EagleIcon grade={2} size={56} />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {COPY.GUEST_ALREADY_USED}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {COPY.GUEST_ALREADY_USED_DESC}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-bold text-background shadow-lg shadow-black/15 transition-all hover:bg-foreground/85 active:scale-[0.98]"
          >
            <EagleIcon grade={1} size={20} />
            {COPY.GUEST_SIGNUP_CTA}
          </Link>
        </div>
      </div>
    );
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
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center">
            <EagleIcon grade={1} size={56} />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {COPY.GUEST_HERO_TITLE}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {COPY.GUEST_HERO_DESC}
          </p>
        </motion.div>

        {/* Upload card */}
        <motion.div variants={fadeSlideUp} initial="hidden" animate="visible">
          <div className="rounded-2xl bg-card shadow-sm">
            {/* Tips */}
            <div className="border-b border-accent px-5 py-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  {COPY.SCAN_GUIDE_LABEL}
                </p>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-foreground/60">
                  {COPY.SCAN_REQUIRED_BADGE(MIN_IMAGES)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {TIPS.map((tip) => (
                  <div key={tip.text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <tip.icon size={24} className="shrink-0" />
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-lg bg-foreground/5 px-3 py-2 text-center text-[11px] font-medium leading-relaxed text-foreground/70">
                {COPY.SCAN_AUTO_DETECT(MIN_IMAGES)}
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
                    {COPY.SCAN_DROP_HINT}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {COPY.SCAN_FILE_SPEC(MAX_IMAGES)}
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
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
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
                  {COPY.SCAN_COUNTER(images.length, MAX_IMAGES)}
                </p>
              )}

              {/* Action button */}
              {!isFull && (
                <div className="mt-3">
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 active:scale-[0.98]">
                    <ImagePlus className="h-4 w-4" />
                    {COPY.SCAN_SELECT_PHOTOS}
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
            onClick={() => router.push("/try/analyzing")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-semibold text-background shadow-lg shadow-black/15 transition-all hover:bg-foreground/85 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Upload className="h-5 w-5" />
            {COPY.SCAN_START_ANALYSIS}
          </motion.button>

          {images.length > 0 && (
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              {COPY.SCAN_RESET}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          {COPY.DISCLAIMER_SHORT}
        </p>
      </div>
    </div>
  );
}
