"use client";

import React from "react";
import Image from "next/image";
import { Lock, Pencil } from "lucide-react";
import { COPY } from "@/constants/copy";
import { DiaryEntry, CHECKLIST_ITEMS } from "@/types/diary";

interface Props {
  entry: DiaryEntry;
  isOwner: boolean;
  showAuthor?: boolean;
  onClick?: () => void;
}

const GRADE_ACCENT: Record<number, string> = {
  1: "border-l-green-500",
  2: "border-l-yellow-500",
  3: "border-l-orange-500",
  4: "border-l-red-500",
  5: "border-l-purple-500",
};

const GRADE_BADGE: Record<number, string> = {
  1: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  2: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  3: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  4: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  5: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
};

const GRADE_LABELS: Record<number, string> = {
  1: "정상",
  2: "경미",
  3: "주의",
  4: "관리 필요",
  5: "전문 상담",
};

const CHECKLIST_LABEL_MAP: Record<string, string> = Object.values(
  CHECKLIST_ITEMS,
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
  const images = entry.scan?.images ?? [];
  const canViewPhoto = isOwner || entry.isPhotoPublic;
  const hasPhotos = images.length > 0;

  const checkedItems = (entry.checklists ?? [])
    .filter((c) => c.checked)
    .slice(0, 6)
    .map((c) => CHECKLIST_LABEL_MAP[c.item] ?? c.item);

  const grade = entry.analysis?.norwoodGrade ?? null;
  const score = entry.analysis?.score ?? null;

  const day = new Date(entry.date).getDate();
  const weekday = new Date(entry.date).toLocaleDateString("ko-KR", {
    weekday: "short",
  });
  const monthLabel = new Date(entry.date).toLocaleDateString("ko-KR", {
    month: "long",
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full rounded-xl border border-border bg-card p-4 text-left transition-all",
        "hover:border-primary/20 hover:shadow-sm active:scale-[0.995]",
        grade !== null ? `border-l-[3px] ${GRADE_ACCENT[grade]}` : "",
      ].join(" ")}
    >
      {/* Top: Date row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums text-foreground leading-none">
            {day}
          </span>
          <span className="text-xs text-muted-foreground">
            {monthLabel} {weekday}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!entry.isPublic && (
            <Lock className="h-3 w-3 text-muted-foreground/40" />
          )}
          {grade !== null && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${GRADE_BADGE[grade]}`}
            >
              {GRADE_LABELS[grade]}
              {score !== null && ` ${score.toFixed(1)}`}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      {entry.title && (
        <p className="text-sm font-semibold text-foreground mb-2 line-clamp-1">
          {entry.title}
        </p>
      )}

      {/* Photos row */}
      {hasPhotos && canViewPhoto && (
        <div className="flex gap-1.5 mb-2.5">
          {images.slice(0, 3).map((img, i) => (
            <div
              key={`${img.type}-${i}`}
              className="relative h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden"
            >
              <Image
                src={img.thumbnailUrl || img.url}
                alt={COPY.A11Y_SCALP_PHOTO}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="64px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Memo */}
      {entry.memo && (
        <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed mb-2">
          {entry.memo}
        </p>
      )}

      {/* Checklist pills */}
      {checkedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {checkedItems.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Author for public feed */}
      {showAuthor && entry.profile?.nickname && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {entry.profile.nickname}
          </span>
        </div>
      )}
    </button>
  );
}
