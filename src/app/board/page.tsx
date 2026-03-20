"use client";

import { useState, memo, type ReactElement } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import FallbackImage from "@/components/ui/fallback-image";
import { useRouter } from "next/navigation";
import {
  Feather,
  MessageCircle,
  Megaphone,
  Lock,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { COPY } from "@/constants/copy";
import { getGradeConfig } from "@/constants/gradeConfig";
import { getTagColor } from "@/constants/medications";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/hooks/useAuth";
import {
  useBoardPosts,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
} from "@/hooks/useBoardPosts";
import type { BoardPost } from "@/hooks/useBoardPosts";
import type { BoardType } from "@/types/database";

const WritePostModal = dynamic(
  () => import("@/components/board/WritePostModal"),
  { ssr: false },
);

const TAB_ALL = "전체" as const;

const BOARD_TABS = [
  TAB_ALL,
  COPY.BOARD_NAME.medication_review,
  COPY.BOARD_NAME.procedure_review,
  COPY.BOARD_NAME.qna,
  COPY.BOARD_NAME.lounge,
] as const;

const TAB_TO_BOARD: Record<string, BoardType> = {
  [COPY.BOARD_NAME.medication_review]: "medication_review",
  [COPY.BOARD_NAME.procedure_review]: "procedure_review",
  [COPY.BOARD_NAME.qna]: "qna",
  [COPY.BOARD_NAME.lounge]: "lounge",
};


/* ── Helpers ── */

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

/* ── Sub-components ── */

function PinnedCard({ post }: { post: BoardPost }): ReactElement {
  const router = useRouter();

  return (
    <motion.article
      variants={fadeSlideUp}
      className="cursor-pointer rounded-2xl border border-foreground/20 bg-foreground/5 p-5 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => router.push(`/board/${post.slug}`)}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10">
          <Megaphone className="h-4 w-4 text-foreground" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
            {COPY.BOARD_NOTICE_BADGE}
          </span>
          <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
            {COPY.BOARD_ADMIN_BADGE}
          </span>
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground/70">
          {formatTimeAgo(post.created_at)}
        </span>
      </div>
      <h3 className="mb-1.5 text-sm font-bold text-foreground">
        {post.title}
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {post.content}
      </p>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground/70">
        <span className="flex items-center gap-1">
          <Feather className="h-3.5 w-3.5" />
          {post.vote_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comment_count}
        </span>
      </div>
    </motion.article>
  );
}

function PostMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-accent"
        aria-label="더보기"
      >
        <MoreVertical className="h-4 w-4 text-muted-foreground/70" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-8 z-50 w-28 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-foreground hover:bg-accent"
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const PostCard = memo(function PostCard({
  post,
  blurred,
  isOwner,
  onEdit,
  onDelete,
}: {
  post: BoardPost;
  blurred: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}): ReactElement {
  const boardLabel = COPY.BOARD_NAME[post.board] ?? post.board;

  const router = useRouter();

  function handleCardClick(e: React.MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    router.push(`/board/${post.slug}`);
  }

  return (
    <motion.article
      variants={fadeSlideUp}
      className="cursor-pointer rounded-2xl bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-muted-foreground/70">
            {post.profiles?.nickname?.charAt(0) ?? "?"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-foreground">
                {post.profiles?.nickname ?? "익명"}
              </p>
              {post.profiles?.role === "admin" && (
                <span className="rounded bg-foreground/10 px-1 py-0.5 text-[9px] font-bold text-foreground">
                  {COPY.BOARD_ADMIN_BADGE}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.scan_id && post.norwood_grade &&
            (() => {
              const gc = getGradeConfig(post.norwood_grade);
              return (
                <span
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full py-1 pl-1 pr-2.5 text-[11px] font-bold text-white"
                  style={{ backgroundColor: gc.color }}
                >
                  <EagleIcon grade={post.norwood_grade} size={18} />
                  {post.score ? `${Number(post.score).toFixed(1)}점` : "AI 분석"}
                </span>
              );
            })()}
          {isOwner && <PostMenu onEdit={onEdit} onDelete={onDelete} />}
        </div>
      </div>

      <h3 className="mb-1.5 text-sm font-bold text-foreground">{post.title}</h3>
      <p
        className={`line-clamp-2 text-sm leading-relaxed text-muted-foreground ${blurred ? "select-none blur-[6px]" : ""}`}
      >
        {post.content}
      </p>

      {/* 이미지 썸네일 프리뷰 */}
      {post.images && post.images.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5">
          {post.images.slice(0, 3).map((img, idx) => {
            const url = (img.thumbnailUrl ?? img.url) as string;
            const blurClass =
              img.blurLevel === "heavy"
                ? "blur-[8px]"
                : img.blurLevel === "light"
                  ? "blur-[3px]"
                  : "";
            return (
              <div
                key={idx}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-accent ${blurred ? "blur-[6px]" : ""}`}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              >
                <FallbackImage
                  src={url}
                  alt={`첨부 이미지 ${idx + 1}`}
                  fill
                  className={`pointer-events-none object-cover ${blurClass}`}
                  sizes="64px"
                  draggable={false}
                />
              </div>
            );
          })}
          {post.images.length > 3 && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-accent">
              <span className="text-xs font-medium text-muted-foreground">
                +{post.images.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {post.tags.map((tag) => {
            const color = getTagColor(tag);
            return (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color.bg} ${color.text}`}
              >
                #{tag}
              </span>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground/70">
        <span className="flex items-center gap-1">
          <Feather className="h-3.5 w-3.5" />
          {post.vote_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comment_count}
        </span>
        <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground/70">
          {boardLabel}
        </span>
      </div>
    </motion.article>
  );
});

/* ── Page ── */

export default function BoardPage(): ReactElement {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(TAB_ALL);
  const [page, setPage] = useState(1);
  const isGuest = !user;

  const boardFilter =
    activeTab === TAB_ALL ? undefined : TAB_TO_BOARD[activeTab];
  const { data, isLoading: postsLoading } = useBoardPosts(
    boardFilter,
    page,
  );
  const allPosts = data?.posts ?? [];
  const pinnedPosts = allPosts.filter((p) => p.is_pinned);
  const posts = allPosts.filter((p) => !p.is_pinned);
  const pagination = data?.pagination;

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [showWrite, setShowWrite] = useState(false);
  const [editTarget, setEditTarget] = useState<BoardPost | null>(null);

  function handleWrite(formData: {
    board: string;
    title: string;
    content: string;
    images?: { url: string; thumbnailUrl: string }[];
    medication?: string;
    procedure?: string;
  }): void {
    const tags: string[] = [];
    if (formData.medication) tags.push(formData.medication);
    if (formData.procedure) tags.push(formData.procedure);

    createPost.mutate(
      {
        board: formData.board as BoardType,
        title: formData.title,
        content: formData.content,
        images: formData.images,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: () => setShowWrite(false),
      },
    );
  }

  function handleEdit(formData: {
    board: string;
    title: string;
    content: string;
  }): void {
    if (!editTarget) return;
    updatePost.mutate(
      {
        postId: editTarget.id,
        board: formData.board,
        title: formData.title,
        content: formData.content,
      },
      {
        onSuccess: () => setEditTarget(null),
      },
    );
  }

  function handleDelete(postId: string): void {
    if (!confirm("게시글을 삭제할까요?")) return;
    deletePost.mutate({ postId });
  }

  function handleTabChange(tab: string): void {
    setActiveTab(tab);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageContainer className="py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-lg font-bold text-foreground md:text-xl">
            {COPY.PAGE_TITLE_BOARD}
          </h1>
          {isGuest && !authLoading && (
            <p className="mt-1 text-sm text-muted-foreground">
              {COPY.BOARD_PREVIEW_TITLE}
            </p>
          )}
        </motion.div>

        {/* Tab chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-none">
          {BOARD_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="relative">
          {postsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-foreground" />
            </div>
          ) : (
            <motion.div
              key={activeTab}
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {pinnedPosts.map((pinned) => (
                <PinnedCard key={pinned.id} post={pinned} />
              ))}

              {posts.length === 0 && pinnedPosts.length === 0 && (
                <motion.div
                  variants={fadeSlideUp}
                  className="rounded-2xl bg-card p-8 text-center shadow-sm"
                >
                  <p className="text-sm text-muted-foreground">
                    {COPY.EMPTY_POSTS}
                  </p>
                </motion.div>
              )}

              {posts.map((post) => {
                const isOwner = !!user && post.user_id === user.id;
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    blurred={isGuest}
                    isOwner={isOwner}
                    onEdit={() => setEditTarget(post)}
                    onDelete={() => handleDelete(post.id)}
                  />
                );
              })}
            </motion.div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-card disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-xs text-muted-foreground/70">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-card disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}

          {/* Guest login CTA overlay */}
          {isGuest && !authLoading && allPosts.length > 0 && (
            <>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-background via-background/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-6">
                <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl bg-card/95 px-8 py-6 shadow-lg backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10">
                    <Lock className="h-6 w-6 text-foreground" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {COPY.BOARD_PREVIEW_LOGIN_DESC}
                  </p>
                  <Link
                    href="/login"
                    className="rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background shadow-md shadow-black/15 transition-all hover:bg-foreground/85 hover:shadow-lg hover:shadow-black/20 active:scale-95"
                  >
                    {COPY.BOARD_PREVIEW_LOGIN_CTA}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </PageContainer>

      {/* FAB: Write button */}
      {!isGuest && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowWrite(true)}
          className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
          aria-label="글쓰기"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showWrite && (
          <WritePostModal
            onClose={() => setShowWrite(false)}
            onSubmit={handleWrite}
          />
        )}
        {editTarget && (
          <WritePostModal
            onClose={() => setEditTarget(null)}
            onSubmit={handleEdit}
            initial={{
              board: editTarget.board,
              title: editTarget.title,
              content: editTarget.content,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
