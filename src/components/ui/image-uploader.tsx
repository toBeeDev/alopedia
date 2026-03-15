"use client";

import * as React from "react";
import { Upload, X, Camera, ImagePlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  /** Preview URLs with IDs for removal. */
  images: { id: string; url: string }[];
  /** Callback when new files are selected (camera or gallery). */
  onAdd: (files: File[]) => void;
  /** Callback to remove an image by ID. */
  onRemove: (id: string) => void;
  /** Maximum number of images allowed. Defaults to 3. */
  maxImages?: number;
  /** Zone label (e.g., "정수리"). */
  label: string;
  /** Zone description / guideline. */
  description: string;
  /** Emoji or icon indicator. */
  indicator: React.ReactNode;
  /** Accepted file types. */
  accept?: string;
  /** Additional className. */
  className?: string;
}

export function ImageUploader({
  images,
  onAdd,
  onRemove,
  maxImages = 3,
  label,
  description,
  indicator,
  accept = "image/jpeg,image/png,image/webp",
  className,
}: ImageUploaderProps): React.ReactElement {
  const [isDragging, setIsDragging] = React.useState(false);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const galleryRef = React.useRef<HTMLInputElement>(null);

  const isFull = images.length >= maxImages;

  function handleFiles(fileList: FileList | null): void {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length > 0) onAdd(files);
  }

  function handleDragEnter(e: React.DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (!isFull) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDragOver(e: React.DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isFull) handleFiles(e.dataTransfer.files);
  }

  return (
    <div className={cn("rounded-2xl bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F7] text-lg">
          {indicator}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#323338]">{label}</p>
          <p className="text-xs text-[#676879]">{description}</p>
        </div>
        <span className="text-xs font-medium text-[#9DA0AE]">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* Drop zone / Previews */}
      <div className="p-4">
        {images.length === 0 ? (
          /* Empty state — drag & drop zone */
          <div
            className={cn(
              "rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200",
              isDragging
                ? "border-foreground bg-foreground/5"
                : "border-[#E0E0E0] bg-[#FAFAFA]",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F0F5]">
                <Upload className="h-5 w-5 text-[#9DA0AE]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#676879]">
                  사진을 드래그하거나 아래 버튼으로 추가
                </p>
                <p className="mt-0.5 text-xs text-[#9DA0AE]">
                  JPG, PNG, WebP · 최대 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Image previews */
          <div
            className={cn(
              "rounded-xl transition-colors duration-200",
              isDragging && !isFull && "ring-2 ring-foreground ring-offset-2",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
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
                      src={img.url}
                      alt={`${label} 이미지`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => onRemove(img.id)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="삭제"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add more slot */}
              {!isFull && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => galleryRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-[#E0E0E0] bg-[#FAFAFA] text-[#9DA0AE] transition-colors hover:border-foreground hover:text-foreground"
                >
                  <ImagePlus className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!isFull && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-white transition-colors hover:bg-foreground/85 active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" />
              촬영하기
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5F5F7] px-4 py-2.5 text-sm font-semibold text-[#676879] transition-colors hover:bg-[#EEEFF2] active:scale-[0.98]"
            >
              <ImagePlus className="h-4 w-4" />
              갤러리
            </button>
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={galleryRef}
        type="file"
        accept={accept}
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
