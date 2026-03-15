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

/** 게시글 목록 조회 */
export function useBoardPosts(board?: BoardType, page = 1) {
  return useQuery<BoardPostsResponse>({
    queryKey: ["boardPosts", board, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (board) params.set("board", board);
      params.set("page", String(page));
      const res = await fetch(`/api/board/posts?${params}`);
      if (!res.ok) throw new Error("게시글을 불러올 수 없어요.");
      return res.json();
    },
  });
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
      deletePin: string;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boardPosts"] });
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
    },
  });
}

/** 게시글 삭제 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      deletePin,
    }: {
      postId: string;
      deletePin: string;
    }) => {
      const res = await fetch(`/api/board/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletePin }),
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
