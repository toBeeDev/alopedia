import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "프로필",
  description: "내 프로필과 두피 관리 기록을 확인하세요.",
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
