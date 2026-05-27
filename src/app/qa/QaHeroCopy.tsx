"use client";

import { motion } from "framer-motion";

const heroTitle = "반갑습니다. 오늘도 같이 발견해볼까요?";
const heroDescription =
  "반응형 UI, JavaScript 인터랙션, CMS 데이터 연동을 기반으로 운영 가능한 프론트엔드를 만듭니다.";

export default function QaHeroCopy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-2 max-w-full"
    >
      <h1 className="max-w-full whitespace-nowrap text-[clamp(13px,4.1vw,44px)] font-medium leading-[1.13] text-[#25292d]">
        {heroTitle}
      </h1>
      <p className="mt-4 max-w-[780px] text-[15px] font-medium leading-[1.65] text-[#53606b] [text-wrap:pretty] sm:text-[17px] md:mt-5 md:text-[19px]">
        {heroDescription}
      </p>
    </motion.div>
  );
}
