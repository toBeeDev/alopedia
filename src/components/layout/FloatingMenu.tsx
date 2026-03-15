"use client";

import { type ReactElement, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Camera,
  Clock,
  MessageCircle,
  User,
  BookOpen,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COPY } from "@/constants/copy";
import ThemeToggle from "@/components/ui/ThemeToggle";

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
  { href: "/hospital", label: COPY.NAV_HOSPITAL, icon: MapPin },
  { href: "/profile", label: COPY.NAV_PROFILE, icon: User },
];

export default function FloatingMenu(): ReactElement {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
        <div className="mr-4 flex flex-col gap-2 rounded-2xl border border-border bg-card/90 p-2 shadow-lg backdrop-blur-sm">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
          <div className="my-1 h-px bg-border" />
          <ThemeToggle />
        </div>
      </nav>

      {/* ── Mobile: Top Header Bar (below lg) ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md lg:hidden"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            {COPY.APP_NAME}
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-accent"
              aria-label={menuOpen ? COPY.NAV_CLOSE : COPY.NAV_OPEN}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile: Hamburger Menu Overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
            />

            {/* Menu panel */}
            <motion.nav
              className="fixed left-0 right-0 z-50 border-b border-border bg-background lg:hidden"
              style={{ top: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col py-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-foreground/5 text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        className="h-5 w-5"
                        strokeWidth={active ? 2 : 1.6}
                      />
                      {label}
                      {active && (
                        <motion.div
                          layoutId="mobile-nav-active"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
