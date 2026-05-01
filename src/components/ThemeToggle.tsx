"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * 라이트/다크 토글. `html.dark` 클래스를 토글하고 localStorage 에 저장.
 * FOUC 방지는 layout.tsx 의 inline script 에서 수행.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      type="button"
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={toggle}
      data-cursor="link"
      className="group relative inline-flex items-center gap-1.5 border border-line hover:border-ink px-2.5 py-1.5 transition-colors"
    >
      <span
        aria-hidden
        className="relative w-3.5 h-3.5 inline-block overflow-hidden"
      >
        <motion.span
          animate={{ rotate: dark ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute inset-0"
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: "rgb(var(--ink))" }}
          />
          <span
            className="absolute inset-0 rounded-full translate-x-[35%] -translate-y-[10%]"
            style={{ background: "rgb(var(--bg))" }}
          />
        </motion.span>
      </span>
      <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-inkMuted group-hover:text-ink">
        {dark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
