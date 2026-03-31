"use client";

import React from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { COPY } from "@/constants/copy";
import {
  DiaryEntry,
  CHECKLIST_ITEMS,
  type ChecklistCategory,
} from "@/types/diary";

interface Props {
  entry: DiaryEntry;
  isOwner: boolean;
  showAuthor?: boolean;
  onClick?: () => void;
}

const GRADE_COLORS: Record<number, string> = {
  1: "bg-green-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-purple-500",
};

const GRADE_LABELS: Record<number, string> = {
  1: "정상",
  2: "경미",
  3: "주의",
  4: "관리 필요",
  5: "전문 상담 추천",
};

const CHECKLIST_LABEL_MAP: Record<string, string> = Object.values(
  CHECKLIST_ITEMS
).reduce<Record<string, string>>((acc, items) => {
  for (const item of items) {
    acc[item.key] = item.label;
  }
  return acc;
}, {});

export default function DiaryEntryCard({
  entry,
  isOwner,
  showAuthor = false,
  onClick,
}: Props): React.JSX.Element {
  const thumbnail =
    entry.scan?.images?.find((img) => img.type === "top") ??
    entry.scan?.images?.[0] ??
    null;

  const canViewPhoto = isOwner || entry.isPhotoPublic;
  const hasPhoto = thumbnail !== null;

  const checkedItems = (entry.checklists ?? [])
    .filter((c) => c.checked)
    .slice(0, 4)
    .map((c) => CHECKLIST_LABEL_MAP[c.item] ?? c.item);

  const grade = entry.analysis?.norwoodGrade ?? null;

  const formattedDate = new Date(entry.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:bg-accent/50 transition-colors"
    >
      <div className="flex flex-row gap-3">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 rounded-xl bg-muted overflow-hidden">
          {hasPhoto && canViewPhoto ? (
            <Image
              src={thumbnail!.thumbnailUrl || thumbnail!.url}
              alt={COPY.A11Y_SCALP_PHOTO}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : hasPhoto && !canViewPhoto ? (
            <div className="flex h-full w-full items-center justify-center">
              <Lock className="h-5 w-5 text-muted-foreground" aria-label={COPY.DIARY_PHOTO_BLURRED} />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
                No photo
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Row 1: date + author + grade badge */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
            {showAuthor && entry.profile?.nickname && (
              <span className="text-xs text-muted-foreground">
                · {entry.profile.nickname}
              </span>
            )}
            {grade !== null && GRADE_COLORS[grade] && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${GRADE_COLORS[grade]}`}
              >
                {GRADE_LABELS[grade] ?? `등급 ${grade}`}
              </span>
            )}
          </div>

          {/* Row 2: checked checklist pills */}
          {checkedItems.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {checkedItems.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Row 3: memo preview */}
          {entry.memo && (
            <p className="text-xs text-foreground line-clamp-1">{entry.memo}</p>
          )}
        </div>
      </div>
    </button>
  );
}
