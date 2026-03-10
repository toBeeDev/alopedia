import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "로그인",
  description: "Alopedia에 로그인하고 AI 두피 분석을 시작하세요.",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
