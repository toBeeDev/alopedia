"use client";

import { useState, useEffect, useCallback, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Loader2, Download, X, Share2 } from "lucide-react";
import Link from "next/link";
import { drawResultCard } from "@/lib/share/drawResultCard";
import { downloadResultImage } from "@/lib/share/shareResult";
import { shareViaKakao } from "@/lib/share/kakaoShare";
import { generateKakaoShareContent } from "@/lib/utils/shareContent";
import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail } from "@/types/database";

interface ShareButtonsProps {
  grade: number;
  score: number;
  details: AnalysisDetail;
  createdAt: string;
  onBoardShare: () => void;
  boardShared: boolean;
}

/** 카카오톡 말풍선 아이콘 (공식 가이드 기반) */
function KakaoIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.724 1.8 5.113 4.508 6.459-.2.744-.723 2.694-.828 3.112-.13.518.19.51.4.372.163-.108 2.6-1.768 3.657-2.485.727.104 1.478.16 2.263.16 5.523 0 10-3.463 10-7.618C22 6.463 17.523 3 12 3" />
    </svg>
  );
}

export default function ShareButtons({
  grade,
  score,
  details,
  createdAt,
  onBoardShare,
  boardShared,
}: ShareButtonsProps): ReactElement {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Object URL 생성/해제
  useEffect(() => {
    if (previewBlob) {
      const url = URL.createObjectURL(previewBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [previewBlob]);

  async function handleImageShare(): Promise<void> {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const config = getGradeConfig(grade);
      const blob = await drawResultCard({
        grade,
        score,
        eagleLabel: config.eagleLabel,
        color: config.color,
        areaScores: details.areaScores,
        createdAt,
      });
      setPreviewBlob(blob);
      setShowModal(true);
    } catch {
      // Retry possible by clicking again
    } finally {
      setIsGenerating(false);
    }
  }

  function closeModal(): void {
    setShowModal(false);
    setDownloaded(false);
  }

  const handleDownload = useCallback(async (): Promise<void> => {
    if (!previewBlob) return;
    await downloadResultImage(previewBlob);
    setDownloaded(true);
  }, [previewBlob]);

  const handleKakaoShare = useCallback(async (): Promise<void> => {
    if (!previewBlob) return;
    try {
      const kakaoContent = generateKakaoShareContent(grade);
      await shareViaKakao({
        blob: previewBlob,
        title: kakaoContent.title,
        description: kakaoContent.description,
      });
    } catch {
      // SDK 미초기화 등 — 무시
    }
  }, [previewBlob, grade]);

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {/* 분석 결과 이미지 공유 */}
        <button
          onClick={handleImageShare}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-4 text-sm font-semibold text-background shadow-md shadow-black/10 transition-all hover:bg-foreground/85 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              {COPY.SHARE_IMAGE_GENERATING}
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" strokeWidth={2} />
              {COPY.SHARE_IMAGE_CTA}
            </>
          )}
        </button>

        {/* 게시판 글 올리기 */}
        {boardShared ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-6 py-4 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            <span>게시판에 공유됐어요!</span>
            <Link
              href="/board"
              className="underline underline-offset-2 hover:text-emerald-900 dark:hover:text-emerald-300"
            >
              게시판으로 이동
            </Link>
          </motion.div>
        ) : (
          <button
            onClick={onBoardShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-6 py-4 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition-all hover:bg-accent active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            {COPY.SHARE_BOARD_CTA}
          </button>
        )}
      </div>

      {/* 이미지 미리보기 모달 */}
      <AnimatePresence>
        {showModal && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="relative flex w-full max-w-sm flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 — 카드 바깥 상단 */}
              <button
                onClick={closeModal}
                className="mb-3 self-end rounded-full bg-white/15 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/25 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-full rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900">
                {/* 이미지 미리보기 */}
                <div className="w-full overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="분석 결과 이미지"
                    className="w-full"
                  />
                </div>

                {/* 공유 버튼 */}
                <div className="mt-4 flex w-full gap-2">
                  <button
                    onClick={handleKakaoShare}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-semibold text-[#191919] transition-all hover:bg-[#FDD835] active:scale-[0.98]"
                  >
                    <KakaoIcon className="h-4.5 w-4.5" />
                    {COPY.KAKAO_SHARE_CTA}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-200 active:scale-[0.98] dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    {downloaded ? "저장됨" : "이미지 저장"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
