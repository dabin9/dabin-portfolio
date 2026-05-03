import Link from "next/link";
import { projects, publicProjects, allTags } from "@/data/projects";
import { mockupMap } from "@/components/mockups";
import Reveal from "@/components/Reveal";
import WorkCardMedia from "@/components/WorkCardMedia";

export const metadata = { title: "Work" };

export default async function WorkIndex({
  searchParams
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const sp = await searchParams;
  const visible = publicProjects(projects);
  const tags = allTags(visible);
  const filtered = sp.tag
    ? visible.filter((p) => (p.tags ?? []).includes(sp.tag!))
    : visible;

  return (
    <section>
      <div className="wrap pt-16 md:pt-24 pb-24">
        <p className="text-[12px] tracking-[0.4em] text-muted uppercase">Work — All</p>
        <h1
          className="mt-4 font-display font-semibold leading-[1.08] tracking-tightest max-w-[20ch]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
        >
          모든 <span className="font-serif-italic">프로젝트.</span>
        </h1>
        <p className="mt-5 text-[15px] text-inkMuted max-w-[54ch] leading-relaxed">
          실서비스 레벨로 다룬 프로젝트를 정리했습니다.
        </p>

        {tags.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-1.5 items-center">
            <Link
              href="/work"
              className={
                "text-[12px] px-2.5 py-1 border rounded-full " +
                (!sp.tag
                  ? "bg-ink text-bg border-ink"
                  : "border-line text-inkMuted hover:border-ink hover:text-ink")
              }
            >
              전체 ({visible.length})
            </Link>
            {tags.map((t) => {
              const count = visible.filter((p) => (p.tags ?? []).includes(t)).length;
              const active = sp.tag === t;
              return (
                <Link
                  key={t}
                  href={`/work?tag=${encodeURIComponent(t)}`}
                  className={
                    "text-[12px] px-2.5 py-1 border rounded-full " +
                    (active
                      ? "bg-ink text-bg border-ink"
                      : "border-line text-inkMuted hover:border-ink hover:text-ink")
                  }
                >
                  {t} ({count})
                </Link>
              );
            })}
          </div>
        ) : null}

        <ul className="mt-14 md:mt-20 grid md:grid-cols-2 gap-6 md:gap-10">
          {filtered.map((p, i) => {
            const Mock = mockupMap[p.slug];
            return (
              <li key={p.slug} className={i % 2 === 1 ? "md:mt-14" : ""}>
                <Reveal delay={i * 0.05}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-cursor="label=OPEN"
                    className="group block"
                  >
                    <WorkCardMedia
                      thumbnail={p.thumbnail}
                      hoverImage={p.hoverImage}
                      altText={p.altText}
                      ongoing={p.ongoing}
                      fallback={Mock ? <Mock /> : null}
                    />
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[12px] text-muted">
                          {String(i + 1).padStart(2, "0")} · {p.year || "—"}
                        </p>
                        <h3 className="mt-1 font-display font-semibold text-[22px] md:text-[26px] leading-[1.2] tracking-tighter">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-[14px] text-inkMuted leading-relaxed">
                          {p.summary}
                        </p>
                        {p.tags && p.tags.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {p.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 border border-line rounded text-inkMuted"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
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

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-[14px] text-muted">
            {sp.tag ? "이 태그의 프로젝트가 없습니다." : "발행된 프로젝트가 없습니다."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
