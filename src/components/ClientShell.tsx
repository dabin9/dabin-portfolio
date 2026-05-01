"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Cursor from "./Cursor";
import IntroLoader from "./IntroLoader";
import CommandPalette from "./CommandPalette";
import ScrollProgress from "./ScrollProgress";
import KonamiEgg from "./KonamiEgg";
import ConsoleSignature from "./ConsoleSignature";

/**
 * 최상위 클라이언트 셸 — 커서/팔레트/인트로/페이지전환을 한 군데에 묶습니다.
 */
export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // 세션 내 최초 1회만 인트로 표시
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("intro-seen");
      if (!seen) {
        setShowIntro(true);
        sessionStorage.setItem("intro-seen", "1");
      }
    } catch {
      /* no-op */
    }
    setReady(true);
  }, []);

  return (
    <>
      <ConsoleSignature />
      <KonamiEgg />
      <Cursor />
      <ScrollProgress />
      <CommandPalette />

      <AnimatePresence>
        {showIntro ? <IntroLoader onDone={() => setShowIntro(false)} /> : null}
      </AnimatePresence>

      {/* 페이지 전환 모션 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={ready ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
