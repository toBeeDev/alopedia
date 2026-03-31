import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Alopedia",
  description: "Alopedia 개인정보처리방침 — 수집 항목, 목적, 보관 기간, 이용자 권리를 안내합니다.",
};

export default function PrivacyLayout({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>;
}
