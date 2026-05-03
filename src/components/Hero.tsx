"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/data/site";
import MagneticLink from "./MagneticLink";
import SplitChars from "./SplitChars";

/**
 * Hero — nanalike 톤의 인사 페이지.
 * 흰 배경 + 중앙 정렬 + 큰 캐치 카피 + 부드러운 페이드 인.
 * 화려한 그라디언트 대신 타이포의 호흡으로 분위기를 만든다.
 */
export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative bg-bg border-b border-line overflow-hidden"
      style={{ minHeight: "calc(100svh - 56px)" }}
    >
      <DriftingText />

      <div
        className="relative wrap text-center flex flex-col items-center justify-center gap-7 md:gap-9 py-24"
        style={{ minHeight: "calc(100svh - 56px)" }}
      >
        {/* Available Now */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 text-[12px] text-inkMuted"
        >
          <span className="relative inline-flex">
            <span className="relative inline-block w-2 h-2 rounded-full bg-accent" />
            <span className="absolute inset-0 inline-block w-2 h-2 rounded-full bg-accent animate-ping opacity-70" />
          </span>
          Available Now
        </motion.p>

        {/* Catch headline — 글자 단위 stagger + hover 웨이브 */}
        <h1
          className="font-display font-medium leading-[1.05] tracking-tightest text-ink"
          style={{ fontSize: "clamp(2.6rem, 8vw, 6.5rem)" }}
        >
          <SplitChars text="누구든지" delay={0.18} stagger={0.04} />
          <br />
          <SplitChars
            text="어디서나 더 쉽게"
            delay={0.42}
            stagger={0.035}
          />
        </h1>

        {/* Body — 짧게 두 줄 */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="max-w-[44ch] mx-auto text-[15px] md:text-[16px] leading-[1.85] text-inkMuted"
        >
          <p>탄탄한 코드 위에 감각적인 인터페이스를 그리는 다빈입니다.</p>
          <p>{site.intro}</p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
        >
          <MagneticLink
            href="/work"
            data-cursor="label=VIEW"
            className="group inline-flex items-center gap-2 bg-ink text-bg pl-6 pr-5 py-3.5 text-[13px] rounded-full hover:opacity-90 transition"
          >
            작업물 보러가기
            <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </MagneticLink>
          <Link
            href="/contact"
            data-cursor="link"
            className="text-[13px] text-inkMuted hover:text-ink underline underline-offset-[6px] decoration-ink/20 hover:decoration-ink"
          >
            메일 보내기
          </Link>
        </motion.div>

      </div>

      {/* Scroll hint — 섹션 바닥에 고정해서 첫 화면 안에 항상 보이게 */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-8 inline-flex flex-col items-center gap-2 text-muted z-10"
        aria-hidden
      >
        <span className="font-serif-italic text-[13px]">Let's Scroll Down!</span>
        <span className="block w-px h-8 bg-line overflow-hidden">
          <span className="block w-px h-3 bg-ink animate-[float_1.6s_ease-in-out_infinite]" />
        </span>
      </motion.div>
    </section>
  );
}

/**
 * Hero 뒤로 천천히 흐르는 흐릿한 워드 레이어.
 * - 4줄을 서로 다른 방향/속도/크기/투명도로 배치
 * - blur 와 낮은 opacity 로 본문 가독성을 해치지 않음
 */
/**
 * 한 줄짜리 거대한 워드마크가 아주 천천히 흘러간다.
 * 강한 blur + 낮은 opacity 로 분위기만 깔고, 본문 뒤로 사라진다.
 */
function DriftingText() {
  const phrase = "dabin  ·  ";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 whitespace-nowrap"
        style={{ filter: "blur(3px)" }}
      >
        <div className="flex w-[200%] drift-l drift-slow">
          <span
            className="font-display font-semibold tracking-tightest text-ink opacity-[0.04]"
            style={{ fontSize: "clamp(7rem, 18vw, 18rem)", paddingRight: "3rem" }}
          >
            {phrase.repeat(12)}
          </span>
          <span
            className="font-display font-semibold tracking-tightest text-ink opacity-[0.04]"
            style={{ fontSize: "clamp(7rem, 18vw, 18rem)", paddingRight: "3rem" }}
          >
            {phrase.repeat(12)}
          </span>
        </div>
      </div>

      {/* 중앙을 살짝 밝혀 본문 가독성 확보 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(var(--bg) / 0.5) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}
