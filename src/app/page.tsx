"use client";

import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import { COPY } from "@/constants/copy";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-6 sm:px-8 md:max-w-2xl md:px-12 lg:max-w-4xl xl:max-w-5xl">
        {/* ── Hero with HandWrittenTitle ── */}
        <section className="overflow-hidden">
          <HandWrittenTitle title={COPY.APP_NAME} subtitle={COPY.APP_TAGLINE} />
        </section>
      </main>
    </div>
  );
}
