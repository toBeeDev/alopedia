import type { Metadata } from "next";
import Link from "next/link";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";

export const metadata: Metadata = {
  title: "Alopedia — AI 두피 분석",
  description:
    "사진 한 장으로 AI가 두피 상태를 분석합니다. 노우드-해밀턴 스케일 기반 5단계 분석, 변화 추적, 익명 커뮤니티.",
  openGraph: {
    title: "Alopedia — AI 두피 분석",
    description:
      "사진 한 장으로 AI가 두피 상태를 분석합니다. 변화를 추적하고, 같은 고민을 가진 사람들과 경험을 나눠보세요.",
    url: SITE_URL,
    siteName: "Alopedia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Alopedia — AI 두피 분석",
      },
    ],
  },
};

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
