"use client";

import { useState, useEffect, useCallback, type ReactElement } from "react";
import { ThumbsUp, TrendingUp, TrendingDown } from "lucide-react";
import type { FeedbackRating } from "@/types/database";

interface FeedbackButtonsProps {
  scanId: string;
}

const FEEDBACK_OPTIONS: {
  rating: FeedbackRating;
  label: string;
  icon: typeof ThumbsUp;
  color: string;
  selectedBg: string;
  selectedText: string;
  hoverBg: string;
}[] = [
  {
    rating: "accurate",
    label: "정확해요",
    icon: ThumbsUp,
    color: "text-emerald-500",
    selectedBg: "bg-emerald-500",
    selectedText: "text-white",
    hoverBg: "hover:bg-emerald-50",
  },
  {
    rating: "too_high",
    label: "점수가 높아요",
    icon: TrendingUp,
    color: "text-amber-500",
    selectedBg: "bg-amber-500",
    selectedText: "text-white",
    hoverBg: "hover:bg-amber-50",
  },
  {
    rating: "too_low",
    label: "점수가 낮아요",
    icon: TrendingDown,
    color: "text-blue-500",
    selectedBg: "bg-blue-500",
    selectedText: "text-white",
    hoverBg: "hover:bg-blue-50",
  },
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
    <div className="relative rounded-2xl bg-white p-5 shadow-sm">
      <p className="mb-3 text-center text-sm font-medium text-[#334155]">
        분석 결과가 정확했나요?
      </p>
      <div className="flex gap-2.5">
        {FEEDBACK_OPTIONS.map(({ rating, label, icon: Icon, color, selectedBg, selectedText, hoverBg }) => {
          const isSelected = selected === rating;
          return (
            <button
              key={rating}
              onClick={() => handleSubmit(rating)}
              disabled={isSubmitting}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition-all active:scale-[0.97] ${
                isSelected
                  ? `${selectedBg} ${selectedText} border-transparent shadow-md`
                  : `border-[#E2E8F0] bg-white ${color} ${hoverBg}`
              } ${isSubmitting ? "opacity-50" : ""}`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? "text-white" : ""}`} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* 토스트 */}
      {showToast && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 animate-bounce rounded-full bg-[#1E293B] px-4 py-1.5 text-xs font-medium text-white shadow-lg">
          의견이 반영됐어요
        </div>
      )}
    </div>
  );
}
