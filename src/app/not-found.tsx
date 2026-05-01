"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * 404 — 커서에 따라 '4 0 4' 글자가 끌려오는 간단한 장난감.
 * 클릭할 때마다 글자 수가 늘어납니다 (Easter egg).
 */
export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 14 });
  const sy = useSpring(my, { stiffness: 80, damping: 14 });
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const chars = ["4", "0", "4", ...Array(extra).fill("?")];

  return (
    <section
      ref={ref}
      className="relative wrap py-24 md:py-32 flex flex-col items-center justify-center text-center min-h-[60vh]"
      onClick={() => setExtra((n) => (n >= 9 ? 0 : n + 1))}
    >
      <p className="text-[13px] text-muted">페이지를 찾을 수 없습니다</p>

      <h1
        className="mt-6 font-display font-semibold leading-none tracking-tightest flex items-end gap-2 md:gap-6"
        style={{ fontSize: "clamp(5rem, 18vw, 14rem)" }}
      >
        {chars.map((c, i) => (
          <JiggleChar key={i} ch={c} index={i} sx={sx} sy={sy} />
        ))}
      </h1>

      <p className="mt-10 text-[15px] text-inkMuted max-w-[46ch]">
        주소가 잘못됐거나, 제가 <span className="font-serif-italic text-brand">아직 만들지 않은</span> 페이지일 수 있어요.
        클릭하면 뭔가 생길지도 모릅니다.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/"
          data-cursor="link"
          className="inline-flex items-center gap-2 bg-ink text-bg pl-5 pr-4 py-3 text-[13px] hover:bg-brand hover:text-brandInk transition"
        >
          ← 홈으로
        </Link>
        <Link
          href="/work"
          data-cursor="link"
          className="text-[13px] text-inkMuted hover:text-ink underline underline-offset-[6px] decoration-ink/30 hover:decoration-ink"
        >
          프로젝트 보기
        </Link>
      </div>
      <p className="mt-12 text-[11px] font-mono text-muted">
        Tip · ⌘K 로 어디든 바로 이동할 수 있어요
      </p>
    </section>
  );
}

function JiggleChar({
  ch,
  index,
  sx,
  sy
}: {
  ch: string;
  index: number;
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
}) {
  const strength = 30 + ((index * 13) % 40);
  const tx = useTransform(sx, (v) => v * strength);
  const ty = useTransform(sy, (v) => v * strength * 0.7);
  const isAccent = ch === "0";
  return (
    <motion.span
      style={{ x: tx, y: ty }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.6 }}
      className={
        "inline-block will-change-transform " +
        (isAccent ? "font-serif-italic text-brand" : "")
      }
    >
      {ch}
    </motion.span>
  );
}
