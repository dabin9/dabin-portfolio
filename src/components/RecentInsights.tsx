import Link from "next/link";
import { insights } from "@/data/insights";
import Reveal from "./Reveal";

export default function RecentInsights() {
  const recent = insights.slice(0, 3);
  const [lead, ...rest] = recent;

  return (
    <section id="insights" className="border-b border-line">
      <div className="wrap py-24 md:py-32">
        <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="text-[13px] text-muted flex items-center gap-3">
              <span className="tnum">05</span>
              <span className="w-5 h-px bg-ink/40" />
              <span>Insights</span>
            </p>
            <h2
              className="mt-4 font-display font-semibold leading-[1.08] tracking-tightest"
              style={{ fontSize: "clamp(1.9rem, 4.6vw, 3.25rem)" }}
            >
              쓰면서 정리하는 <span className="font-serif-italic">생각들.</span>
            </h2>
          </div>
          <Link
            href="/insights"
            data-cursor="link"
            className="hidden md:inline-flex items-center gap-1 text-[13px] text-inkMuted hover:text-ink"
          >
            모든 글 <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-12 gap-8 md:gap-10">
          {/* Lead — 크게 */}
          {lead ? (
            <Reveal className="md:col-span-7">
              <Link
                href={`/insights/${lead.slug}`}
                data-cursor="label=READ"
                className="group block border border-line hover:border-ink p-6 md:p-10 h-full transition-colors"
              >
                <div className="aspect-[16/10] bg-surface border border-line relative overflow-hidden mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="font-display font-semibold text-[clamp(2.4rem,8vw,5rem)] tracking-tightest text-ink/90 px-6 text-center leading-[1.05]">
                      <span className="font-serif-italic text-brand">"</span>
                      계약
                      <span className="font-serif-italic text-brand">"</span>
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-muted">
                  {formatDate(lead.date)} · {lead.readTime}
                </p>
                <h3 className="mt-2 font-display font-semibold text-[26px] md:text-[32px] leading-[1.2] tracking-tight">
                  {lead.title}
                </h3>
                <p className="mt-3 text-[15px] text-inkMuted leading-relaxed max-w-[58ch]">
                  {lead.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-[13px] text-inkMuted group-hover:text-ink">
                  읽기 <span aria-hidden className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </Reveal>
          ) : null}

          {/* Rest — 스택 */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.05}>
                <Link
                  href={`/insights/${post.slug}`}
                  data-cursor="label=READ"
                  className="group grid grid-cols-[56px_1fr] gap-5 border border-line hover:border-ink p-5 md:p-6 transition-colors"
                >
                  <div
                    className="aspect-square border border-line flex items-center justify-center text-[28px] font-serif-italic text-brand"
                    style={{ background: "rgb(var(--surface))" }}
                  >
                    {String(i + 2).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted">
                      {formatDate(post.date)} · {post.readTime}
                    </p>
                    <h4 className="mt-1 font-display font-semibold text-[17px] leading-[1.25] tracking-tight">
                      {post.title}
                    </h4>
                    <p className="mt-1.5 text-[13px] text-inkMuted leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-10 flex md:hidden">
          <Link
            href="/insights"
            className="text-[13px] text-inkMuted hover:text-ink inline-flex items-center gap-1.5"
          >
            모든 글 보기 <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(iso));
}
