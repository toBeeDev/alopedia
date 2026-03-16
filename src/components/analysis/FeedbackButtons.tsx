"use client";

import { useState, useEffect, useCallback, type ReactElement } from "react";
import { Check, ChevronUp, ChevronDown } from "lucide-react";
import type { FeedbackRating } from "@/types/database";

interface FeedbackButtonsProps {
  scanId: string;
}

const FEEDBACK_OPTIONS: {
  rating: FeedbackRating;
  label: string;
  icon: typeof Check;
}[] = [
  { rating: "accurate", label: "정확해요", icon: Check },
  { rating: "too_high", label: "점수가 높아요", icon: ChevronUp },
  { rating: "too_low", label: "점수가 낮아요", icon: ChevronDown },
];

export default function FeedbackButtons({
  scanId,
}: FeedbackButtonsProps): ReactElement {
  const [selected, setSelected] = useState<FeedbackRating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 기존 피드백 조회
  useEffect(() => {
    async function fetchFeedback(): Promise<void> {
      try {
        const res = await fetch(`/api/scans/${scanId}/feedback`);
        if (!res.ok) return;
        const { feedback } = await res.json() as { feedback: { rating: FeedbackRating } | null };
        if (feedback) {
          setSelected(feedback.rating);
        }
      } catch {
        // 조회 실패는 무시
      }
    }
    fetchFeedback();
  }, [scanId]);

  const handleSubmit = useCallback(
    async (rating: FeedbackRating): Promise<void> => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const res = await fetch(`/api/scans/${scanId}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
        });

        if (res.ok) {
          setSelected(rating);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        }
      } catch {
        // 저장 실패는 무시
      } finally {
        setIsSubmitting(false);
      }
    },
    [scanId, isSubmitting],
  );

  return (
    <div className="relative">
      <p className="mb-2 text-center text-xs text-[#94A3B8]">
        분석 결과가 정확했나요?
      </p>
      <div className="flex gap-2">
        {FEEDBACK_OPTIONS.map(({ rating, label, icon: Icon }) => {
          const isSelected = selected === rating;
          return (
            <button
              key={rating}
              onClick={() => handleSubmit(rating)}
              disabled={isSubmitting}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[#1E293B] text-white shadow-sm"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]"
              } ${isSubmitting ? "opacity-50" : ""}`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* 토스트 */}
      {showToast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-[#1E293B] px-3 py-1.5 text-xs text-white shadow-lg">
          의견이 반영됐어요
        </div>
      )}
    </div>
  );
}
