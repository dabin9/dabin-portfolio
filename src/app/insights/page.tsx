import Link from "next/link";
import { insights } from "@/data/insights";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Insights" };

export default function InsightsIndex() {
  return (
    <section>
      <div className="wrap pt-16 md:pt-24 pb-24">
        <p className="text-[13px] text-muted flex items-center gap-3">
          <span>I</span>
          <span className="w-5 h-px bg-ink/40" />
          <span>Insights — All</span>
        </p>
        <h1
          className="mt-4 font-display font-semibold leading-[1.08] tracking-tightest max-w-[20ch]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
        >
          쌓여가는 <span className="font-serif-italic text-brand">생각들.</span>
        </h1>
        <p className="mt-5 text-[15px] text-inkMuted max-w-[54ch] leading-relaxed">
          현재는 하드코딩된 글입니다. 데이터 스키마를 분리해 두어 CMS/MDX 로 교체가 쉽습니다.
        </p>

        <ol className="mt-14 border-t border-line">
          {insights.map((post, i) => (
            <li key={post.slug} className="border-b border-line">
              <Reveal delay={i * 0.04}>
                <Link
                  href={`/insights/${post.slug}`}
                  data-cursor="label=READ"
                  className="group relative grid grid-cols-12 gap-6 py-8 md:py-10 items-baseline"
                >
                  <span className="col-span-2 md:col-span-1 text-[13px] text-muted pt-1 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="col-span-10 md:col-span-8 min-w-0">
                    <h3 className="font-display font-semibold text-2xl md:text-[26px] leading-[1.26] tracking-tight">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-[15px] text-inkMuted leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-muted">
                      {post.tags.map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:flex md:col-span-3 items-center justify-end gap-6">
                    <span className="text-[13px] text-muted tabular-nums">
                      {formatDate(post.date)}
                    </span>
                    <span
                      aria-hidden
                      className="inline-block text-muted group-hover:text-brand group-hover:translate-x-1 transition"
                    >
                      →
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
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
