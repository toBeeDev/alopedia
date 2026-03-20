import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";

export const metadata: Metadata = {
  title: "무료 AI 두피 분석 체험",
  description:
    "회원가입 없이 바로 AI 두피 분석을 체험해보세요. 사진을 업로드하면 30초 안에 두피 상태를 분석해드립니다.",
  openGraph: {
    title: "무료 AI 두피 분석 체험 | Alopedia",
    description:
      "회원가입 없이 바로 AI 두피 분석을 체험해보세요. 사진을 업로드하면 30초 안에 두피 상태를 분석해드립니다.",
    url: `${SITE_URL}/try`,
    siteName: "Alopedia",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Alopedia 무료 AI 두피 분석 체험",
      },
    ],
  },
};

interface TryLayoutProps {
  children: ReactNode;
}

export default function TryLayout({ children }: TryLayoutProps): ReactElement {
  return <>{children}</>;
}
