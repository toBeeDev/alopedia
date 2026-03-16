import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** Auto check-in on app load (once per session) */
export function useCheckIn(): void {
  const queryClient = useQueryClient();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    fetch("/api/profile/check-in", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.checkedIn) {
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["profile", "stats"] });
        }
      })
      .catch(() => {
        // Silent fail — check-in is non-critical
      });
  }, [queryClient]);
}
