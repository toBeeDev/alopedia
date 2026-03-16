import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CommentAuthor {
  nickname: string;
  avatar_seed: string | null;
}

interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  vote_count: number;
  created_at: string;
  profiles: CommentAuthor;
}

/** 게시글 상세 + 댓글 조회 (slug 또는 UUID) */
export function usePostDetail(slugOrId: string) {
  return useQuery({
    queryKey: ["postDetail", slugOrId],
    queryFn: async () => {
      const res = await fetch(`/api/board/posts/${slugOrId}`);
      if (!res.ok) throw new Error("게시글을 불러올 수 없어요.");
      return res.json() as Promise<{
        post: Record<string, unknown>;
        comments: PostComment[];
      }>;
    },
    enabled: !!slugOrId,
  });
}

/** 댓글 작성 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      const res = await fetch(`/api/board/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "댓글 작성에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail", postId] });
      queryClient.invalidateQueries({ queryKey: ["boardPosts"] });
    },
  });
}

/** 댓글 수정 */
export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const res = await fetch(`/api/board/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "댓글 수정에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail", postId] });
    },
  });
}

/** 댓글 삭제 */
export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/board/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "댓글 삭제에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail", postId] });
      queryClient.invalidateQueries({ queryKey: ["boardPosts"] });
    },
  });
}

export type { PostComment };
