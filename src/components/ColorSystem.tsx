"use client";

import { useState } from "react";

type Swatch = {
  name: string;
  token: string;
  varName: string;
  note: string;
  ink?: "dark" | "light";
};

const swatches: Swatch[] = [
  { name: "Vermilion", token: "--brand", varName: "brand", note: "Primary · CTA", ink: "light" },
  { name: "Ink", token: "--ink", varName: "ink", note: "Body / Display", ink: "light" },
  { name: "Cream", token: "--bg", varName: "bg", note: "Background", ink: "dark" },
  { name: "Surface", token: "--surface", varName: "surface", note: "Panels", ink: "dark" },
  { name: "Cobalt", token: "--cobalt", varName: "cobalt", note: "Link / Info", ink: "light" },
  { name: "Moss", token: "--moss", varName: "moss", note: "Success · Paid", ink: "light" },
  { name: "Sand", token: "--sand", varName: "sand", note: "Warning · Mark", ink: "dark" },
  { name: "Line", token: "--line-strong", varName: "line", note: "Dividers", ink: "dark" }
];

export default function ColorSystem() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (s: Swatch) => {
    try {
      await navigator.clipboard.writeText(`var(${s.token})`);
      setCopied(s.varName);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border border-line">
      {swatches.map((s) => (
        <button
          key={s.varName}
          type="button"
          onClick={() => copy(s)}
          data-cursor="label=COPY"
          className="group relative aspect-[4/3] text-left p-4 border-b md:border-b-0 border-r border-line last:border-r-0 [&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:border-r md:[&:nth-child(4)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-last-child(-n+4)]:border-b-0 transition-colors"
          style={{ background: `rgb(var(${s.token}))`, color: s.ink === "dark" ? "rgb(var(--ink))" : "#fff" }}
        >
          <div>
            <p className="font-display font-semibold text-[17px] tracking-tight">{s.name}</p>
            <p className="text-[11px] opacity-70 mt-0.5">{s.note}</p>
          </div>
          <p
            className="absolute bottom-3 left-4 right-4 font-mono text-[10px] tracking-[0.14em] uppercase opacity-60 group-hover:opacity-100 transition-opacity truncate"
          >
            var({s.token})
          </p>
          <span
            className={
              "absolute top-3 right-3 text-[10px] font-mono px-1.5 py-0.5 border transition " +
              (copied === s.varName
                ? "opacity-100 border-current"
                : "opacity-0 group-hover:opacity-80 border-current")
            }
          >
            {copied === s.varName ? "Copied" : "Click to copy"}
          </span>
        </button>
      ))}
    </div>
  );
}
