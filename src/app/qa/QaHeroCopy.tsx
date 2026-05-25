"use client";

import { motion } from "framer-motion";

export default function QaHeroCopy() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-2 whitespace-nowrap text-[14px] font-medium leading-[1.12] text-[#25292d] min-[430px]:text-[20px] sm:text-[30px] md:text-[40px] lg:text-[44px]"
    >
      반갑습니다. 오늘도 같이 발견해볼까요?
    </motion.h1>
  );
}
