import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "이용약관 | Alopedia",
  description: "Alopedia 이용약관 — 서비스 개요, 의료 면책 조항, 이용 규칙을 안내합니다.",
};

export default function TermsLayout({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>;
}
