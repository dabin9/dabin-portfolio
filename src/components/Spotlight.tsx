"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** 스포트라이트 반지름 (px) */
  size?: number;
  /** 스포트라이트 색상 (rgb 또는 var) */
  color?: string;
};

/**
 * Spotlight — 섹션 위에서 커서를 따라다니는 라디얼 스포트라이트.
 * - prefers-reduced-motion: 비활성화
 * - 섹션 호버 시 부드럽게 등장, 빠져나가면 페이드 아웃
 */
export default function Spotlight({
  children,
  className,
  size = 380,
  color = "rgb(var(--ink) / 0.06)"
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 90, damping: 18, mass: 0.6 });
  const opacity = useMotionValue(0);
  const sopa = useSpring(opacity, { stiffness: 80, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
      opacity.set(1);
    };
    const onLeave = () => opacity.set(0);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, opacity, reduce]);

  const bg = useTransform([sx, sy] as never, (vals) => {
    const v = vals as unknown as number[];
    return `radial-gradient(${size}px circle at ${v[0]}px ${v[1]}px, ${color}, transparent 65%)`;
  });

  return (
    <div ref={ref} className={"relative " + (className ?? "")}>
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: bg, opacity: sopa }}
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
