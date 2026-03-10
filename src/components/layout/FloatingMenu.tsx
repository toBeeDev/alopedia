"use client";

import { type ReactElement, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Camera,
  Clock,
  MessageCircle,
  User,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { COPY } from "@/constants/copy";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: COPY.NAV_HOME, icon: Home },
  { href: "/scan", label: COPY.NAV_SCAN, icon: Camera },
  { href: "/history", label: COPY.NAV_HISTORY, icon: Clock },
  { href: "/board", label: COPY.NAV_BOARD, icon: MessageCircle },
  { href: "/guide", label: COPY.NAV_GUIDE, icon: BookOpen },
  { href: "/profile", label: COPY.NAV_PROFILE, icon: User },
];

export default function FloatingMenu(): ReactElement {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  if (pathname.startsWith("/scan/uploading")) return <></>;

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  /* ── Touch / drag scroll handlers ── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    startX.current = e.touches[0].pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !scrollRef.current) return;
      const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.2;
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
    },
    [isDragging],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <>
      {/* ── Desktop: Side Rail (lg+) ── */}
      <nav
        className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 lg:flex"
        aria-label="Main navigation"
      >
        <div className="mr-4 flex flex-col gap-2 rounded-2xl border border-[#EEEFF2] bg-white/90 p-2 shadow-lg backdrop-blur-sm">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-[#6161FF] text-white"
                    : "text-[#9DA0AE] hover:bg-[#F5F5F7] hover:text-[#323338]"
                }`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[#323338] px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile: Bottom Nav Bar (below lg) ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEEFF2] bg-white/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main navigation"
      >
        <div
          ref={scrollRef}
          className="scrollbar-none flex overflow-x-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }, i) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative flex min-w-[64px] flex-1 flex-col items-center gap-0.5 pb-1.5 pt-2"
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                {/* Active indicator pill */}
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute top-0 h-[3px] w-8 rounded-b-full bg-[#6161FF]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    active ? "text-[#6161FF]" : "text-[#B0B3BE]"
                  }`}
                  strokeWidth={active ? 2 : 1.6}
                />
                <span
                  className={`text-[10px] leading-tight transition-colors ${
                    active
                      ? "font-semibold text-[#6161FF]"
                      : "font-medium text-[#B0B3BE]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
