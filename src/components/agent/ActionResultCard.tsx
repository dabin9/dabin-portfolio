import Link from "next/link";
import type { AgentResolvedResult } from "@/lib/agentSearch";

type ActionResultCardProps = {
  result: Extract<AgentResolvedResult, { kind: "action" }>;
  onReset: () => void;
};

export default function ActionResultCard({ result, onReset }: ActionResultCardProps) {
  return (
    <article className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6">
      <p className="font-mono text-[11px] uppercase text-muted">Action Result</p>
      <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
        {result.title}
      </h3>
      <p className="mt-3 text-[14px] leading-7 text-inkMuted md:text-[15px]">
        {result.message}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {result.path ? (
          <Link
            href={result.path}
            data-cursor="link"
            className="inline-flex h-11 items-center rounded-full bg-ink px-5 font-mono text-[12px] uppercase text-bg transition hover:bg-brand hover:text-brandInk"
          >
            {result.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onReset}
            data-cursor="link"
            className="inline-flex h-11 items-center rounded-full bg-ink px-5 font-mono text-[12px] uppercase text-bg transition hover:bg-brand hover:text-brandInk"
          >
            {result.label}
          </button>
        )}
      </div>
    </article>
  );
}
