"use client";

import Link from "next/link";
import Image from "next/image";
import Reveal from "./Reveal";
import SplitChars from "./SplitChars";
import TiltCard from "./TiltCard";
import Spotlight from "./Spotlight";
import CountUp from "./CountUp";
import { site } from "@/data/site";
import profileImg from "@/assets/IMG_7203.png";

/**
 * About — 베이지 위에 프로필 이미지 + 자기소개 + 카운터.
 * - 프로필: 3D 틸트 + 작은 라이브 닷
 * - 섹션 위 커서 스포트라이트
 * - 헤드라인은 글자별 stagger 등장
 */
export default function About() {
  return (
    <section
      id="about"
      className="relative border-b border-line"
      style={{ background: "rgb(var(--surface))" }}
    >
      <Spotlight size={520} color="rgb(var(--ink) / 0.05)">
        <div className="wrap py-28 md:py-36 grid md:grid-cols-12 gap-12 md:gap-16 items-center">
          {/* 좌: 프로필 이미지 */}
          <div className="md:col-span-5 flex md:justify-end">
            <TiltCard className="rounded-[28px]" maxTilt={9} lift={10}>
              <div className="relative w-[260px] h-[320px] md:w-[300px] md:h-[380px] overflow-hidden rounded-[28px] bg-bg shadow-[0_20px_60px_-20px_rgb(0_0_0/0.18)]">
                <Image
                  src={profileImg}
                  alt={`${site.name} 프로필`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 300px, 260px"
                  placeholder="blur"
                  priority
                />
                {/* Available badge */}
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-bg/90 backdrop-blur-sm text-[12px] text-ink px-3 py-1.5 rounded-full border border-line">
                  <span className="relative inline-flex">
                    <span className="relative inline-block w-2 h-2 rounded-full bg-accent" />
                    <span className="absolute inset-0 inline-block w-2 h-2 rounded-full bg-accent animate-ping opacity-70" />
                  </span>
                  Available
                </span>
              </div>
            </TiltCard>
          </div>

          {/* 우: 텍스트 */}
          <div className="md:col-span-7">
            <p className="text-[12px] tracking-[0.4em] text-muted uppercase">
              About
            </p>

            <h2
              className="mt-5 font-display font-medium leading-[1.2] tracking-tightest"
              style={{ fontSize: "clamp(1.8rem, 4.4vw, 3rem)" }}
            >
              <SplitChars text="안녕하세요!" delay={0.05} stagger={0.025} />
              <br />
              프론트엔드 개발자{" "}
              <SplitChars
                text={`${site.name}입니다.`}
                delay={0.18}
                stagger={0.03}
              />
            </h2>

            <div className="mt-8 max-w-[60ch] space-y-5 text-[15px] md:text-[16px] leading-[1.95] text-ink">
              {site.bio.slice(1).map((p, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>

            {/* Counters — 2개 또는 다른 지표로 대체 가능 */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 max-w-[420px]">
              <Stat value={3} suffix="+" label="Years coding" />
              <Stat value={42} suffix="+" label="Projects shipped" />
            </div>
          </div>
        </div>
      </Spotlight>
    </section>
  );
}

function Stat({
  value,
  suffix,
  label
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  return (
    <div>
      <p
        className="font-display font-medium leading-none tracking-tightest tabular-nums"
        style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}
      >
        <CountUp to={value} suffix={suffix} />
      </p>
      <p className="mt-2 text-[12px] text-muted">{label}</p>
    </div>
  );
}
