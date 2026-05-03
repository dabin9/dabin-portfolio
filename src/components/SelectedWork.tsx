"use client";

import Link from "next/link";
import { projects, publicProjects } from "@/data/projects";
import { mockupMap } from "./mockups";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";
import SplitChars from "./SplitChars";
import WorkCardMedia from "./WorkCardMedia";

/**
 * 핵심 프로젝트 — 발행된 작업물 중 featured 만, order 큰 순서대로 노출.
 */
export default function SelectedWork() {
  const featured = publicProjects(projects).filter((p) => p.featured);

  return (
    <section id="work" className="bg-bg border-b border-line">
      <div className="wrap py-28 md:py-36">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[12px] tracking-[0.4em] text-muted uppercase">
            Work
          </p>
          <p className="mt-3 font-serif-italic text-[20px] md:text-[24px] text-ink">
            I like what i do
          </p>
          <h2
            className="mt-6 font-display font-medium leading-[1.2] tracking-tightest"
            style={{ fontSize: "clamp(1.8rem, 4.4vw, 3rem)" }}
          >
            <SplitChars text="핵심 프로젝트." stagger={0.03} />
          </h2>
        </div>

        <ul className="grid md:grid-cols-2 gap-10 md:gap-14 max-w-[1100px] mx-auto">
          {featured.map((p, i) => {
            const Mock = mockupMap[p.slug];
            const offset = i % 2 === 0 ? "md:mt-0" : "md:mt-20";
            return (
              <li key={p.slug} className={offset}>
                <Reveal delay={i * 0.06}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-cursor="label=OPEN"
                    className="group block"
                  >
                    <TiltCard className="rounded-2xl">
                      <WorkCardMedia
                        thumbnail={p.thumbnail}
                        hoverImage={p.hoverImage}
                        altText={p.altText}
                        ongoing={p.ongoing}
                        fallback={Mock ? <Mock /> : null}
                      />
                    </TiltCard>

                    <div className="mt-6">
                      <h3 className="font-display font-medium text-[22px] md:text-[26px] leading-[1.25] tracking-tight">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-[14px] text-inkMuted max-w-[52ch] leading-relaxed">
                        {p.summary}
                      </p>
                    </div>

                    <dl className="mt-5 text-[13px] space-y-1.5">
                      <MetaRow label="작업한 연도" value={p.year} />
                      <MetaRow label="관련 기술" value={p.stack.slice(0, 4).join(" · ")} />
                      {p.company ? <MetaRow label="근무처" value={p.company} /> : null}
                    </dl>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <div className="mt-16 text-center">
          <Link
            href="/work"
            data-cursor="link"
            className="inline-flex items-center gap-2 text-[13px] text-ink border-b border-ink/30 hover:border-ink pb-1"
          >
            전체 작업 보기 <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
