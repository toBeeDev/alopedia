import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "두피 촬영",
  description: "정수리, 앞이마, 측면이마를 촬영하면 AI가 두피 상태를 분석합니다.",
};

export default function ScanLayout({ children }: { children: ReactNode }) {
  return children;
}
