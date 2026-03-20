import { useQuery } from "@tanstack/react-query";
import type { DbScan, DbAnalysis } from "@/types/database";

export interface ScanWithAnalysis extends DbScan {
  analyses: DbAnalysis[];
}

async function fetchScanHistory(): Promise<ScanWithAnalysis[]> {
  const res = await fetch("/api/scans");
  if (!res.ok) {
    throw new Error("스캔 기록을 불러올 수 없어요.");
  }
  const data: { scans: ScanWithAnalysis[] } = await res.json();
  return data.scans;
}

export function useScanHistory() {
  return useQuery<ScanWithAnalysis[]>({
    queryKey: ["scanHistory"],
    queryFn: fetchScanHistory,
    staleTime: 1000 * 60 * 5,
  });
}
