"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { env } from "@/shared/config/env";

export type CommandPaletteProject = {
  slug: string;
  title: string;
  year: string;
  role: string;
  stack: string[];
  searchText?: string;
  status?: "published" | "draft" | "private";
};

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  group: "Navigate" | "Work" | "Actions" | "Elsewhere";
  run: () => void;
};

/**
 * ⌘K / Ctrl+K 로 여는 커맨드 팔레트.
 * ↑↓ 네비, Enter 실행, Esc 닫기.
 */
export default function CommandPalette({
  projects
}: {
  projects: CommandPaletteProject[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 키 바인딩
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (!mod && e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);

    window.addEventListener("command-palette:open", onOpen);
    return () => window.removeEventListener("command-palette:open", onOpen);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
      setQ("");
      setActive(0);
    }
  }, [open]);

  // 아이템 소스
  const items: Item[] = useMemo(() => {
    const toggleTheme = () => {
      const el = document.documentElement;
      const next = !el.classList.contains("dark");
      el.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        /* no-op */
      }
    };
    return [
      { id: "home", title: "홈", subtitle: "/", group: "Navigate", run: () => router.push("/") },
      { id: "work", title: "Work — 전체 프로젝트", subtitle: "/work", group: "Navigate", run: () => router.push("/work") },
      { id: "theme", title: "테마 토글 (라이트/다크)", group: "Actions", run: toggleTheme },
      { id: "top", title: "맨 위로", group: "Actions", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
      { id: "bottom", title: "맨 아래로", group: "Actions", run: () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) },
      ...projects.map((p) => ({
        id: `work-${p.slug}`,
        title: p.title,
        subtitle: `${p.year} · ${p.role}`,
        keywords: [p.stack.join(" "), p.searchText ?? ""].join(" "),
        group: "Work" as const,
        run: () => router.push(`/work/${p.slug}`)
      })),
      env.github
        ? { id: "gh", title: "GitHub", subtitle: env.github, group: "Elsewhere" as const, run: () => window.open(env.github, "_blank") }
        : null,
      env.linkedin
        ? { id: "ln", title: "LinkedIn", subtitle: env.linkedin, group: "Elsewhere" as const, run: () => window.open(env.linkedin, "_blank") }
        : null,
      env.blog
        ? { id: "blog", title: "Blog", subtitle: env.blog, group: "Elsewhere" as const, run: () => window.open(env.blog, "_blank") }
        : null
    ].filter(Boolean) as Item[];
  }, [projects, router]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((it) =>
      [it.title, it.subtitle ?? "", it.keywords ?? "", it.group]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [items, q]);

  // 그룹별 정렬
  const grouped = useMemo(() => {
    const order: Item["group"][] = ["Navigate", "Work", "Actions", "Elsewhere"];
    const map = new Map<Item["group"], Item[]>();
    for (const g of order) map.set(g, []);
    for (const it of filtered) map.get(it.group)?.push(it);
    return order
      .map((g) => ({ group: g, items: map.get(g) ?? [] }))
      .filter((x) => x.items.length > 0);
  }, [filtered]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => {
    if (active >= flat.length) setActive(0);
  }, [flat.length, active]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flat[active]?.run();
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="cmdk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4 bg-ink/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] bg-bg border border-line shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="text-muted text-[13px] font-mono">⌘K</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                onKeyDown={onInputKey}
                placeholder="검색: 프로젝트, 글, 동작, 테마 토글…"
                className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-muted"
              />
              <span className="text-muted text-[11px] font-mono">ESC</span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {grouped.length === 0 ? (
                <p className="px-4 py-10 text-center text-muted text-sm">
                  결과가 없습니다.
                </p>
              ) : (
                grouped.map((g) => (
                  <div key={g.group} className="pb-2">
                    <p className="px-4 pt-3 pb-1 text-[10px] font-mono tracking-[0.2em] uppercase text-muted">
                      {g.group}
                    </p>
                    <ul>
                      {g.items.map((it) => {
                        const i = flat.indexOf(it);
                        const isActive = i === active;
                        return (
                          <li key={it.id}>
                            <button
                              type="button"
                              onMouseEnter={() => setActive(i)}
                              onClick={() => { it.run(); setOpen(false); }}
                              className={
                                "w-full text-left px-4 py-2.5 flex items-center gap-3 " +
                                (isActive ? "bg-surface" : "")
                              }
                            >
                              <span className="text-[13px] font-mono w-5 text-muted tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-[14px] text-ink truncate">{it.title}</span>
                                {it.subtitle ? (
                                  <span className="block text-[12px] text-muted truncate">{it.subtitle}</span>
                                ) : null}
                              </span>
                              {isActive ? (
                                <span className="text-[11px] text-muted font-mono">Enter ↵</span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-line px-4 py-2 flex items-center justify-between text-[11px] text-muted font-mono">
              <span>↑↓ 이동 · Enter 실행</span>
              <span>{flat.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
