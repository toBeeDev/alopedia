"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import ResultCard from "@/components/analysis/ResultCard";
import FeedbackButtons from "@/components/analysis/FeedbackButtons";
import { COPY } from "@/constants/copy";
import { useCreatePost } from "@/hooks/useBoardPosts";
import type { AnalysisDetail, ScanImage, BoardType } from "@/types/database";
import type { ScanWithAnalysis } from "@/hooks/useScanHistory";

const ShareButtons = dynamic(
  () => import("@/components/analysis/ShareButtons"),
  { ssr: false },
);

const ShareAnalysisModal = dynamic(
  () => import("@/components/board/ShareAnalysisModal"),
  { ssr: false },
);

export default function ScanDetailPage(): ReactElement {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [scan, setScan] = useState<ScanWithAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [shared, setShared] = useState(false);
  const createPost = useCreatePost();

  useEffect(() => {
    async function fetchScan(): Promise<void> {
      try {
        const res = await fetch("/api/scans");
        if (!res.ok) throw new Error();
        const { scans }: { scans: ScanWithAnalysis[] } = await res.json();
        const found = scans.find((s) => s.id === params.id) ?? null;
        setScan(found);
      } catch {
        setScan(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchScan();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">스캔을 찾을 수 없어요.</p>
        <button
          onClick={() => router.push("/history")}
          className="mt-4 text-sm font-medium text-foreground hover:underline"
        >
          기록으로 돌아가기
        </button>
      </div>
    );
  }

  const analysis = scan.analyses?.[0];
  const images = scan.images as ScanImage[];

  function handleShare(payload: {
    board: BoardType;
    title: string;
    content: string;
    tags: string[];
    scanId: string;
    norwoodGrade: number;
    score: number;
    images?: Record<string, unknown>[];
  }): void {
    createPost.mutate(payload, {
      onSuccess: () => {
        setShowShare(false);
        setShared(true);
      },
    });
  }

  return (
    <PageContainer className="py-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.push("/history")}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground/70 hover:text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        분석 기록
      </button>

      {/* 분석 결과 */}
      {analysis ? (
        <>
          <ResultCard
            grade={analysis.norwood_grade}
            score={Number(analysis.score)}
            details={analysis.details as AnalysisDetail}
            createdAt={analysis.created_at}
            images={images}
          />

          {/* 피드백 버튼 */}
          <div className="mt-4">
            <FeedbackButtons scanId={scan.id} />
          </div>

          {/* 공유 버튼 */}
          <div className="mt-4">
            <ShareButtons
              grade={analysis.norwood_grade}
              score={Number(analysis.score)}
              details={analysis.details as AnalysisDetail}
              createdAt={analysis.created_at}
              onBoardShare={() => setShowShare(true)}
              boardShared={shared}
            />
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-card p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            {scan.status === "analyzing"
              ? COPY.SCAN_ANALYZING
              : COPY.ERROR_ANALYSIS_FAILED}
          </p>
        </div>
      )}

      {/* 공유 모달 */}
      <AnimatePresence>
        {showShare && analysis && (
          <ShareAnalysisModal
            data={{
              scanId: scan.id,
              norwoodGrade: analysis.norwood_grade,
              score: Number(analysis.score),
              details: analysis.details as AnalysisDetail,
              images,
            }}
            onClose={() => setShowShare(false)}
            onSubmit={handleShare}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
