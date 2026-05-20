import Link from "next/link";
import type { ReactNode } from "react";
import CountUp from "@/components/CountUp";
import { site } from "@/data/site";
import { env } from "@/lib/env";

const archiveLinks = [
  { label: "Selected Works", href: "#work" },
  env.resume ? { label: "Resume", href: env.resume, external: true } : null,
  { label: "Notion Archive", href: env.notion || "/blog", external: Boolean(env.notion) },
  { label: "GitHub", href: env.github, external: true }
].filter(Boolean) as { label: string; href: string; external?: boolean }[];

export default function Hero() {
  const years = parseStat(site.year);
  const projects = parseStat(site.projects);

  return (
    <section className="bg-bg border-b border-line">
      <div className="wrap pt-20 md:pt-28 pb-16 md:pb-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-14">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase text-muted">
              Frontend Archive
            </p>
            <dl className="mt-8 space-y-4 text-[13px]">
              <Meta label="Name" value={site.name} />
              <Meta label="year" value={<AnimatedStat stat={years} />} />
              <Meta label="projects" value={<AnimatedStat stat={projects} />} />
              <Meta label="Base" value={site.location} />
              <Meta label="Focus" value="Web UI / CMS" />
            </dl>
          </div>

          <div className="md:col-span-9">
            <p className=" text-2xl md:text-3xl text-brand">
              <AnimatedStat stat={years} /> years of experience,{" "}
              <AnimatedStat stat={projects} /> projects and counting.
            </p>
            <h1 className="mt-4 max-w-[10ch] font-display text-5xl md:text-7xl lg:text-8xl leading-none text-ink">
              Frontend Work Archive
            </h1>

            <div className="mt-8 max-w-[58ch] space-y-3 text-[16px] md:text-[17px] leading-8 text-inkMuted">
              <p>운영되는 웹사이트를 만드는 프론트엔드 개발자 박다빈입니다.<br />반응형 UI, CMS 연동, 관리자 데이터 흐름까지 고려해 서비스 구조를 구현합니다.<br />보기 좋은 화면을 넘어, 관리되고 유지되는 웹사이트를 만듭니다.</p>

            </div>

            <nav
              aria-label="주요 링크"
              className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 text-[13px] md:text-[14px]"
            >
              {archiveLinks.map((item, index) => (
                <span key={item.label} className="inline-flex items-center gap-4">
                  {index > 0 ? (
                    <span aria-hidden className="text-lineStrong">
                      /
                    </span>
                  ) : null}
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="link"
                      className="font-mono uppercase text-ink underline underline-offset-[6px] decoration-lineStrong hover:decoration-ink"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      data-cursor="link"
                      className="font-mono uppercase text-ink underline underline-offset-[6px] decoration-lineStrong hover:decoration-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

type Stat = {
  value: number;
  suffix: string;
};

function parseStat(value: string): Stat {
  const match = value.match(/^(\d+)(.*)$/);

  if (!match) return { value: Number(value) || 0, suffix: "" };

  return {
    value: Number(match[1]),
    suffix: match[2]
  };
}

function AnimatedStat({ stat }: { stat: Stat }) {
  const minWidth = `${String(stat.value).length + stat.suffix.length}ch`;

  return (
    <span className="inline-block tabular-nums text-right" style={{ minWidth }}>
      <CountUp from={1} to={stat.value} suffix={stat.suffix} />
    </span>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-t border-line pt-3">
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
