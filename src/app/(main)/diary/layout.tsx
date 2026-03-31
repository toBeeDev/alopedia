import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";

export const metadata: Metadata = {
  title: "둥지 일기 | Alopedia",
  description: "매일 두피 상태를 기록하고 AI 분석으로 변화를 추적하세요.",
  openGraph: {
    title: "둥지 일기 | Alopedia",
    description: "매일 두피 상태를 기록하고 AI 분석으로 변화를 추적하세요.",
    url: `${SITE_URL}/diary`,
  },
};

export default function DiaryLayout({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>;
}
