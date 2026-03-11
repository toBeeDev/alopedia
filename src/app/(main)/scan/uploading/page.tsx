"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useScanSessionStore } from "@/stores/scanSession";
import ResultCard from "@/components/analysis/ResultCard";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail } from "@/types/database";

type UploadState = "uploading" | "analyzing" | "done" | "error";

interface AnalysisData {
  grade: number;
  score: number;
  details: AnalysisDetail;
  createdAt: string;
}

export default function UploadingPage(): ReactElement {
  const router = useRouter();
  const { images, reset } = useScanSessionStore();
  const [state, setState] = useState<UploadState>("uploading");
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  useEffect(() => {
    if (images.length === 0) {
      router.replace("/scan");
      return;
    }

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

        const { analysis: result } = await analyzeRes.json();

        setAnalysis({
          grade: result.norwood_grade,
          score: Number(result.score),
          details: result.details,
          createdAt: result.created_at,
        });
        setState("done");
        reset();
      } catch (e) {
        setState("error");
        setErrorMsg(e instanceof Error ? e.message : COPY.ERROR_ANALYSIS_FAILED);
      }
    }

    uploadAndAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 분석 완료 — 결과 카드 표시
  if (state === "done" && analysis) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] px-6 py-10">
        <ResultCard
          grade={analysis.grade}
          score={analysis.score}
          details={analysis.details}
          createdAt={analysis.createdAt}
        />
        <div className="mx-auto mt-6 max-w-lg text-center">
          <button
            onClick={() => router.push("/history")}
            className="text-sm font-medium text-[#6161FF] hover:underline"
          >
            분석 기록 보기
          </button>
        </div>
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
          className="rounded-full bg-[#6161FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4338ca]"
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
        className="mb-6 h-16 w-16 rounded-full border-4 border-[#6161FF]/20 border-t-[#6161FF]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-lg font-semibold text-[#323338]">
        {state === "uploading" ? "사진을 업로드하고 있어요..." : COPY.SCAN_ANALYZING}
      </p>
      <p className="mt-2 text-sm text-[#9DA0AE]">{COPY.SCAN_UPLOAD_WARN}</p>
    </div>
  );
}
