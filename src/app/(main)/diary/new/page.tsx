"use client";

import { useState, useEffect, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, CheckCircle2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { COPY } from "@/constants/copy";
import { useCreateDiaryEntry } from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import DiaryEntryForm from "@/components/diary/DiaryEntryForm";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import type { ScanImage } from "@/types/database";

interface TodayScan {
  id: string;
  images: ScanImage[];
  grade: number | null;
  score: number | null;
}

export default function DiaryNewPage(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { mutateAsync, isPending } = useCreateDiaryEntry();

  const scanIdFromUrl = searchParams.get("scanId");
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const [todayScan, setTodayScan] = useState<TodayScan | null>(null);
  const [scanLoading, setScanLoading] = useState(true);
  const [previewBlur, setPreviewBlur] = useState<string>("");
  const [linkedScanId, setLinkedScanId] = useState<string | undefined>(
    scanIdFromUrl ?? undefined,
  );

  // Fetch today's latest completed scan (or the one from URL)
  useEffect(() => {
    async function fetchTodayScan(): Promise<void> {
      try {
        const res = await fetch("/api/scans");
        if (!res.ok) return;
        const { scans } = (await res.json()) as {
          scans: {
            id: string;
            created_at: string;
            images: ScanImage[];
            status: string;
            analyses?: { norwood_grade: number; score: number }[];
          }[];
        };

        // If scanId from URL, find that specific scan
        if (scanIdFromUrl) {
          const target = scans.find((s) => s.id === scanIdFromUrl);
          if (target) {
            const analysis = target.analyses?.[0];
            setTodayScan({
              id: target.id,
              images: target.images,
              grade: analysis?.norwood_grade ?? null,
              score: analysis?.score ? Number(analysis.score) : null,
            });
            setLinkedScanId(target.id);
          }
          return;
        }

        // Otherwise find today's latest completed scan
        const todayScans = scans.filter((s) => {
          if (s.status !== "completed") return false;
          const d = new Date(s.created_at);
          const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          return localDate === today;
        });

        if (todayScans.length > 0) {
          const latest = todayScans[0]; // already sorted desc
          const analysis = latest.analyses?.[0];
          setTodayScan({
            id: latest.id,
            images: latest.images,
            grade: analysis?.norwood_grade ?? null,
            score: analysis?.score ? Number(analysis.score) : null,
          });
          setLinkedScanId(latest.id);
        }
      } catch {
        // silently fail
      } finally {
        setScanLoading(false);
      }
    }

    if (user) fetchTodayScan();
    else setScanLoading(false);
  }, [user, scanIdFromUrl, today]);

  async function handleSubmit(data: {
    title: string;
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    blurLevel: "none" | "low" | "medium" | "high";
    checklists: { category: string; item: string; checked: boolean }[];
  }): Promise<void> {
    const result = await mutateAsync({
      ...data,
      date: today,
      scanId: linkedScanId,
    });
    toast.success(COPY.DIARY_ENTRY_SAVED);
    const entryId = (result as { entry?: { id?: string } })?.entry?.id;
    router.push(entryId ? `/diary/${entryId}` : "/diary");
  }

  // If today's entry already exists, redirect to edit
  useEffect(() => {
    if (!user) return;
    async function checkExisting(): Promise<void> {
      try {
        const month = today.slice(0, 7);
        const res = await fetch(`/api/diary/entries?month=${month}`);
        if (!res.ok) return;
        const { entries } = await res.json();
        const existing = (entries ?? []).find(
          (e: { date: string }) => e.date === today,
        );
        if (existing) {
          router.replace(`/diary/${existing.id}/edit`);
        }
      } catch {
        // ignore
      }
    }
    checkExisting();
  }, [user, today, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground py-10 text-center">로딩 중...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 py-6"
      >
        <motion.h1
          variants={fadeSlideUp}
          className="text-xl font-bold text-foreground"
        >
          {COPY.DIARY_ADD_CTA}
        </motion.h1>

        {/* Scan section */}
        <motion.div variants={fadeSlideUp}>
          {scanLoading ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">스캔 기록 확인 중...</p>
            </div>
          ) : todayScan ? (
            /* Today's scan exists — show preview */
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold text-foreground">
                  오늘의 AI 분석 연결됨
                </span>
                {todayScan.grade && (
                  <span className="text-xs text-muted-foreground">
                    · {COPY.GRADE_HEADLINE[todayScan.grade]} {todayScan.score}점
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {todayScan.images.slice(0, 3).map((img, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      src={img.thumbnailUrl}
                      alt={`두피 사진 ${i + 1}`}
                      fill
                      className={`object-cover transition-all duration-300 ${previewBlur}`}
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* No scan today — prompt to upload */
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
              <Camera className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                오늘 촬영한 두피 사진이 없어요
              </p>
              <Link
                href="/scan"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                두피사진 업로드하러가기
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-2 text-xs text-muted-foreground">
                사진 없이도 다이어리를 작성할 수 있어요
              </p>
            </div>
          )}
        </motion.div>

        {/* Form */}
        <DiaryEntryForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="다이어리 저장"
          onBlurChange={(level) => {
            if (level === "none") {
              setPreviewBlur("");
            } else {
              setPreviewBlur(
                level === "low" ? "blur-sm" : level === "high" ? "blur-2xl" : "blur-lg",
              );
            }
          }}
        />
      </motion.div>
    </PageContainer>
  );
}
