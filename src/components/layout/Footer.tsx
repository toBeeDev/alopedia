import Link from "next/link";
import { COPY } from "@/constants/copy";
import type { ReactElement } from "react";

export default function Footer(): ReactElement {
  return (
    <footer className="flex items-center justify-center gap-3 py-4 text-xs text-muted-foreground">
      <span className="font-semibold">{COPY.APP_NAME}</span>
      <span>·</span>
      <Link href="/terms" className="hover:underline">이용약관</Link>
      <span>·</span>
      <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
    </footer>
  );
}
