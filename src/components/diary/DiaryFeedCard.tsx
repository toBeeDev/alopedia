"use client";

import React from "react";
import Image from "next/image";
import { Eye, MessageCircle, Heart, Clock } from "lucide-react";
import { COPY } from "@/constants/copy";
import { DiaryEntry, CHECKLIST_ITEMS, type ChecklistCategory } from "@/types/diary";

interface Props {
  entry: DiaryEntry;
  isOwner?: boolean;
  onClick?: () => void;
}

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  medication: "약물",
  treatment: "시술",
  lifestyle: "생활습관",
};

const GRADE_TAG: Record<number, { label: string; className: string }> = {
  1: { label: "정상", className: "text-green-600 dark:text-green-400" },
  2: { label: "경미", className: "text-yellow-600 dark:text-yellow-400" },
  3: { label: "주의", className: "text-orange-600 dark:text-orange-400" },
  4: { label: "관리 필요", className: "text-red-600 dark:text-red-400" },
  5: { label: "전문 상담", className: "text-purple-600 dark:text-purple-400" },
};

const CHECKLIST_LABEL_MAP: Record<string, string> = Object.values(
  CHECKLIST_ITEMS,
).reduce<Record<string, string>>((acc, items) => {
  for (const item of items) {
    acc[item.key] = item.label;
  }
  return acc;
}, {});

function timeAgo(dateStr: string): string {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}일 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

export default function DiaryFeedCard({
  entry,
  isOwner = false,
  onClick,
}: Props): React.JSX.Element {
  const thumbnail =
    entry.scan?.images?.find((img) => img.type === "top") ??
    entry.scan?.images?.[0] ??
    null;

  const canViewPhoto = entry.isPhotoPublic;
  const grade = entry.analysis?.norwoodGrade ?? null;

  // Build category tag from checklist
  const categories = new Set<ChecklistCategory>();
  for (const c of entry.checklists ?? []) {
    if (c.checked) categories.add(c.category as ChecklistCategory);
  }
  const categoryTag = [...categories].map((c) => CATEGORY_LABELS[c]).join(" · ");

  // Title: user title > grade headline > date fallback
  const title = entry.title
    ?? (grade !== null ? COPY.GRADE_HEADLINE[grade] : null)
    ?? new Date(entry.date).toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      }) + " 기록";

  // Preview: memo
  const preview = entry.memo ?? "";

  // Checked items for display
  const checkedLabels = (entry.checklists ?? [])
    .filter((c) => c.checked)
    .slice(0, 3)
    .map((c) => CHECKLIST_LABEL_MAP[c.item] ?? c.item);

  const nickname = entry.profile?.nickname ?? "익명";
  const time = timeAgo(entry.createdAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
    >
      <div className="flex gap-4 px-1 py-4">
        {/* Text content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Category tag */}
          {categoryTag && (
            <span className="text-xs text-muted-foreground">
              {categoryTag}
            </span>
          )}

          {/* Title */}
          <h3 className="text-[15px] font-bold text-foreground leading-snug line-clamp-1">
            {title}
          </h3>

          {/* Preview */}
          {preview && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {preview}
            </p>
          )}

          {/* Checklist pills */}
          {checkedLabels.length > 0 && !preview && (
            <div className="flex gap-1">
              {checkedLabels.map((label) => (
                <span
                  key={label}
                  className="text-xs text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Footer: author + social stats */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-muted-foreground/70">
              {nickname}
            </span>
            {isOwner && (
              <span className="rounded-sm bg-primary/10 px-1 py-0.5 text-[10px] font-semibold text-primary leading-none">
                내 글
              </span>
            )}
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground/50 inline-flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {entry.viewCount ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground/50 inline-flex items-center gap-0.5">
              <Heart className="h-3 w-3" />
              {entry.likeCount ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground/50 inline-flex items-center gap-0.5">
              <MessageCircle className="h-3 w-3" />
              {entry.commentCount ?? 0}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground/50">
              {time}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {thumbnail && canViewPhoto && (() => {
          const bl = entry.blurLevel ?? "none";
          const blurCls = bl === "none" ? "" : bl === "low" ? "blur-sm" : bl === "high" ? "blur-2xl" : "blur-lg";
          return (
          <div className="relative h-[80px] w-[80px] shrink-0 rounded-lg bg-muted overflow-hidden self-center">
            <Image
              src={thumbnail.thumbnailUrl || thumbnail.url}
              alt={COPY.A11Y_SCALP_PHOTO}
              fill
              className={`object-cover ${blurCls}`}
              sizes="80px"
            />
          </div>
          );
        })()}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />
    </button>
  );
}
