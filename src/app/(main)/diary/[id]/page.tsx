"use client";

import { use, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  Lock,
  Globe,
  Heart,
  MessageCircle,
  Eye,
  Send,
  X,
} from "lucide-react";
import { COPY } from "@/constants/copy";
import {
  useDiaryEntry,
  useDeleteDiaryEntry,
  useDiaryLike,
  useDiaryComments,
  useCreateDiaryComment,
  useDeleteDiaryComment,
} from "@/hooks/useDiary";
import { useAuth } from "@/hooks/useAuth";
import { CHECKLIST_ITEMS, type ChecklistCategory } from "@/types/diary";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

interface Props {
  params: Promise<{ id: string }>;
}

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

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  medication: "약물",
  treatment: "시술",
  lifestyle: "생활습관",
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

export default function DiaryDetailPage({ params }: Props): ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useDiaryEntry(id);
  const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteDiaryEntry();
  const { mutateAsync: toggleLike, isPending: isLiking } = useDiaryLike();
  const { data: commentsData } = useDiaryComments(id);
  const { mutateAsync: createComment, isPending: isCommenting } = useCreateDiaryComment();
  const { mutateAsync: deleteComment } = useDeleteDiaryComment();

  const [commentText, setCommentText] = useState("");

  const entry = data?.entry ?? null;
  const liked = data?.liked ?? false;
  const stats = data?.stats ?? { viewCount: 0, likeCount: 0, commentCount: 0 };
  const comments = commentsData?.comments ?? [];
  const isOwner = !!user && !!entry && user.id === entry.userId;

  const grade = entry?.analysis?.norwoodGrade ?? null;
  const score = entry?.analysis?.score ?? null;
  const images = entry?.scan?.images ?? [];
  const canViewPhotos = isOwner || entry?.isPhotoPublic;

  const checkedItems = (entry?.checklists ?? []).filter((c) => c.checked);
  const checkedByCategory = new Map<ChecklistCategory, string[]>();
  for (const c of checkedItems) {
    const cat = c.category as ChecklistCategory;
    const list = checkedByCategory.get(cat) ?? [];
    list.push(CHECKLIST_LABEL_MAP[c.item] ?? c.item);
    checkedByCategory.set(cat, list);
  }

  const formattedDate = entry
    ? new Date(entry.date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : "";

  const title = entry?.title
    ?? (grade !== null ? COPY.GRADE_HEADLINE[grade] : null)
    ?? (entry
      ? new Date(entry.date).toLocaleDateString("ko-KR", {
          month: "long",
          day: "numeric",
        }) + " 기록"
      : "");

  async function handleDelete(): Promise<void> {
    if (!window.confirm("이 기록을 삭제할까요?")) return;
    await deleteEntry(id);
    toast.success(COPY.DIARY_ENTRY_DELETED);
    router.push("/diary");
  }

  async function handleLike(): Promise<void> {
    if (!user) {
      toast.error("로그인이 필요해요.");
      return;
    }
    await toggleLike(id);
  }

  async function handleSubmitComment(): Promise<void> {
    if (!user) {
      toast.error("로그인이 필요해요.");
      return;
    }
    if (!commentText.trim()) return;
    await createComment({ entryId: id, content: commentText.trim() });
    setCommentText("");
  }

  async function handleDeleteComment(commentId: string): Promise<void> {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    await deleteComment({ commentId, entryId: id });
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  if (!entry) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">기록을 찾을 수 없어요.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.article
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl py-6"
      >
        {/* Breadcrumb + Actions */}
        <motion.div variants={fadeSlideUp} className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/diary")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            둥지 일기
          </button>

          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="수정하기"
                onClick={() => router.push(`/diary/${id}/edit`)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="삭제하기"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeSlideUp}
          className="text-2xl font-bold text-foreground leading-tight mb-3"
        >
          {title}
        </motion.h1>

        {/* Meta row */}
        <motion.div
          variants={fadeSlideUp}
          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2"
        >
          {entry.isPublic ? (
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3 w-3" /> 공개
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" /> 나만 보기
            </span>
          )}
          <span className="text-muted-foreground/30">·</span>
          <span>{entry.profile?.nickname ?? "나"}</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formattedDate}
          </span>
          {grade !== null && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className={`font-bold rounded-md px-1.5 py-0.5 ${GRADE_BADGE[grade]}`}>
                {GRADE_LABELS[grade]} {score !== null ? `${score.toFixed(1)}점` : ""}
              </span>
            </>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeSlideUp}
          className="flex items-center gap-4 text-xs text-muted-foreground/60 mb-6 pb-6 border-b border-border"
        >
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" /> {stats.viewCount.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3" /> {stats.likeCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> {stats.commentCount}
          </span>
        </motion.div>

        {/* Memo content */}
        {entry.memo && (
          <motion.div variants={fadeSlideUp} className="mb-6">
            <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-wrap">
              {entry.memo}
            </p>
          </motion.div>
        )}

        {/* Photo grid — show if owner OR photo is public */}
        {images.length > 0 && (isOwner || entry.isPhotoPublic) && (() => {
          // Blur: owner sees original; others see blur based on blurLevel
          const bl = entry.blurLevel ?? "none";
          const blurClass = !isOwner && bl !== "none"
            ? bl === "low" ? "blur-sm" : bl === "high" ? "blur-2xl" : "blur-lg"
            : "";
          const showOverlay = !isOwner && bl !== "none";
          return (
          <motion.div variants={fadeSlideUp} className="mb-6 relative">
            {showOverlay && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl">
                <span className="rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                  블러 처리된 사진
                </span>
              </div>
            )}
            {images.length === 1 ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={images[0].url}
                  alt={COPY.A11Y_SCALP_PHOTO}
                  fill
                  className={`object-cover ${blurClass}`}
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={`${img.type}-${idx}`}
                    className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      src={img.url}
                      alt={COPY.A11Y_SCALP_PHOTO}
                      fill
                      className={`object-cover ${blurClass}`}
                      sizes="(max-width: 768px) 33vw, 224px"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          );
        })()}

        {/* Checklist by category */}
        {checkedByCategory.size > 0 && (
          <motion.div
            variants={fadeSlideUp}
            className="mb-6 rounded-xl bg-muted/40 p-4 flex flex-col gap-3"
          >
            {[...checkedByCategory.entries()].map(([cat, items]) => (
              <div key={cat}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground border border-border"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Like + Comment action bar */}
        <motion.div
          variants={fadeSlideUp}
          className="flex items-center gap-4 py-4 border-y border-border mb-6"
        >
          <button
            type="button"
            disabled={isLiking}
            onClick={handleLike}
            className={[
              "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
              liked
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500",
            ].join(" ")}
          >
            <Heart
              className="h-5 w-5"
              fill={liked ? "currentColor" : "none"}
            />
            좋아요 {stats.likeCount > 0 ? stats.likeCount : ""}
          </button>

          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            댓글 {stats.commentCount > 0 ? stats.commentCount : ""}
          </span>
        </motion.div>

        {/* Comments section */}
        <motion.div variants={fadeSlideUp} className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground">
            댓글 {stats.commentCount > 0 ? stats.commentCount : ""}
          </h3>

          {/* Comment input */}
          {user && (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                placeholder="댓글을 남겨주세요."
                maxLength={500}
                className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                disabled={isCommenting || !commentText.trim()}
                onClick={handleSubmitComment}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Comment list */}
          {comments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {comments.map((comment) => {
                const isCommentOwner = user?.id === comment.userId;
                return (
                  <div key={comment.id} className="flex flex-col gap-1 group">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {comment.profile?.nickname ?? "익명"}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50">
                        {timeAgo(comment.createdAt)}
                      </span>
                      {isCommentOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive"
                          aria-label="댓글 삭제"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50 py-4 text-center">
              아직 댓글이 없어요
            </p>
          )}
        </motion.div>

      </motion.article>
    </PageContainer>
  );
}
