import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DiaryEntry, DiaryCalendarDot } from "@/types/diary";

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
      return res.json() as Promise<{ entry: DiaryEntry; analysis: Record<string, unknown> | null }>;
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

/** Create diary entry */
export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      scanId?: string;
      date: string;
      memo?: string;
      isPublic?: boolean;
      isPhotoPublic?: boolean;
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
      memo?: string;
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
