"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { site } from "@/data/site";
import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";

const nav = [
  { href: "/", label: "Index" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-line">
      <div className="wrap h-14 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* 좌: 로고 */}
        <Link
          href="/"
          aria-label={site.name}
          data-cursor="link"
          className="group inline-flex items-baseline gap-2 justify-self-start"
        >
          <span className="font-semibold tracking-[-0.01em] text-[15px]">
            {site.name}
          </span>
          <span className="font-serif-italic text-[14px] text-ink hidden sm:inline">
            folio
          </span>
        </Link>

        {/* 중앙: 네비 */}
        <nav className="hidden md:flex items-center gap-1 justify-self-center">
          {nav.map((n) => {
            const active =
              n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                data-cursor="link"
                className={clsx(
                  "group relative px-3 py-2 text-[13px] transition-colors inline-flex items-center gap-1",
                  active ? "text-ink" : "text-muted hover:text-ink"
                )}
              >
                {n.label}
                <span
                  aria-hidden
                  className={clsx(
                    "absolute left-3 right-3 -bottom-[1px] h-px bg-ink transition-transform origin-left",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* 우: 유틸 */}
        <div className="flex items-center gap-3 justify-self-end">
          <button
            type="button"
            data-cursor="link"
            onClick={() => {
              const evt = new KeyboardEvent("keydown", { key: "k", metaKey: true });
              window.dispatchEvent(evt);
            }}
            className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-muted border border-line px-2 py-1 hover:border-ink hover:text-ink transition"
            aria-label="명령 팔레트 열기"
          >
            <span>⌘K</span>
            <span className="hidden lg:inline text-muted/70">search</span>
          </button>
          <ThemeToggle />
          <span className="hidden lg:inline">
            <Clock />
          </span>
        </div>
      </div>
    </header>
  );
}
