"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion
} from "framer-motion";
import {
  useRef,
  type ReactNode,
  type MouseEvent as ReactMouseEvent
} from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** 회전 최대치 (deg) — 클수록 과장됨 */
  maxTilt?: number;
  /** 가까이 들어올수록 살짝 떠오르게 */
  lift?: number;
  /** 광택 하이라이트 표시 여부 */
  glare?: boolean;
};

/**
 * TiltCard — 커서 위치에 따라 카드가 3D 로 기우뚱한다.
 * - perspective + rotateX/Y/translateZ 조합
 * - mass-spring 으로 자연스러운 복귀
 * - 광택(글레어)은 마우스 위치에 따라 라디얼 그라디언트가 따라 움직임
 */
export default function TiltCard({
  children,
  className,
  maxTilt = 8,
  lift = 6,
  glare = true
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // -1..1 정규화된 커서 위치
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 220, damping: 18, mass: 0.4 });

  // 회전: x 위치는 Y회전, y 위치는 X회전(반대 부호)
  const rotateY = useTransform(sx, (v) => v * maxTilt);
  const rotateX = useTransform(sy, (v) => v * -maxTilt);

  // 떠오름 — 어디에 있든 동일하게 살짝
  const z = useTransform(sx, () => lift);

  // 광택 위치 (0..100%) → 단일 background string
  const glareBg = useTransform([sx, sy], (vals) => {
    const v = vals as number[];
    const xp = `${50 + v[0] * 40}%`;
    const yp = `${50 + v[1] * 40}%`;
    return `radial-gradient(circle at ${xp} ${yp}, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)`;
  });

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1..1
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    px.set(nx);
    py.set(ny);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          rotateX,
          rotateY,
          z,
          transformStyle: "preserve-3d"
        }}
        className="relative will-change-transform"
      >
        {children}
        {glare && !reduce ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: glareBg }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
