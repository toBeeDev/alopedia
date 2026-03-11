"use client";

import { useCallback, useState, type ReactElement } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { COPY } from "@/constants/copy";

export default function LoginPage(): ReactElement {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = useCallback(async (provider: "kakao"): Promise<void> => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#323338]">
            {COPY.APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-[#676879]">
            {COPY.APP_TAGLINE}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => handleSocialLogin("kakao")}
            disabled={isLoading}
            className="w-full bg-[#FEE500] py-6 text-sm font-medium text-[#191919] hover:bg-[#FDD835]"
          >
            카카오로 시작하기
          </Button>
        </div>

      </div>
    </div>
  );
}
