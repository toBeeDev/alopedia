"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import ResultCard from "@/components/analysis/ResultCard";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail, ScanImage } from "@/types/database";
import type { ScanWithAnalysis } from "@/hooks/useScanHistory";


export default function ScanDetailPage(): ReactElement {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [scan, setScan] = useState<ScanWithAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6161FF]/20 border-t-[#6161FF]" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-[#676879]">스캔을 찾을 수 없어요.</p>
        <button
          onClick={() => router.push("/history")}
          className="mt-4 text-sm font-medium text-[#6161FF] hover:underline"
        >
          기록으로 돌아가기
        </button>
      </div>
    );
  }

  const analysis = scan.analyses?.[0];
  const images = scan.images as ScanImage[];

  return (
    <PageContainer className="py-6">
      {/* Floating back button */}
      <button
        onClick={() => router.push("/history")}
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="h-5 w-5 text-[#323338]" />
      </button>

      {/* 분석 결과 (사진은 ResultCard 내부에서 표시) */}
      {analysis ? (
        <ResultCard
          grade={analysis.norwood_grade}
          score={Number(analysis.score)}
          details={analysis.details as AnalysisDetail}
          createdAt={analysis.created_at}
          images={images}
        />
      ) : (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-[#676879]">
            {scan.status === "analyzing"
              ? COPY.SCAN_ANALYZING
              : COPY.ERROR_ANALYSIS_FAILED}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
