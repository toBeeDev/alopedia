"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DbMonthlyReport } from "@/types/report";

async function fetchLatestReport(): Promise<DbMonthlyReport | null> {
  const res = await fetch("/api/reports/latest");
  if (!res.ok) return null;
  const data: { report: DbMonthlyReport | null } = await res.json();
  return data.report;
}

export function useMonthlyReport(): ReturnType<
  typeof useQuery<DbMonthlyReport | null>
> {
  return useQuery({
    queryKey: ["monthlyReport", "latest"],
    queryFn: fetchLatestReport,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMarkReportRead(): ReturnType<
  typeof useMutation<void, Error, string>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string): Promise<void> => {
      const res = await fetch(`/api/reports/${reportId}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark report as read");
    },
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: ["monthlyReport"] });
    },
  });
}
