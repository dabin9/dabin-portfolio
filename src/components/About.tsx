"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import { site } from "@/data/site";

/**
 * About — 웜 베이지 배경 위에 중앙 정렬된 자기소개.
 * nanalike 의 "I do what i like" 섹션처럼 호흡이 큰 텍스트 블록으로 구성.
 */
export default function About() {
  return (
    <section
      id="about"
      className="relative border-b border-line"
      style={{ background: "rgb(var(--surface))" }}
    >
      <div className="wrap py-28 md:py-40 text-center">
        <p className="text-[12px] tracking-[0.4em] text-muted uppercase">
          About
        </p>
        <p className="mt-3 font-serif-italic text-[20px] md:text-[24px] text-ink">
          I do what i like
        </p>

        <h2
          className="mt-6 font-display font-medium leading-[1.2] tracking-tightest mx-auto max-w-[24ch]"
          style={{ fontSize: "clamp(1.8rem, 4.4vw, 3rem)" }}
        >
          안녕하세요!
          <br />
          프론트엔드 개발자{" "}
          <span className="font-serif-italic">{site.name}</span>입니다.
        </h2>

        <p className="mt-4 font-serif-italic text-[18px] text-muted">
          a.k.a, {site.nickname}
        </p>

        <div className="mt-12 mx-auto max-w-[60ch] space-y-6 text-[16px] md:text-[17px] leading-[1.95] text-ink text-left">
          {site.bio.slice(1).map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/contact"
            data-cursor="link"
            className="inline-flex items-center gap-2 text-[13px] text-ink border-b border-ink/30 hover:border-ink pb-1"
          >
            자기소개 더보기
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
