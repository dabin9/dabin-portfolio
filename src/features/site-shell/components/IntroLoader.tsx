"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

/**
 * 세션 최초 진입 시 1초 인트로.
 * 한글 자소("박", "다", "빈")가 세로로 조립되며 올라옵니다.
 */
export default function IntroLoader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 1400);
    return () => window.clearTimeout(id);
  }, [onDone]);

  const chars = ["박", "다", "빈"];
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bg"
    >
      {/* 얇은 진행선 */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-brand origin-left"
      />

      <div className="flex items-end gap-2 md:gap-4 font-display">
        {chars.map((c, i) => (
          <motion.span
            key={i}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.12 + i * 0.12
            }}
            className="inline-block text-[80px] md:text-[140px] leading-none tracking-tightest font-semibold"
          >
            {c}
          </motion.span>
        ))}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7, ease: "backOut" }}
          className="mb-3 md:mb-5 ml-2 inline-block w-3 h-3 md:w-4 md:h-4 rounded-full bg-brand"
        />
      </div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[12px] text-muted font-mono tracking-[0.2em]">
        LOADING · 2026
      </p>
    </motion.div>
  );
}
