import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BoardType } from "@/types/database";

interface PostAuthor {
  nickname: string;
  avatar_seed: string | null;
  role: "user" | "admin";
}

interface BoardPost {
  id: string;
  slug: string;
  user_id: string;
  board: BoardType;
  title: string;
  content: string;
  tags: string[];
  images: Record<string, unknown>[] | null;
  scan_id: string | null;
  norwood_grade: number | null;
  score: number | null;
  vote_count: number;
  comment_count: number;
  is_adopted: boolean;
  is_pinned: boolean;
  created_at: string;
  profiles: PostAuthor;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface BoardPostsResponse {
  posts: BoardPost[];
  pagination: Pagination;
}

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

/** 게시글 목록 조회 */
export function useBoardPosts(board?: BoardType, page = 1) {
  const queryClient = useQueryClient();

  const query = useQuery<BoardPostsResponse>({
    queryKey: ["boardPosts", board, page],
    queryFn: async (): Promise<BoardPostsResponse> => {
      const params = new URLSearchParams();
      if (board) params.set("board", board);
      params.set("page", String(page));
      const res = await fetch(`/api/board/posts?${params}`);
      if (!res.ok) throw new Error("게시글을 불러올 수 없어요.");
      return res.json();
    },
    staleTime: STALE_TIME,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

  // Prefetch next page
  const totalPages = query.data?.pagination.totalPages ?? 0;
  if (page < totalPages) {
    const nextParams = new URLSearchParams();
    if (board) nextParams.set("board", board);
    nextParams.set("page", String(page + 1));
    queryClient.prefetchQuery({
      queryKey: ["boardPosts", board, page + 1],
      queryFn: async (): Promise<BoardPostsResponse> => {
        const res = await fetch(`/api/board/posts?${nextParams}`);
        if (!res.ok) throw new Error("게시글을 불러올 수 없어요.");
        return res.json();
      },
      staleTime: STALE_TIME,
    });
  }

  return query;
}

/** 게시글 작성 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      board: BoardType;
      title: string;
      content: string;
      tags?: string[];
      scanId?: string;
      norwoodGrade?: number;
      score?: number;
      images?: Record<string, unknown>[];
    }) => {
      const res = await fetch("/api/board/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "게시글 작성에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      // Only invalidate the relevant board + "all" board (page 1)
      queryClient.invalidateQueries({ queryKey: ["boardPosts", variables.board] });
      queryClient.invalidateQueries({ queryKey: ["boardPosts", undefined, 1] });
    },
  });
}

/** 게시글 수정 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      ...data
    }: {
      postId: string;
      board?: string;
      title?: string;
      content?: string;
      tags?: string[];
    }) => {
      const res = await fetch(`/api/board/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "게시글 수정에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boardPosts"] });
      queryClient.invalidateQueries({ queryKey: ["postDetail"] });
    },
  });
}

/** 게시글 삭제 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      const res = await fetch(`/api/board/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "게시글 삭제에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boardPosts"] });
    },
  });
}

export type { BoardPost, Pagination, BoardPostsResponse };
