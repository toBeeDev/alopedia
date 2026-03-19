"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Home } from "lucide-react";
import Link from "next/link";
import { useScanSessionStore } from "@/stores/scanSession";
import { compressImage } from "@/lib/image/compressClient";
import { markGuestUsed } from "@/lib/guest/guestLimit";
import ResultCard from "@/components/analysis/ResultCard";
import GuestResultCta from "@/components/guest/GuestResultCta";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail } from "@/types/database";

async function safeParseJson(
  res: Response,
): Promise<{ error?: string } | null> {
  try {
    return await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    if (res.status === 413 || text.includes("Request Entity Too Large")) {
      return { error: "이미지 용량이 너무 커요. 더 작은 사진으로 다시 시도해주세요." };
    }
    return { error: `서버 오류가 발생했어요. (${res.status})` };
  }
}

type AnalyzingState = "compressing" | "analyzing" | "done" | "error";

interface GuestAnalysisData {
  grade: number;
  score: number;
  details: AnalysisDetail;
}

export default function GuestAnalyzingPage(): ReactElement {
  const router = useRouter();
  const { images, reset } = useScanSessionStore();
  const [state, setState] = useState<AnalyzingState>("compressing");
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState<GuestAnalysisData | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (images.length === 0) {
      router.replace("/try");
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    async function analyzeGuest(): Promise<void> {
      try {
        setState("compressing");
        const formData = new FormData();
        await Promise.all(
          images.map(async (img, i) => {
            const compressed = await compressImage(
              img.blob instanceof File
                ? img.blob
                : new File([img.blob], `photo_${i}.jpg`, { type: "image/jpeg" }),
            );
            formData.append(`photo_${i}`, compressed, `photo_${i}.jpg`);
          }),
        );

        setState("analyzing");
        const res = await fetch("/api/guest/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await safeParseJson(res);
          throw new Error(err?.error ?? COPY.ERROR_ANALYSIS_FAILED);
        }

        const { analysis: result } = await res.json();

        setAnalysis({
          grade: result.norwoodGrade,
          score: Number(result.score),
          details: {
            hairline: result.details.hairline,
            density: result.details.density,
            thickness: result.details.thickness,
            scalpCondition: result.details.scalpCondition,
            advice: result.details.advice,
            areaScores: result.details.areaScores,
          },
        });
        setState("done");
        markGuestUsed();
        reset();
      } catch (e) {
        setState("error");
        setErrorMsg(e instanceof Error ? e.message : COPY.ERROR_ANALYSIS_FAILED);
      }
    }

    analyzeGuest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Done: show result
  if (state === "done" && analysis) {
    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <ResultCard
          grade={analysis.grade}
          score={analysis.score}
          details={analysis.details}
          createdAt={new Date().toISOString()}
        />

        <GuestResultCta />

        {/* Quick links */}
        <div className="mx-auto mt-4 grid max-w-4xl grid-cols-2 gap-2">
          <Link
            href="/"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-card py-3 text-muted-foreground shadow-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Home className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-xs font-medium">{COPY.NAV_HOME}</span>
          </Link>
          <Link
            href="/try"
            className="flex flex-col items-center gap-1.5 rounded-xl bg-card py-3 text-muted-foreground shadow-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Camera className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-xs font-medium">다시 체험하기</span>
          </Link>
        </div>
      </div>
    );
  }

  // Error
  if (state === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm text-red-500">{errorMsg}</p>
        <button
          onClick={() => router.push("/try")}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white hover:bg-foreground/85"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  // Loading — 독수리 애니메이션
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4"
      >
        <EagleIcon grade={3} size={64} />
      </motion.div>
      <p className="text-lg font-semibold text-foreground">
        {state === "compressing" ? COPY.GUEST_COMPRESSING : COPY.GUEST_ANALYZING}
      </p>
      <p className="mt-2 text-sm text-muted-foreground/70">{COPY.SCAN_UPLOAD_WARN}</p>
    </div>
  );
}
