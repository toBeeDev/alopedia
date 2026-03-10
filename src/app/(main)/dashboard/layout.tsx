import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "대시보드",
  description: "최근 두피 분석 결과와 주요 기능을 한눈에 확인하세요.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
