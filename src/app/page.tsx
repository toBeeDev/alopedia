import type { Metadata } from "next";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
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
    <div className="h-dvh overflow-hidden bg-background">
      <main className="h-full">
        <HandWrittenTitle title={COPY.APP_NAME} subtitle={COPY.APP_TAGLINE} />
      </main>
    </div>
  );
}
