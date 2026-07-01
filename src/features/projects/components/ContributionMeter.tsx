"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
};

export default function ContributionMeter({ value }: Props) {
  const target = Math.max(0, Math.min(100, Math.round(value)));
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);
  const frame = useRef<number | null>(null);
  const [displayValue, setDisplayValue] = useState(target);
  const [barWidth, setBarWidth] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    triggered.current = false;
    if (frame.current != null) cancelAnimationFrame(frame.current);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      triggered.current = true;
      setDisplayValue(target);
      setBarWidth(target);
      return;
    }

    setDisplayValue(0);
    setBarWidth(0);

    const startAnimation = () => {
      if (triggered.current) return;
      triggered.current = true;
      setBarWidth(target);

      const duration = 700;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(target * eased));
        if (progress < 1) {
          frame.current = requestAnimationFrame(tick);
        }
      };

      frame.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [target]);

  return (
    <div
      ref={ref}
      className="mt-5"
      role="meter"
      aria-label={`기여도 ${target}%`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={target}
      aria-valuetext={`${target}%`}
    >
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-muted">기여도</span>
        <span className="text-ink font-mono tabular-nums" aria-hidden="true">
          {displayValue}%
        </span>
      </div>
      <div className="mt-2 h-1 w-full bg-surface overflow-hidden">
        <div
          className="h-full bg-ink transition-[width] duration-700 ease-out"
          style={{ width: `${barWidth}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
