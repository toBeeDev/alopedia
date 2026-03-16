import { useQuery } from "@tanstack/react-query";

interface DailyRemainingData {
  remaining: number;
  used: number;
  limit: number;
}

export function useDailyRemaining(): {
  data: DailyRemainingData | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery<DailyRemainingData>({
    queryKey: ["daily-remaining"],
    queryFn: async () => {
      const res = await fetch("/api/scans/daily-remaining");
      if (!res.ok) throw new Error("Failed to fetch daily remaining");
      return res.json();
    },
    staleTime: 60_000,
  });

  return { data, isLoading };
}
