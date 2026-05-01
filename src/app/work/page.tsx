import Link from "next/link";
import { projects } from "@/data/projects";
import { mockupMap } from "@/components/mockups";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Work" };

export default function WorkIndex() {
  return (
    <section>
      <div className="wrap pt-16 md:pt-24 pb-24">
        <p className="text-[13px] text-muted flex items-center gap-3">
          <span>W</span>
          <span className="w-5 h-px bg-ink/40" />
          <span>Work — All</span>
        </p>
        <h1
          className="mt-4 font-display font-semibold leading-[1.08] tracking-tightest max-w-[20ch]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
        >
          모든 <span className="font-serif-italic text-brand">프로젝트.</span>
        </h1>
        <p className="mt-5 text-[15px] text-inkMuted max-w-[54ch] leading-relaxed">
          실서비스 레벨로 다룬 프로젝트를 연대순으로 정리했습니다.
        </p>

        <ul className="mt-14 md:mt-20 grid md:grid-cols-2 gap-6 md:gap-10">
          {projects.map((p, i) => {
            const Mock = mockupMap[p.slug];
            return (
              <li key={p.slug} className={i % 2 === 1 ? "md:mt-14" : ""}>
                <Reveal delay={i * 0.05}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-cursor="label=OPEN"
                    className="group block"
                  >
                    {Mock ? <Mock /> : null}
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[12px] text-muted">
                          {String(i + 1).padStart(2, "0")} · {p.year}
                        </p>
                        <h3 className="mt-1 font-display font-semibold text-[22px] md:text-[26px] leading-[1.2] tracking-tighter">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-[14px] text-inkMuted leading-relaxed">
                          {p.summary}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="inline-flex shrink-0 w-9 h-9 border border-line items-center justify-center text-inkMuted group-hover:bg-ink group-hover:text-bg group-hover:border-ink group-hover:rotate-[-45deg] transition"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
