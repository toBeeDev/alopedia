"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { COPY } from "@/constants/copy";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  children: ReactNode;
}

export default function PremiumGate({ children }: Props): ReactNode {
  const { data } = useProfile();
  const profile = data?.profile;

  const premiumUntil = profile?.diary_premium_until
    ? new Date(profile.diary_premium_until)
    : null;

  const now = new Date();
  const isPremium = premiumUntil !== null && premiumUntil > now;

  const daysRemaining = isPremium
    ? Math.ceil((premiumUntil!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (isPremium) {
    return (
      <>
        {daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="rounded-xl bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-600">
            {COPY.DIARY_REPORT_TRIAL_REMAINING(daysRemaining)}
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
        <div className="rounded-full bg-muted p-3">
          <Lock className="h-5 w-5" />
        </div>
        <p className="mt-3 font-semibold text-sm">{COPY.DIARY_REPORT_LOCKED_TITLE}</p>
        <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground">
          {COPY.DIARY_REPORT_LOCKED_DESC}
        </p>
        <button
          disabled
          className="mt-4 rounded-lg bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground cursor-not-allowed"
        >
          {COPY.DIARY_REPORT_SUBSCRIBE_CTA}
        </button>
      </div>
    </div>
  );
}
