import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  return { user, isLoading, signOut };
}
