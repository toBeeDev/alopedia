"use client";

import { useState, useRef, useEffect, type ReactElement } from "react";
import Image from "next/image";
import { X, ImagePlus, Loader2, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COPY } from "@/constants/copy";
import { MEDICATION_CATEGORIES, PROCEDURE_CATEGORIES } from "@/constants/medications";
import { compressImage } from "@/lib/image/compressClient";

export interface WritePostData {
  board: string;
  title: string;
  content: string;
  images?: { url: string; thumbnailUrl: string }[];
  medication?: string;
  procedure?: string;
}

interface PreviewImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface WritePostModalProps {
  onClose: () => void;
  onSubmit: (data: WritePostData) => void;
  initial?: { board: string; title: string; content: string };
}

const MAX_IMAGES = 5;

/* ── 커스텀 드롭다운 ── */
interface DropdownOption {
  value: string;
  label: string;
  group?: string;
}

function CustomSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  maxHeight = "max-h-52",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  maxHeight?: string;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  // 그룹 헤더 렌더링을 위한 이전 그룹 추적
  let lastGroup = "";

  return (
    <div ref={ref} className="relative mb-4">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm outline-none transition-colors focus:border-foreground"
      >
        <span className={selectedLabel ? "text-foreground" : "text-muted-foreground/50"}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 right-0 z-50 mt-1.5 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg ${maxHeight}`}
          >
            <div className="p-1">
              {options.map((opt) => {
                const showGroup = opt.group && opt.group !== lastGroup;
                if (opt.group) lastGroup = opt.group;
                return (
                  <div key={opt.value}>
                    {showGroup && (
                      <div className="px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/60">
                        {opt.group}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                        value === opt.value
                          ? "font-medium text-foreground"
                          : "text-foreground/80"
                      }`}
                    >
                      <span className="flex-1">{opt.label}</span>
                      {value === opt.value && (
                        <Check className="h-3.5 w-3.5 text-foreground" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 탈모약 옵션 빌드 */
const MEDICATION_OPTIONS: DropdownOption[] = MEDICATION_CATEGORIES.flatMap(
  (cat) =>
    cat.drugs.map((drug) => ({
      value: drug,
      label: drug,
      group: cat.label,
    })),
);

/* 시술 유형 옵션 빌드 */
const PROCEDURE_OPTIONS: DropdownOption[] = PROCEDURE_CATEGORIES.map((cat) => ({
  value: cat.label,
  label: cat.label,
}));

export default function WritePostModal({
  onClose,
  onSubmit,
  initial,
}: WritePostModalProps): ReactElement {
  const isEdit = !!initial;
  const [board, setBoard] = useState(initial?.board ?? "lounge");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [error, setError] = useState("");
  const [medication, setMedication] = useState("");
  const [procedure, setProcedure] = useState("");
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleAddImages(files: FileList | null): void {
    if (!files) return;
    const remaining = MAX_IMAGES - previewImages.length;
    const newFiles = Array.from(files).slice(0, remaining);

    const newPreviews = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPreviewImages((prev) => [...prev, ...newPreviews]);
  }

  function handleRemoveImage(id: string): void {
    setPreviewImages((prev) => {
      const img = prev.find((p) => p.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleSubmit(): Promise<void> {
    if (title.trim().length < 2) {
      setError("제목은 2자 이상 입력해주세요.");
      return;
    }
    if (content.trim().length < 10) {
      setError("내용은 10자 이상 입력해주세요.");
      return;
    }
    if (board === "medication_review" && !medication) {
      setError("탈모약을 선택해주세요.");
      return;
    }
    if (board === "procedure_review" && !procedure) {
      setError("시술 유형을 선택해주세요.");
      return;
    }
    let uploadedImages: { url: string; thumbnailUrl: string }[] | undefined;

    if (previewImages.length > 0) {
      setUploading(true);
      setError("");
      try {
        const formData = new FormData();
        for (const img of previewImages) {
          const compressed = await compressImage(img.file, {
            maxWidth: 1280,
            maxHeight: 1280,
            quality: 0.8,
          });
          formData.append("images", compressed, `${img.id}.jpg`);
        }

        const res = await fetch("/api/board/images", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "이미지 업로드에 실패했어요.");
          setUploading(false);
          return;
        }

        const data = await res.json();
        uploadedImages = data.images;
      } catch {
        setError("이미지 업로드 중 오류가 발생했어요.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSubmit({
      board,
      title,
      content,
      images: uploadedImages,
      medication: board === "medication_review" ? medication : undefined,
      procedure: board === "procedure_review" ? procedure : undefined,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {isEdit ? "글 수정" : "글쓰기"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {Object.entries(COPY.BOARD_NAME).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setBoard(key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                board === key
                  ? "bg-foreground text-background"
                  : "bg-accent text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탈모약 선택 (medication_review 전용) */}
        {board === "medication_review" && (
          <CustomSelect
            label="복용/사용 중인 약 선택"
            placeholder="약을 선택해주세요"
            value={medication}
            onChange={setMedication}
            options={MEDICATION_OPTIONS}
            maxHeight="max-h-52"
          />
        )}

        {/* 시술 유형 선택 (procedure_review 전용) */}
        {board === "procedure_review" && (
          <CustomSelect
            label="시술 유형 선택"
            placeholder="유형을 선택해주세요"
            value={procedure}
            onChange={setProcedure}
            options={PROCEDURE_OPTIONS}
          />
        )}

        <input
          type="text"
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="mb-3 w-full rounded-xl border border-border px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
        />

        <textarea
          placeholder="내용을 입력해주세요 (10자 이상)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={6}
          className="mb-3 w-full resize-none rounded-xl border border-border px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
        />

        {/* 이미지 첨부 */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {previewImages.map((img) => (
              <div
                key={img.id}
                className="group relative h-16 w-16 overflow-hidden rounded-lg"
              >
                <Image
                  src={img.previewUrl}
                  alt="첨부 이미지"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {previewImages.length < MAX_IMAGES && (
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground/50 transition-colors hover:border-foreground hover:text-foreground">
                <ImagePlus className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAddImages(e.target.files)}
                />
              </label>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground/50">
            이미지 최대 {MAX_IMAGES}장 · JPG, PNG, WebP
          </p>
        </div>

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-md shadow-black/15 transition-all hover:bg-foreground/85 active:scale-95 disabled:opacity-50"
          >
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploading ? "업로드 중..." : isEdit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
