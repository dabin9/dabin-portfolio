"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { site } from "@/shared/config/site";
import Clock from "@/shared/ui/Clock";
import ThemeToggle from "@/shared/ui/ThemeToggle";

const nav = [
  { href: "/work", label: "Works" },
  { href: "/#contact", label: "Contact" }
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-line">
      <div className="wrap relative flex min-h-14 items-center justify-between gap-2 py-3 sm:gap-3">
        <Link
          href="/"
          aria-label={site.name}
          onClick={() => window.dispatchEvent(new Event("agent:reset"))}
          data-cursor="link"
          className="relative z-10 shrink-0 font-mono text-[10px] uppercase text-ink min-[380px]:text-[11px] md:text-[13px]"
        >
          {site.nameEn}
        </Link>

        <nav className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 justify-center gap-2 text-[10px] min-[380px]:gap-3 min-[380px]:text-[11px] md:text-[13px]">
          {nav.map((n) => {
            const active = n.href === "/work" && pathname.startsWith("/work");
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

        <div className="relative z-10 flex min-w-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-3">
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
      className="group inline-flex items-center gap-1.5 border border-line px-1.5 py-1.5 transition-colors hover:border-ink sm:gap-2 sm:px-2.5"
    >
      <span className="font-mono text-[11px] text-muted">⌘K</span>
      <span className="hidden font-mono text-[11px] uppercase tracking-[0.15em] text-inkMuted group-hover:text-ink sm:inline">
        Search
      </span>
    </button>
  );
}
