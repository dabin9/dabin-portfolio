"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** 페이지 상단에 얇은 스크롤 진행 바. 헤더 바로 아래 걸쳐 보입니다. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 180, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: x, transformOrigin: "0 0" }}
      className="fixed left-0 right-0 top-14 z-40 h-[2px] bg-brand"
    />
  );
}
