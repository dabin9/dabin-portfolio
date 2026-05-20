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
      <div className="wrap min-h-14 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-3">
        <Link
          href="/"
          aria-label={site.name}
          data-cursor="link"
          className="justify-self-start font-mono text-[12px] md:text-[13px] uppercase text-ink"
        >
          {site.nameEn}
        </Link>

        <nav className="col-span-2 row-start-2 flex items-center justify-center gap-5 overflow-x-auto text-[12px] md:col-span-1 md:row-start-auto md:gap-6 md:text-[13px]">
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

        <div className="justify-self-end flex items-center gap-3">
          <SearchTrigger />
          <span className="hidden sm:inline-flex">
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
      className="group inline-flex items-center gap-2 border border-line hover:border-ink px-2.5 py-1.5 transition-colors"
    >
      <span className="font-mono text-[11px] text-muted">⌘K</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-inkMuted group-hover:text-ink">
        Search
      </span>
    </button>
  );
}
