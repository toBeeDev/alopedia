import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { VoteTargetType } from "@/types/database";
import type { BoardPostsResponse } from "@/hooks/useBoardPosts";

/** 깃털 투척 (toggle) with optimistic update */
export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      targetType: VoteTargetType;
      targetId: string;
    }) => {
      const res = await fetch("/api/board/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "투표에 실패했어요.");
      }
      return res.json() as Promise<{ voted: boolean }>;
    },

    onMutate: async (variables) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["boardPosts"] });
      await queryClient.cancelQueries({ queryKey: ["postDetail"] });

      // Snapshot previous values for rollback
      const previousBoardPosts = queryClient.getQueriesData<BoardPostsResponse>({
        queryKey: ["boardPosts"],
      });

      // Optimistically update vote_count in board posts cache
      if (variables.targetType === "post") {
        queryClient.setQueriesData<BoardPostsResponse>(
          { queryKey: ["boardPosts"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              posts: old.posts.map((post) =>
                post.id === variables.targetId
                  ? { ...post, vote_count: post.vote_count + 1 }
                  : post,
              ),
            };
          },
        );
      }

      return { previousBoardPosts };
    },

    onSuccess: (data, variables) => {
      // Correct the optimistic update with actual result
      if (variables.targetType === "post") {
        queryClient.setQueriesData<BoardPostsResponse>(
          { queryKey: ["boardPosts"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              posts: old.posts.map((post) => {
                if (post.id !== variables.targetId) return post;
                // We optimistically added +1, now correct based on actual result
                const delta = data.voted ? 0 : -2; // voted=true: already +1, correct. voted=false: was +1 but should be -1
                return { ...post, vote_count: post.vote_count + delta };
              }),
            };
          },
        );
      }

      // Refetch post detail to sync vote state
      queryClient.invalidateQueries({ queryKey: ["postDetail"] });
    },

    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousBoardPosts) {
        for (const [queryKey, data] of context.previousBoardPosts) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
  });
}
