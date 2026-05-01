"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** 공통 프레임 — 브라우저 창 느낌의 컨테이너 */
export function MockFrame({
  children,
  tone = "cream",
  label
}: {
  children: ReactNode;
  tone?: "cream" | "ink" | "cobalt" | "moss";
  label?: string;
}) {
  const toneMap = {
    cream: "bg-surface text-ink",
    ink: "bg-ink text-bg",
    cobalt: "text-bg",
    moss: "text-bg"
  } as const;
  const toneStyle =
    tone === "cobalt" ? { background: "rgb(var(--cobalt))" } :
    tone === "moss" ? { background: "rgb(var(--moss))" } :
    undefined;

  return (
    <div
      className={"relative w-full aspect-[16/10] overflow-hidden border border-line " + toneMap[tone]}
      style={toneStyle}
    >
      {/* Traffic lights */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-60">
        <span className="w-2 h-2 rounded-full bg-current" />
        <span className="w-2 h-2 rounded-full bg-current" />
        <span className="w-2 h-2 rounded-full bg-current" />
      </div>
      {label ? (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-60">
          {label}
        </div>
      ) : null}
      <div className="absolute inset-0 pt-8">{children}</div>
    </div>
  );
}

/* 01 — Atlas 디자인 시스템 */
export function AtlasMock() {
  return (
    <MockFrame tone="cream" label="atlas / tokens">
      <div className="h-full grid grid-cols-[140px_1fr] gap-3 px-4 pb-4">
        <div className="border-r border-line pr-3 flex flex-col gap-1.5 text-[10px] text-inkMuted">
          <p className="font-medium text-ink mb-1">Tokens</p>
          {["color", "type", "radius", "space", "elevation", "motion"].map((t, i) => (
            <p key={t} className={i === 0 ? "text-ink" : ""}>— {t}</p>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-mono text-inkMuted">color / semantic</p>
          <div className="grid grid-cols-8 gap-1.5">
            {[
              "var(--brand)",
              "var(--ink)",
              "var(--cobalt)",
              "var(--moss)",
              "var(--sand)",
              "var(--line-strong)",
              "var(--muted)",
              "var(--surface)"
            ].map((c, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.04 }}
                className="aspect-square border border-line"
                style={{ background: `rgb(${c})` as string }}
              />
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {[56, 40, 28, 20, 14].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted tabular-nums w-6">{w}</span>
                <span className="h-1.5 bg-ink" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* 02 — 커머스 프론트 리플랫폼 */
export function CommerceMock() {
  return (
    <MockFrame tone="ink" label="shop / product">
      <div className="h-full grid grid-cols-[1fr_140px] gap-4 px-4 pb-4">
        <div className="relative overflow-hidden border border-white/20">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 grid place-items-center"
          >
            <div className="w-[60%] aspect-[3/4] bg-sand/30 border border-white/20" />
          </motion.div>
          <span className="absolute bottom-2 left-2 text-[9px] font-mono opacity-70">
            LCP 1.2s · CLS 0.03
          </span>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px]">
          <p className="font-medium">Mineral Jacket</p>
          <p className="opacity-70">₩ 342,000</p>
          <div className="mt-2 flex gap-1">
            {["XS", "S", "M", "L"].map((s, i) => (
              <span
                key={s}
                className={
                  "w-6 h-6 border border-white/30 grid place-items-center text-[9px] " +
                  (i === 1 ? "bg-brand text-brandInk border-brand" : "")
                }
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-auto grid gap-1">
            <span className="h-7 bg-brand text-brandInk grid place-items-center text-[10px]">
              Add to Cart
            </span>
            <span className="h-7 border border-white/30 grid place-items-center text-[10px]">
              Save
            </span>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* 03 — 협업 에디터 */
export function EditorMock() {
  return (
    <MockFrame tone="cream" label="editor.dabin.dev">
      <div className="h-full px-5 pb-4 flex flex-col gap-1">
        <p className="text-[10px] text-muted">Untitled document</p>
        <p className="font-display font-semibold text-[15px] leading-tight">
          협업은 지연을 어떻게<br />다루느냐의 예술이다
        </p>
        <div className="mt-1 space-y-1">
          {[90, 80, 95, 70, 85].map((w, i) => (
            <div key={i} className="h-1 bg-ink/70" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Cursors */}
        <motion.div
          className="absolute"
          initial={{ x: 40, y: 30 }}
          animate={{ x: [40, 120, 90, 60, 40], y: [30, 70, 110, 60, 30] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: 0, top: 0 }}
        >
          <div className="relative">
            <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" className="text-cobalt">
              <path d="M0 0L12 6L6 8L4 14Z" />
            </svg>
            <span className="absolute left-3 top-3 text-[9px] font-mono bg-cobalt text-bg px-1">
              Yuna
            </span>
          </div>
        </motion.div>
        <motion.div
          className="absolute"
          initial={{ x: 180, y: 80 }}
          animate={{ x: [180, 140, 210, 170, 180], y: [80, 120, 60, 100, 80] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: 0, top: 0 }}
        >
          <div className="relative">
            <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" className="text-brand">
              <path d="M0 0L12 6L6 8L4 14Z" />
            </svg>
            <span className="absolute left-3 top-3 text-[9px] font-mono bg-brand text-brandInk px-1">
              Mike
            </span>
          </div>
        </motion.div>
      </div>
    </MockFrame>
  );
}

/* 04 — Admin */
export function AdminMock() {
  return (
    <MockFrame tone="cream" label="admin / orders">
      <div className="h-full px-4 pb-4 text-[10px]">
        <div className="grid grid-cols-12 gap-1 text-muted border-b border-line pb-1">
          <span className="col-span-2">ID</span>
          <span className="col-span-5">Customer</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-3 text-right">Amount</span>
        </div>
        {[
          { id: "0132", c: "김지우", s: "Paid", a: "142,000" },
          { id: "0131", c: "Alex Park", s: "Shipping", a: "88,400" },
          { id: "0130", c: "박서연", s: "Pending", a: "24,900" },
          { id: "0129", c: "Mark Kim", s: "Paid", a: "256,000" },
          { id: "0128", c: "정다현", s: "Paid", a: "312,500" }
        ].map((r) => (
          <div key={r.id} className="grid grid-cols-12 gap-1 py-1 border-b border-line/60">
            <span className="col-span-2 font-mono tabular-nums text-ink">{r.id}</span>
            <span className="col-span-5">{r.c}</span>
            <span className="col-span-2">
              <span
                className={
                  "px-1 " +
                  (r.s === "Paid"
                    ? "bg-moss/30 text-moss"
                    : r.s === "Shipping"
                    ? "bg-cobalt/20 text-cobalt"
                    : "bg-sand/40 text-ink")
                }
              >
                {r.s}
              </span>
            </span>
            <span className="col-span-3 text-right font-mono tabular-nums">₩ {r.a}</span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

/* Slug → component */
export const mockupMap: Record<string, () => React.ReactNode> = {
  "design-system-atlas": AtlasMock,
  "commerce-frontend": CommerceMock,
  "interactive-editor": EditorMock,
  "internal-admin": AdminMock
};
