"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * 포인터를 따라다니는 커스텀 커서.
 * - 요소에 data-cursor="link" 를 주면 링 확장
 * - data-cursor="text" 면 I-beam
 * - data-cursor="label=..." 이면 라벨 말풍선 표시
 * - 모바일/터치 환경은 자동 비활성화
 */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 360, damping: 28, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 360, damping: 28, mass: 0.4 });
  const [mode, setMode] = useState<"default" | "link" | "text">("default");
  const [label, setLabel] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const trailRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      trailRef.current.push({ x: e.clientX, y: e.clientY });
      if (trailRef.current.length > 18) trailRef.current.shift();
    };
    const out = () => setVisible(false);
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-cursor], a, button, [role='button'], input, textarea, label"
      );
      if (!el) {
        setMode("default");
        setLabel("");
        return;
      }
      const c = el.dataset.cursor ?? "";
      if (c.startsWith("label=")) {
        setMode("link");
        setLabel(c.slice(6));
        return;
      }
      if (c === "text" || el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        setMode("text");
        setLabel("");
        return;
      }
      if (c === "link" || el.matches("a, button, [role='button'], label")) {
        setMode("link");
        setLabel("");
        return;
      }
      setMode("default");
      setLabel("");
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseout", out);
    window.addEventListener("mouseover", over);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseout", out);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  return (
    <>
      {/* Dot (빠르게 따라감) — mix-blend-difference 로 어떤 배경에서도 보이게 */}
      <motion.div
        aria-hidden
        style={{ x, y, opacity: visible ? 1 : 0, mixBlendMode: "difference" }}
        className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 transition-opacity"
      >
        <div className="w-[6px] h-[6px] rounded-full bg-white" />
      </motion.div>

      {/* Ring (스프링 lag) */}
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy, opacity: visible ? 1 : 0, mixBlendMode: "difference" }}
        className="pointer-events-none fixed left-0 top-0 z-[99] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: mode === "link" ? 54 : mode === "text" ? 4 : 30,
            height: mode === "link" ? 54 : mode === "text" ? 28 : 30,
            borderRadius: mode === "text" ? 2 : 999
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.4 }}
          className="border border-white"
          style={{ boxSizing: "border-box" }}
        />
        {label ? (
          <span
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 text-[11px] font-mono bg-white text-black whitespace-nowrap"
          >
            {label}
          </span>
        ) : null}
      </motion.div>
    </>
  );
}
