"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { site } from "@/data/site";
import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";

const nav = [
  { href: "/work", label: "Works" }
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-line">
      <div className="wrap flex min-h-14 items-center justify-between gap-3 py-3">
        <Link
          href="/"
          aria-label={site.name}
          onClick={() => window.dispatchEvent(new Event("agent:reset"))}
          data-cursor="link"
          className="shrink-0 font-mono text-[12px] uppercase text-ink md:text-[13px]"
        >
          {site.nameEn}
        </Link>

        <div className="flex min-w-0 flex-nowrap items-center justify-end gap-2 sm:gap-3">
          <nav className="flex items-center gap-3 text-[12px] md:text-[13px]">
            {nav.map((n) => {
              const active =
                n.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(n.href);
              const className = clsx(
                "whitespace-nowrap font-mono uppercase transition-colors",
                active ? "text-ink" : "text-muted hover:text-ink"
              );

              return (
                <Link
                  key={n.label}
                  href={n.href}
                  data-cursor="link"
                  className={className}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <SearchTrigger />
          <span className="inline-flex">
            <ThemeToggle />
          </span>
          <span className="hidden lg:inline-flex">
            <Clock />
          </span>
        </div>
      </div>
    </header>
  );
}

function SearchTrigger() {
  return (
    <button
      type="button"
      aria-label="검색 열기"
      onClick={() => window.dispatchEvent(new Event("command-palette:open"))}
      data-cursor="link"
      className="group inline-flex items-center gap-1.5 border border-line px-2 py-1.5 transition-colors hover:border-ink sm:gap-2 sm:px-2.5"
    >
      <span className="font-mono text-[11px] text-muted">⌘K</span>
      <span className="hidden font-mono text-[11px] uppercase tracking-[0.15em] text-inkMuted group-hover:text-ink sm:inline">
        Search
      </span>
    </button>
  );
}
