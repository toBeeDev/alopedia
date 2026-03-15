"use client";

import { type ReactElement } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Scan, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/constants/copy";

const HIDDEN_PATHS = ["/history", "/scan"];

const SOCIAL_LINKS = [
  {
    icon: <Mail className="h-5 w-5" />,
    href: "mailto:support@alopedia.kr",
    label: "이메일",
  },
] as const;

const MAIN_LINKS = [
  { href: "/dashboard", label: COPY.NAV_HOME },
  { href: "/scan", label: COPY.NAV_SCAN },
  { href: "/history", label: COPY.NAV_HISTORY },
  { href: "/board", label: COPY.NAV_BOARD },
  { href: "/guide", label: COPY.NAV_GUIDE },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
] as const;

export default function Footer(): ReactElement | null {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <footer className="pb-24 pt-12 lg:pb-8 lg:pt-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="md:flex md:items-start md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-x-2"
            aria-label={COPY.APP_NAME}
          >
            <Scan className="h-8 w-8 text-foreground" />
            <span className="text-lg font-bold text-foreground">
              {COPY.APP_NAME}
            </span>
          </Link>
          <ul className="mt-4 flex list-none space-x-3 md:mt-0">
            {SOCIAL_LINKS.map((link, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  asChild
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t border-border pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:col-[4/11] lg:mt-0">
            <ul className="-mx-2 -my-1 flex list-none flex-wrap lg:justify-end">
              {MAIN_LINKS.map((link, i) => (
                <li key={i} className="mx-2 my-1 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-4 lg:col-[4/11] lg:mt-0">
            <ul className="-mx-3 -my-1 flex list-none flex-wrap lg:justify-end">
              {LEGAL_LINKS.map((link, i) => (
                <li key={i} className="mx-3 my-1 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground/70 underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 text-sm leading-6 text-muted-foreground/70 lg:col-[1/4] lg:row-[1/3] lg:mt-0">
            <div>&copy; {new Date().getFullYear()} {COPY.APP_NAME}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
