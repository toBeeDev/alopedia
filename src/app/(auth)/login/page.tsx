"use client";

import { useCallback, useState, type ReactElement } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { COPY } from "@/constants/copy";

export default function LoginPage(): ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

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
          <div className="space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary" />
              <span className="text-xs text-muted-foreground">
                <Link href="/terms" className="underline" target="_blank">{COPY.TERMS_AGREE}</Link>
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary" />
              <span className="text-xs text-muted-foreground">
                <Link href="/privacy" className="underline" target="_blank">{COPY.PRIVACY_AGREE}</Link>
              </span>
            </label>
          </div>
          <Button
            onClick={() => handleSocialLogin("kakao")}
            disabled={!termsAgreed || !privacyAgreed || isLoading}
            className="w-full bg-[#FEE500] py-6 text-sm font-medium text-[#191919] hover:bg-[#FDD835]"
          >
            카카오로 시작하기
          </Button>
        </div>

      </div>
    </div>
  );
}
