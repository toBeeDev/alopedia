"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Supabase Realtime Presence 기반 실시간 접속자 수 훅.
 * 채널에 join하면 자동으로 카운트에 포함되고, 페이지 이탈 시 제거됨.
 */
export function useOnlineCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const presenceKey = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const channel: RealtimeChannel = supabase.channel("online-users", {
      config: { presence: { key: presenceKey } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
