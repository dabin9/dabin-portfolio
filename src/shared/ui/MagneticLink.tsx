"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, type ComponentProps, type MouseEvent } from "react";

type Props = ComponentProps<typeof Link> & {
  strength?: number;
};

/**
 * 커서에 살짝 끌려오는 마그네틱 링크.
 * 큰 CTA 버튼에 사용합니다.
 */
export default function MagneticLink({
  children,
  strength = 18,
  className,
  ...props
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.35 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set((relX / rect.width) * strength);
    y.set((relY / rect.height) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span style={{ x: sx, y: sy, display: "inline-block" }}>
      <Link
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={className}
        {...props}
      >
        {children}
      </Link>
    </motion.span>
  );
}
