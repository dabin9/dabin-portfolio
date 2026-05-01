"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Konami code (↑ ↑ ↓ ↓ ← → ← → B A) 입력 시 3초간 컬러 반전 오버레이 + 토스트.
 */
const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA"
];

export default function KonamiEgg() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === SEQUENCE[idx]) {
        idx += 1;
        if (idx === SEQUENCE.length) {
          setActive(true);
          idx = 0;
          window.setTimeout(() => setActive(false), 2800);
        }
      } else {
        idx = e.code === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] pointer-events-none mix-blend-difference bg-brand"
        >
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 font-mono text-sm tracking-[0.2em] uppercase text-bg"
          >
            ↑↑↓↓←→←→BA · 30 LIVES
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
