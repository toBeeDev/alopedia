"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Clock, MessageCircle, Home, Share2 } from "lucide-react";
import Link from "next/link";
import { useScanSessionStore } from "@/stores/scanSession";
import ResultCard from "@/components/analysis/ResultCard";
import ShareAnalysisModal from "@/components/board/ShareAnalysisModal";
import { useCreatePost } from "@/hooks/useBoardPosts";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail, ScanImage } from "@/types/database";

type UploadState = "uploading" | "analyzing" | "done" | "error";

interface AnalysisData {
  scanId: string;
  grade: number;
  score: number;
  details: AnalysisDetail;
  createdAt: string;
  images: ScanImage[];
  dailyRemaining: number;
}

export default function UploadingPage(): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { images, reset } = useScanSessionStore();
  const [state, setState] = useState<UploadState>("uploading");
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (images.length === 0) {
      router.replace("/scan");
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    async function uploadAndAnalyze(): Promise<void> {
      try {
        // 1. 업로드
        setState("uploading");
        const formData = new FormData();
        const scanTypes = ["top", "front", "side"] as const;
        images.forEach((img, i) => {
          const key = i < scanTypes.length ? scanTypes[i] : `extra_${i}`;
          formData.append(key, img.blob, `${key}.jpg`);
        });

        const uploadRes = await fetch("/api/scans", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error ?? COPY.ERROR_ANALYSIS_FAILED);
        }

        const { scan } = await uploadRes.json();

        // 2. AI 분석
        setState("analyzing");
        const analyzeRes = await fetch(`/api/scans/${scan.id}/analyze`, {
          method: "POST",
        });

        if (!analyzeRes.ok) {
          const err = await analyzeRes.json();
          throw new Error(err.error ?? COPY.ERROR_ANALYSIS_FAILED);
        }

        const { analysis: result, dailyRemaining } = await analyzeRes.json();

        setAnalysis({
          scanId: scan.id,
          grade: result.norwood_grade,
          score: Number(result.score),
          details: result.details,
          createdAt: result.created_at,
          images: scan.images ?? [],
          dailyRemaining: dailyRemaining ?? 0,
        });
        setState("done");
        reset();

        // 새 스캔 데이터가 히스토리/대시보드에 즉시 반영되도록 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["scanHistory"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["profile", "stats"] });
      } catch (e) {
        setState("error");
        setErrorMsg(e instanceof Error ? e.message : COPY.ERROR_ANALYSIS_FAILED);
      }
    }

    uploadAndAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const createPost = useCreatePost();

  // 분석 완료 — 결과 카드 표시
  if (state === "done" && analysis) {
    const quickLinks = [
      { href: "/dashboard", label: "홈", icon: Home },
      { href: "/scan", label: "다시 촬영", icon: Camera },
      { href: "/history", label: "기록 보기", icon: Clock },
      { href: "/board", label: "게시판", icon: MessageCircle },
    ];

    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <ResultCard
          grade={analysis.grade}
          score={analysis.score}
          details={analysis.details}
          createdAt={analysis.createdAt}
          images={analysis.images}
        />

        {/* 커뮤니티 공유 CTA */}
        <div className="mx-auto mt-6 max-w-4xl">
          {shareSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-6 py-4 text-sm font-medium text-emerald-700"
            >
              <span>게시판에 공유됐어요!</span>
              <Link
                href="/board"
                className="underline underline-offset-2 hover:text-emerald-900"
              >
                게시판으로 이동
              </Link>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-4 text-sm font-semibold text-background shadow-md shadow-black/10 transition-all hover:bg-foreground/85 active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} />
              커뮤니티에 결과 공유하기
            </button>
          )}
        </div>

        {/* 남은 분석 횟수 안내 */}
        <p className="mx-auto mt-3 max-w-4xl text-center text-xs text-muted-foreground/70">
          오늘 남은 분석 횟수: <span className="font-semibold text-foreground">{analysis.dailyRemaining}회</span> / 2회
        </p>

        {/* 퀵 네비게이션 */}
        <div className="mx-auto mt-3 grid max-w-4xl grid-cols-4 gap-2">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-card py-3 text-muted-foreground shadow-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* 공유 모달 */}
        <AnimatePresence>
          {showShareModal && (
            <ShareAnalysisModal
              data={{
                scanId: analysis.scanId,
                norwoodGrade: analysis.grade,
                score: analysis.score,
                details: analysis.details,
                images: analysis.images,
              }}
              onClose={() => setShowShareModal(false)}
              onSubmit={(payload) => {
                createPost.mutate(payload, {
                  onSuccess: () => {
                    setShowShareModal(false);
                    setShareSuccess(true);
                  },
                });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 에러
  if (state === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm text-red-500">{errorMsg}</p>
        <button
          onClick={() => router.push("/scan")}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white hover:bg-foreground/85"
        >
          다시 촬영하기
        </button>
      </div>
    );
  }

  // 업로드/분석 중 로딩
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="mb-6 h-16 w-16 rounded-full border-4 border-foreground/20 border-t-foreground"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-lg font-semibold text-foreground">
        {state === "uploading" ? "사진을 업로드하고 있어요..." : COPY.SCAN_ANALYZING}
      </p>
      <p className="mt-2 text-sm text-muted-foreground/70">{COPY.SCAN_UPLOAD_WARN}</p>
    </div>
  );
}
