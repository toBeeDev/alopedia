import { useQuery } from "@tanstack/react-query";
import type { DiaryReportData } from "@/types/diary";

export function useDiaryReport() {
  return useQuery<DiaryReportData>({
    queryKey: ["diary", "report"],
    queryFn: async (): Promise<DiaryReportData> => {
      const res = await fetch("/api/diary/report");
      if (res.status === 403) throw new Error("PREMIUM_REQUIRED");
      if (!res.ok) throw new Error("리포트를 불러올 수 없어요.");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
