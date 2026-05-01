"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Props = {
  to: number;
  /** 시작 숫자 (기본 0) */
  from?: number;
  /** 애니메이션 길이 (ms) */
  duration?: number;
  /** 숫자 뒤에 붙는 텍스트 (예: "+", "k") */
  suffix?: string;
  className?: string;
  /** 자릿수 포맷팅 (1234 → 1,234) */
  format?: boolean;
};

/**
 * CountUp — 뷰포트에 들어오면 숫자가 0 부터 to 까지 ease-out 으로 증가.
 * easeOutCubic 으로 자연스러운 감속, 한 번만 트리거.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1400,
  suffix = "",
  className,
  format = false
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(from);
  const reduce = useReducedMotion();
  const triggered = useRef(false);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !triggered.current) {
            triggered.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
              setValue(Math.round(from + (to - from) * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [from, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {format ? value.toLocaleString() : value}
      {suffix}
    </span>
  );
}
