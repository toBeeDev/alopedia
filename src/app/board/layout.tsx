import type { Metadata } from "next";
import FloatingMenu from "@/components/layout/FloatingMenu";
import type { ReactElement, ReactNode } from "react";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";

export const metadata: Metadata = {
  title: "커뮤니티",
  description:
    "약물, 시술 후기를 익명으로 공유하고 실질적인 탈모 관리 정보를 나눠보세요.",
  openGraph: {
    title: "커뮤니티 | Alopedia",
    description:
      "탈모약, 모발이식, 메조테라피 등 시술 후기를 익명으로 공유하고 실질적인 탈모 관리 정보를 나눠보세요.",
    url: `${SITE_URL}/board`,
    siteName: "Alopedia",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Alopedia 커뮤니티",
      },
    ],
  },
};

interface BoardLayoutProps {
  children: ReactNode;
}

export default function BoardLayout({
  children,
}: BoardLayoutProps): ReactElement {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-14 lg:pt-0">{children}</main>
      <FloatingMenu />
    </div>
  );
}
