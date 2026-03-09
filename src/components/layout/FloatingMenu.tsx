"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Clock, MessageCircle, User, BookOpen } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
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

  // Hide on /scan/uploading route (analysis in progress)
  if (pathname.startsWith("/scan/uploading")) return <></>;

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

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
                {/* Tooltip */}
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[#323338] px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile: Bottom Dock (below lg) ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
        aria-label="Main navigation"
      >
        <Dock
          className="items-end border border-[#EEEFF2] bg-white/90 pb-2 shadow-lg backdrop-blur-md dark:bg-[#1a1a2e]/90"
          magnification={60}
          distance={100}
          panelHeight={56}
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} aria-label={label}>
                <DockItem
                  className={`aspect-square rounded-full ${
                    active
                      ? "bg-[#6161FF]/15"
                      : "bg-[#F5F5F7] dark:bg-neutral-800"
                  }`}
                >
                  <DockLabel>{label}</DockLabel>
                  <DockIcon>
                    <Icon
                      className={`h-full w-full ${
                        active
                          ? "text-[#6161FF]"
                          : "text-[#9DA0AE] dark:text-neutral-400"
                      }`}
                      strokeWidth={1.8}
                    />
                  </DockIcon>
                </DockItem>
              </Link>
            );
          })}
        </Dock>
      </nav>
    </>
  );
}
