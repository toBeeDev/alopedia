import Link from "next/link";
import { COPY } from "@/constants/copy";
import type { ReactElement } from "react";

export default function LightFooter(): ReactElement {
  return (
    <footer className="flex items-center justify-center gap-3 border-t border-border/50 py-4 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground/70">{COPY.APP_NAME}</span>
      <span className="text-border">·</span>
      <Link href="/terms" className="transition-colors hover:text-foreground">이용약관</Link>
      <span className="text-border">·</span>
      <Link href="/privacy" className="transition-colors hover:text-foreground">개인정보처리방침</Link>
      <span className="text-border">·</span>
      <a href="mailto:pediaalo@gmail.com" className="transition-colors hover:text-foreground">문의하기</a>
    </footer>
  );
}
