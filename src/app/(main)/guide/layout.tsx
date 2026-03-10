import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "분석 가이드",
  description:
    "AI 두피 분석 방법, 노우드-해밀턴 5단계 등급 체계, 촬영 가이드를 확인하세요.",
};

export default function GuideLayout({ children }: { children: ReactNode }) {
  return children;
}
