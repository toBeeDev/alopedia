"use client";

import Link from "next/link";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-6 sm:px-8 md:max-w-2xl md:px-12 lg:max-w-4xl xl:max-w-5xl">
        {/* ── Hero with HandWrittenTitle ── */}
        <section className="overflow-hidden">
          <HandWrittenTitle title={COPY.APP_NAME} subtitle={COPY.APP_TAGLINE} />
        </section>

        {/* ── Guest Trial CTA ── */}
        <section className="flex flex-col items-center gap-3 py-8">
          <Link
            href="/try"
            className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-8 py-4 text-base font-bold text-background shadow-lg shadow-black/15 transition-all hover:bg-foreground/85 active:scale-[0.98]"
          >
            <EagleIcon grade={1} size={22} />
            독수리한테 두피 보여주기
          </Link>
          <p className="text-xs text-muted-foreground">
            {COPY.SEO_CTA_SUB}
          </p>
        </section>
      </main>
    </div>
  );
}
