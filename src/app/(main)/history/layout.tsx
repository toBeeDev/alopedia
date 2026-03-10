import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "분석 기록",
  description: "지금까지의 두피 분석 기록을 타임라인으로 확인하세요.",
};

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
