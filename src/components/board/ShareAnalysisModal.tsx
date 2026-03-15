"use client";

import { useState, useMemo, type ReactElement } from "react";
import Image from "next/image";
import { X, Share2, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { COPY } from "@/constants/copy";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { generateShareContent } from "@/lib/utils/shareContent";
import type { AnalysisDetail, ScanImage, BoardType } from "@/types/database";

export interface ShareAnalysisInput {
  scanId: string;
  norwoodGrade: number;
  score: number;
  details: AnalysisDetail;
  images: ScanImage[];
}

interface ShareAnalysisModalProps {
  data: ShareAnalysisInput;
  onClose: () => void;
  onSubmit: (payload: {
    board: BoardType;
    title: string;
    content: string;
    tags: string[];
    scanId: string;
    norwoodGrade: number;
    score: number;
    images?: Record<string, unknown>[];
    deletePin: string;
  }) => void;
}

export default function ShareAnalysisModal({
  data,
  onClose,
  onSubmit,
}: ShareAnalysisModalProps): ReactElement {
  const generated = useMemo(
    () =>
      generateShareContent({
        norwoodGrade: data.norwoodGrade,
        score: data.score,
        details: data.details,
      }),
    [data],
  );

  const gradeConfig = getGradeConfig(data.norwoodGrade);

  const [board, setBoard] = useState<string>("lounge");
  const [title, setTitle] = useState(generated.title);
  const [content, setContent] = useState(generated.content);
  const [includeImages, setIncludeImages] = useState(false);
  const [deletePin, setDeletePin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(): void {
    if (title.trim().length < 2) {
      setError("제목은 2자 이상 입력해주세요.");
      return;
    }
    if (content.trim().length < 10) {
      setError("내용은 10자 이상 입력해주세요.");
      return;
    }
    if (!/^\d{4}$/.test(deletePin)) {
      setError("삭제 비밀번호는 숫자 4자리로 입력해주세요.");
      return;
    }

    onSubmit({
      board: board as BoardType,
      title,
      content,
      tags: generated.tags,
      scanId: data.scanId,
      norwoodGrade: data.norwoodGrade,
      score: data.score,
      images: includeImages
        ? data.images.map((img) => ({
            type: img.type,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
          }))
        : undefined,
      deletePin,
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
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-foreground" />
            <h2 className="text-base font-bold text-foreground">
              {COPY.SHARE_ANALYSIS_TITLE}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        {/* 분석 미리보기 */}
        <div
          className="mb-5 rounded-xl p-4"
          style={{ backgroundColor: `${gradeConfig.color}10` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${gradeConfig.color}20` }}
            >
              <EagleIcon grade={data.norwoodGrade} size={32} />
            </div>
            <div>
              <p
                className="text-base font-bold"
                style={{ color: gradeConfig.color }}
              >
                {gradeConfig.eagleLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.score.toFixed(1)}점 · {data.norwoodGrade}단계
              </p>
            </div>
          </div>
        </div>

        {/* 게시판 선택 */}
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
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

        {/* 제목 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
        />

        {/* 내용 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={8}
          className="mb-3 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
        />

        {/* 사진 포함 토글 */}
        {data.images.length > 0 && (
          <div className="mb-4 rounded-xl border border-border p-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {COPY.SHARE_ANALYSIS_INCLUDE_IMAGES}
                </span>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors ${includeImages ? "bg-foreground" : "bg-border"}`}
                onClick={() => setIncludeImages(!includeImages)}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${includeImages ? "translate-x-[22px]" : "translate-x-0.5"}`}
                />
              </div>
            </label>

            {includeImages && (
              <>
                <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
                  {data.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                    >
                      <Image
                        src={img.thumbnailUrl}
                        alt={`두피 사진 ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground/70">
                  {COPY.SHARE_ANALYSIS_IMAGE_WARNING}
                </p>
              </>
            )}
          </div>
        )}

        {/* 삭제 비밀번호 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            삭제 비밀번호 (숫자 4자리)
          </label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={deletePin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setDeletePin(v);
            }}
            maxLength={4}
            className="w-32 rounded-xl border border-border bg-background px-4 py-3 text-center text-sm tracking-[0.3em] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
          />
        </div>

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        {/* 액션 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-md shadow-black/15 transition-all hover:bg-foreground/85 active:scale-95"
          >
            {COPY.SHARE_ANALYSIS_CTA}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
