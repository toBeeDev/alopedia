import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { VoteTargetType } from "@/types/database";

/** 깃털 투척 (toggle) */
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boardPosts"] });
      queryClient.invalidateQueries({ queryKey: ["postDetail"] });
    },
  });
}
