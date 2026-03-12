import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DbProfile } from "@/types/database";

export interface ProfileStats {
  scanCount: number;
  postCount: number;
  commentCount: number;
  latestGrade: number | null;
  latestScore: number | null;
}

/** 내 프로필 조회 */
export function useProfile() {
  return useQuery<{ profile: DbProfile }>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("프로필을 불러올 수 없어요.");
      return res.json();
    },
  });
}

/** 활동 통계 조회 */
export function useProfileStats() {
  return useQuery<{ stats: ProfileStats }>({
    queryKey: ["profile", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/profile/stats");
      if (!res.ok) throw new Error("통계를 불러올 수 없어요.");
      return res.json();
    },
  });
}

/** 닉네임 수정 */
export function useUpdateNickname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nickname: string) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "프로필 수정에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/** 아바타 업로드 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "사진 업로드에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
