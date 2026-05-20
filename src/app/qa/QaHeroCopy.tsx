"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const HERO_COPIES = [
  "클릭해주셔서 감사합니다. 무엇을 도와드릴까요?",
  "반갑습니다. 오늘도 같이 발견해볼까요?"
];

export default function QaHeroCopy() {
  const [copy, setCopy] = useState(HERO_COPIES[0]);

  useEffect(() => {
    setCopy(HERO_COPIES[Math.floor(Math.random() * HERO_COPIES.length)]);
  }, []);

  return (
    <motion.h1
      key={copy}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-2 text-[35px] font-medium leading-[1.12] text-[#25292d] md:text-[48px]"
    >
      {copy}
    </motion.h1>
  );
}
