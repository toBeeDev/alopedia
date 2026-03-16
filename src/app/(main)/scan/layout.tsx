import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "두피 업로드",
  description: "정수리, 앞이마, 측면이마 사진을 업로드하면 AI가 두피 상태를 분석합니다.",
};

export default function ScanLayout({ children }: { children: ReactNode }) {
  return children;
}
