import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DiaryEntry, DiaryCalendarDot, DiaryComment } from "@/types/diary";

interface DiaryEntriesResponse {
  entries: DiaryEntry[];
}

interface DiaryPublicResponse {
  entries: DiaryEntry[];
  pagination: { page: number; pageSize: number; total: number };
}

const STALE_TIME = 1000 * 60 * 5;

/** Fetch own diary entries for a month */
export function useDiaryEntries(month: string) {
  return useQuery<DiaryEntriesResponse>({
    queryKey: ["diary", "entries", month],
    queryFn: async (): Promise<DiaryEntriesResponse> => {
      const res = await fetch(`/api/diary/entries?month=${month}`);
      if (!res.ok) throw new Error("다이어리를 불러올 수 없어요.");
      return res.json();
    },
    staleTime: STALE_TIME,
  });
}

/** Derive calendar dots from entries */
export function useDiaryCalendar(month: string): DiaryCalendarDot[] {
  const { data } = useDiaryEntries(month);
  if (!data?.entries) return [];
  return data.entries.map((entry) => ({
    date: entry.date,
    norwoodGrade: entry.analysis?.norwoodGrade ?? null,
    hasEntry: true,
  }));
}

/** Fetch single diary entry */
export function useDiaryEntry(id: string) {
  return useQuery({
    queryKey: ["diary", "entry", id],
    queryFn: async () => {
      const res = await fetch(`/api/diary/entries/${id}`);
      if (!res.ok) throw new Error("기록을 불러올 수 없어요.");
      return res.json() as Promise<{
        entry: DiaryEntry;
        analysis: Record<string, unknown> | null;
        liked: boolean;
        stats: { viewCount: number; likeCount: number; commentCount: number };
      }>;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

/** Fetch public diary feed */
export function usePublicDiary(page = 1) {
  return useQuery<DiaryPublicResponse>({
    queryKey: ["diary", "public", page],
    queryFn: async (): Promise<DiaryPublicResponse> => {
      const res = await fetch(`/api/diary/entries?public=true&page=${page}`);
      if (!res.ok) throw new Error("공개 다이어리를 불러올 수 없어요.");
      return res.json();
    },
    staleTime: STALE_TIME,
    placeholderData: (prev) => prev,
  });
}

/** Fetch public diary feed with infinite scroll */
export function usePublicDiaryInfinite() {
  return useInfiniteQuery<DiaryPublicResponse>({
    queryKey: ["diary", "public", "infinite"],
    queryFn: async ({ pageParam }): Promise<DiaryPublicResponse> => {
      const res = await fetch(`/api/diary/entries?public=true&page=${pageParam}`);
      if (!res.ok) throw new Error("공개 다이어리를 불러올 수 없어요.");
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If we got a full page, there might be more
      if (lastPage.entries.length >= 20) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: STALE_TIME,
  });
}

/** Create diary entry */
export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      scanId?: string;
      date: string;
      title?: string;
      memo?: string;
      isPublic?: boolean;
      isPhotoPublic?: boolean;
      blurLevel?: string;
      checklists?: { category: string; item: string; checked: boolean }[];
    }) => {
      const res = await fetch("/api/diary/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "저장에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
    },
  });
}

/** Update diary entry */
export function useUpdateDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      title?: string;
      memo?: string;
      blurLevel?: string;
      isPublic?: boolean;
      isPhotoPublic?: boolean;
      checklists?: { category: string; item: string; checked: boolean }[];
    }) => {
      const res = await fetch(`/api/diary/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "수정에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
    },
  });
}

/** Delete diary entry */
export function useDeleteDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/diary/entries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "삭제에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
    },
  });
}

/** Toggle like on diary entry */
export function useDiaryLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const res = await fetch(`/api/diary/entries/${entryId}/like`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "좋아요에 실패했어요.");
      }
      return res.json() as Promise<{ liked: boolean }>;
    },
    onSuccess: (_data, entryId) => {
      queryClient.invalidateQueries({ queryKey: ["diary", "entry", entryId] });
    },
  });
}

/** Fetch comments for a diary entry */
export function useDiaryComments(entryId: string) {
  return useQuery<{ comments: DiaryComment[] }>({
    queryKey: ["diary", "comments", entryId],
    queryFn: async () => {
      const res = await fetch(`/api/diary/entries/${entryId}/comments`);
      if (!res.ok) throw new Error("댓글을 불러올 수 없어요.");
      return res.json();
    },
    enabled: !!entryId,
    staleTime: 1000 * 60,
  });
}

/** Create a comment on a diary entry */
export function useCreateDiaryComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, content }: { entryId: string; content: string }) => {
      const res = await fetch(`/api/diary/entries/${entryId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "댓글 작성에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: (_data, { entryId }) => {
      queryClient.invalidateQueries({ queryKey: ["diary", "comments", entryId] });
      queryClient.invalidateQueries({ queryKey: ["diary", "entry", entryId] });
    },
  });
}

/** Delete a comment */
export function useDeleteDiaryComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId }: { commentId: string; entryId: string }) => {
      const res = await fetch(`/api/diary/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "댓글 삭제에 실패했어요.");
      }
      return res.json();
    },
    onSuccess: (_data, { entryId }) => {
      queryClient.invalidateQueries({ queryKey: ["diary", "comments", entryId] });
      queryClient.invalidateQueries({ queryKey: ["diary", "entry", entryId] });
    },
  });
}
