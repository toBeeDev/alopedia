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

/** 게시글 상세 + 댓글 조회 */
export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: ["postDetail", postId],
    queryFn: async () => {
      const res = await fetch(`/api/board/posts/${postId}`);
      if (!res.ok) throw new Error("게시글을 불러올 수 없어요.");
      return res.json() as Promise<{
        post: Record<string, unknown>;
        comments: PostComment[];
      }>;
    },
    enabled: !!postId,
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
    },
  });
}

export type { PostComment };
