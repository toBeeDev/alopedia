"use client";

import { useState, useRef, useEffect, type ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Feather,
  MessageCircle,
  Megaphone,
  Send,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import PageContainer from "@/components/layout/PageContainer";
import { COPY } from "@/constants/copy";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { getGradeConfig } from "@/constants/gradeConfig";
import { useAuth } from "@/hooks/useAuth";
import { usePostDetail, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/usePostDetail";
import { useUpdatePost, useDeletePost } from "@/hooks/useBoardPosts";
import { useVote } from "@/hooks/useVote";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import type { BoardType } from "@/types/database";

const WritePostModal = dynamic(
  () => import("@/components/board/WritePostModal"),
  { ssr: false },
);
const DeletePinModal = dynamic(
  () => import("@/components/board/DeletePinModal"),
  { ssr: false },
);

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

/* ── Page ── */

export default function PostDetailPage(): ReactElement {
  const { id: slug } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading, error } = usePostDetail(slug);
  const postId = (data?.post as { id: string } | undefined)?.id ?? "";
  const createComment = useCreateComment(postId);
  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const vote = useVote();

  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentInput, setEditCommentInput] = useState("");
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);

  const post = data?.post as {
    id: string;
    user_id: string;
    board: BoardType;
    title: string;
    content: string;
    tags: string[];
    images: Record<string, string>[] | null;
    vote_count: number;
    comment_count: number;
    scan_id: string | null;
    norwood_grade: number | null;
    score: number | null;
    is_pinned: boolean;
    created_at: string;
    profiles: { nickname: string; avatar_seed: string | null; role: "user" | "admin" };
  } | undefined;

  const comments = data?.comments ?? [];
  const isOwner = !!user && post?.user_id === user.id;
  const boardLabel = post ? (COPY.BOARD_NAME[post.board] ?? post.board) : "";

  function handleSubmitComment(): void {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    createComment.mutate(
      { content: trimmed, parentId: replyTo ?? undefined },
      {
        onSuccess: () => {
          setCommentInput("");
          setReplyTo(null);
        },
      },
    );
  }

  function handleEdit(formData: {
    board: string;
    title: string;
    content: string;
  }): void {
    if (!post) return;
    updatePost.mutate(
      {
        postId: post.id,
        board: formData.board,
        title: formData.title,
        content: formData.content,
      },
      { onSuccess: () => setShowEdit(false) },
    );
  }

  function handleDelete(pin: string): void {
    if (!post) return;
    deletePost.mutate(
      { postId: post.id, deletePin: pin },
      { onSuccess: () => router.push("/board") },
    );
  }

  function handleVote(): void {
    if (!user || !post) return;
    vote.mutate({ targetType: "post", targetId: post.id });
  }

  if (isLoading) {
    return (
      <PageContainer className="flex min-h-[60vh] items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </PageContainer>
    );
  }

  if (error || !post) {
    return (
      <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">게시글을 찾을 수 없어요.</p>
        <Link
          href="/board"
          className="text-sm font-medium text-foreground hover:underline"
        >
          게시판으로 돌아가기
        </Link>
      </PageContainer>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => !!c.parent_id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageContainer className="py-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* 뒤로가기 */}
          <motion.div variants={fadeSlideUp}>
            <Link
              href="/board"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground/70 hover:text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              게시판
            </Link>
          </motion.div>

          {/* 게시글 본문 */}
          <motion.article
            variants={fadeSlideUp}
            className="rounded-2xl bg-card p-6 shadow-sm"
          >
            {/* 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-muted-foreground/70">
                  {post.profiles?.nickname?.charAt(0) ?? "?"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">
                      {post.profiles?.nickname ?? "익명"}
                    </p>
                    {post.is_pinned && (
                      <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold leading-tight text-background">
                        {COPY.BOARD_NOTICE_BADGE}
                      </span>
                    )}
                    {post.profiles?.role === "admin" && (
                      <span className="rounded-md bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold leading-tight text-foreground">
                        {COPY.BOARD_ADMIN_BADGE}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                    <span>{formatTimeAgo(post.created_at)}</span>
                    <span>·</span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium">
                      {boardLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 더보기 메뉴 */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                    aria-label="더보기"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground/70" />
                  </button>
                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute right-0 top-10 z-50 w-28 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border"
                        >
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              setShowEdit(true);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-foreground hover:bg-accent"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            수정
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              setShowDelete(true);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            삭제
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* 제목 */}
            <h1 className="mb-3 text-lg font-bold text-foreground">
              {post.title}
            </h1>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* AI 분석 카드 */}
            {post.norwood_grade && (
              <div
                className="mb-4 rounded-xl p-3"
                style={{ backgroundColor: `${getGradeConfig(post.norwood_grade).color}10` }}
              >
                <div className="flex items-center gap-2.5">
                  <EagleIcon grade={post.norwood_grade} size={28} />
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: getGradeConfig(post.norwood_grade).color }}
                    >
                      {getGradeConfig(post.norwood_grade).eagleLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {post.score ? `${Number(post.score).toFixed(1)}점` : ""} · AI 분석 결과
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 공유된 이미지 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
                {post.images.map((img, idx) => {
                  const blurClass =
                    img.blurLevel === "heavy"
                      ? "blur-[8px]"
                      : img.blurLevel === "light"
                        ? "blur-[3px]"
                        : "";
                  return (
                    <div
                      key={idx}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
                    >
                      <Image
                        src={img.thumbnailUrl ?? img.url}
                        alt={`두피 사진 ${idx + 1}`}
                        fill
                        className={`object-cover ${blurClass}`}
                        sizes="96px"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* 본문 */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {post.content}
            </div>

            {/* 하단 액션 */}
            <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground/70">
              <button
                onClick={handleVote}
                disabled={!user || vote.isPending}
                className="flex items-center gap-1 transition-colors hover:text-foreground disabled:opacity-50"
              >
                <Feather className="h-4 w-4" />
                {COPY.FEATHER_LIKE_ACTION} {post.vote_count}
              </button>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                댓글 {post.comment_count}
              </span>
            </div>
          </motion.article>

          {/* 댓글 섹션 */}
          <motion.section variants={fadeSlideUp} className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              댓글 {comments.length}개
            </h3>

            {topLevelComments.length === 0 && (
              <div className="rounded-2xl bg-card p-6 text-center shadow-sm">
                <p className="text-sm text-muted-foreground/70">
                  아직 댓글이 없어요. 첫 댓글을 남겨보세요!
                </p>
              </div>
            )}

            {topLevelComments.map((comment) => {
              const commentReplies = replies.filter(
                (r) => r.parent_id === comment.id,
              );
              const isCommentOwner = !!user && comment.user_id === user.id;
              const canManageComment = isCommentOwner || isOwner;

              return (
                <div key={comment.id} className="space-y-2">
                  {/* 댓글 */}
                  <div className="rounded-2xl bg-card p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-muted-foreground/70">
                          {comment.profiles?.nickname?.charAt(0) ?? "?"}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {comment.profiles?.nickname ?? "익명"}
                        </span>
                        <span className="text-[11px] text-muted-foreground/70">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      {canManageComment && (
                        <div className="relative">
                          <button
                            onClick={() => setCommentMenuId(commentMenuId === comment.id ? null : comment.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent"
                            aria-label="댓글 더보기"
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                          </button>
                          <AnimatePresence>
                            {commentMenuId === comment.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setCommentMenuId(null)} />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="absolute right-0 top-8 z-50 w-24 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border"
                                >
                                  {isCommentOwner && (
                                    <button
                                      onClick={() => {
                                        setCommentMenuId(null);
                                        setEditingCommentId(comment.id);
                                        setEditCommentInput(comment.content);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent"
                                    >
                                      <Pencil className="h-3 w-3" />
                                      수정
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setCommentMenuId(null);
                                      deleteComment.mutate(comment.id);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    삭제
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editCommentInput}
                          onChange={(e) => setEditCommentInput(e.target.value)}
                          className="flex-1 rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              updateComment.mutate(
                                { commentId: comment.id, content: editCommentInput },
                                { onSuccess: () => setEditingCommentId(null) },
                              );
                            }
                            if (e.key === "Escape") setEditingCommentId(null);
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            updateComment.mutate(
                              { commentId: comment.id, content: editCommentInput },
                              { onSuccess: () => setEditingCommentId(null) },
                            );
                          }}
                          disabled={updateComment.isPending || !editCommentInput.trim()}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background hover:bg-foreground/85 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-xs text-muted-foreground/70 hover:text-muted-foreground"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {comment.content}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground/70">
                      <button
                        onClick={() =>
                          setReplyTo(
                            replyTo === comment.id ? null : comment.id,
                          )
                        }
                        className="hover:text-foreground"
                      >
                        답글
                      </button>
                      {comment.vote_count > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Feather className="h-3 w-3" />
                          {comment.vote_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 대댓글 */}
                  {commentReplies.map((reply) => {
                    const isReplyOwner = !!user && reply.user_id === user.id;
                    const canManageReply = isReplyOwner || isOwner;

                    return (
                      <div
                        key={reply.id}
                        className="ml-8 rounded-2xl bg-muted p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-border text-[9px] font-bold text-muted-foreground/70">
                              {reply.profiles?.nickname?.charAt(0) ?? "?"}
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {reply.profiles?.nickname ?? "익명"}
                            </span>
                            <span className="text-[11px] text-muted-foreground/70">
                              {formatTimeAgo(reply.created_at)}
                            </span>
                          </div>
                          {canManageReply && (
                            <div className="relative">
                              <button
                                onClick={() => setCommentMenuId(commentMenuId === reply.id ? null : reply.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent"
                                aria-label="답글 더보기"
                              >
                                <MoreVertical className="h-3 w-3 text-muted-foreground/50" />
                              </button>
                              <AnimatePresence>
                                {commentMenuId === reply.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setCommentMenuId(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.9 }}
                                      className="absolute right-0 top-8 z-50 w-24 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border"
                                    >
                                      {isReplyOwner && (
                                        <button
                                          onClick={() => {
                                            setCommentMenuId(null);
                                            setEditingCommentId(reply.id);
                                            setEditCommentInput(reply.content);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent"
                                        >
                                          <Pencil className="h-3 w-3" />
                                          수정
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setCommentMenuId(null);
                                          deleteComment.mutate(reply.id);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        삭제
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {editingCommentId === reply.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editCommentInput}
                              onChange={(e) => setEditCommentInput(e.target.value)}
                              className="flex-1 rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  updateComment.mutate(
                                    { commentId: reply.id, content: editCommentInput },
                                    { onSuccess: () => setEditingCommentId(null) },
                                  );
                                }
                                if (e.key === "Escape") setEditingCommentId(null);
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                updateComment.mutate(
                                  { commentId: reply.id, content: editCommentInput },
                                  { onSuccess: () => setEditingCommentId(null) },
                                );
                              }}
                              disabled={updateComment.isPending || !editCommentInput.trim()}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background hover:bg-foreground/85 disabled:opacity-50"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="text-xs text-muted-foreground/70 hover:text-muted-foreground"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {reply.content}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* 답글 입력 */}
                  {replyTo === comment.id && user && (
                    <div className="ml-8 flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="답글을 입력하세요"
                        className="flex-1 rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitComment();
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSubmitComment}
                        disabled={createComment.isPending || !commentInput.trim()}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background transition-colors hover:bg-foreground/85 disabled:opacity-50"
                      >
                        {createComment.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.section>

          {/* 댓글 입력 (하단 고정) */}
          {user && !replyTo && (
            <motion.div
              variants={fadeSlideUp}
              className="sticky bottom-4 z-20"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-lg ring-1 ring-border">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  className="flex-1 rounded-xl border-0 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={createComment.isPending || !commentInput.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background transition-colors hover:bg-foreground/85 disabled:opacity-50"
                >
                  {createComment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* 비로그인 안내 */}
          {!user && (
            <motion.div
              variants={fadeSlideUp}
              className="rounded-2xl bg-card p-6 text-center shadow-sm"
            >
              <p className="mb-3 text-sm text-muted-foreground">
                댓글을 남기려면 로그인이 필요해요
              </p>
              <Link
                href="/login"
                className="inline-flex rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-md shadow-black/15 transition-all hover:bg-foreground/85 active:scale-95"
              >
                로그인하기
              </Link>
            </motion.div>
          )}
        </motion.div>
      </PageContainer>

      {/* Modals */}
      <AnimatePresence>
        {showEdit && (
          <WritePostModal
            onClose={() => setShowEdit(false)}
            onSubmit={handleEdit}
            initial={{
              board: post.board,
              title: post.title,
              content: post.content,
            }}
          />
        )}
        {showDelete && (
          <DeletePinModal
            onClose={() => setShowDelete(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
