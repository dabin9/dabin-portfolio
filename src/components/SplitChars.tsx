"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useId } from "react";

type Props = {
  text: string;
  /** 한 글자씩 등장 stagger (초) */
  stagger?: number;
  /** 전체 등장 지연 */
  delay?: number;
  /** hover 시 웨이브 인터랙션 활성화 */
  interactive?: boolean;
  className?: string;
  /** 글자에 추가로 입힐 className (예: "font-serif-italic") */
  charClassName?: string;
};

/**
 * SplitChars — 한 줄 텍스트를 글자 단위로 쪼개 stagger 등장 + hover 웨이브.
 * 큰 헤드라인의 도입부에 사용해 폴리시 있는 인터랙션을 만든다.
 *
 * - 각 글자: y/opacity/rotate 조합으로 mass-spring 등장
 * - hover: 가장 가까운 글자가 위로 튀고 양옆이 따라온다
 * - prefers-reduced-motion: 모든 모션 비활성, 즉시 표시
 */
export default function SplitChars({
  text,
  stagger = 0.025,
  delay = 0,
  interactive = true,
  className,
  charClassName
}: Props) {
  const reduce = useReducedMotion();
  const id = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const chars = Array.from(text);

  return (
    <span
      className={"inline-block " + (className ?? "")}
      onPointerLeave={() => setHoverIdx(null)}
    >
      {chars.map((ch, i) => {
        if (ch === " ") {
          return (
            <span key={`${id}-${i}`} className="inline-block w-[0.28em]" aria-hidden />
          );
        }
        const dist = hoverIdx === null ? 999 : Math.abs(i - hoverIdx);
        const lift = !interactive || reduce || dist > 4 ? 0 : (5 - dist) * -3;

        return (
          <motion.span
            key={`${id}-${i}`}
            initial={reduce ? false : { opacity: 0, y: "0.6em", rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + i * stagger
            }}
            onPointerEnter={() => interactive && setHoverIdx(i)}
            style={{ display: "inline-block", willChange: "transform" }}
            className={charClassName}
          >
            <motion.span
              animate={{ y: lift }}
              transition={{ type: "spring", stiffness: 360, damping: 22, mass: 0.4 }}
              style={{ display: "inline-block" }}
            >
              {ch}
            </motion.span>
          </motion.span>
        );
      })}
    </span>
  );
}
