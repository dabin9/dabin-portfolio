import Link from "next/link";
import { projects, publicProjects, allTags } from "@/data/projects";
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
    <section className="bg-bg">
      <div className="wrap pt-16 md:pt-24 pb-24">
        <div className="grid md:grid-cols-12 gap-8 md:gap-14 border-b border-line pb-8">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase text-muted">
              Work / All
            </p>
          </div>
          <div className="md:col-span-9">
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-ink">
              Works Index
            </h1>
            <p className="mt-4 max-w-[58ch] text-[15px] md:text-[16px] leading-8 text-inkMuted">
              실서비스 레벨로 다룬 프로젝트를 작업 기록 형태로 정리했습니다.
            </p>
          </div>
        </div>

        {tags.length > 0 ? (
          <nav
            aria-label="작업 필터"
            className="flex flex-wrap gap-x-5 gap-y-3 border-b border-line py-5 text-[12px]"
          >
            <Link
              href="/work"
              className={
                "font-mono uppercase underline-offset-[6px] " +
                (!sp.tag
                  ? "text-ink underline decoration-ink"
                  : "text-muted hover:text-ink")
              }
            >
              All ({visible.length})
            </Link>
            {tags.map((tag) => {
              const count = visible.filter((p) => (p.tags ?? []).includes(tag)).length;
              const active = sp.tag === tag;
              return (
                <Link
                  key={tag}
                  href={`/work?tag=${encodeURIComponent(tag)}`}
                  className={
                    "font-mono uppercase underline-offset-[6px] " +
                    (active
                      ? "text-ink underline decoration-ink"
                      : "text-muted hover:text-ink")
                  }
                >
                  {tag} ({count})
                </Link>
              );
            })}
          </nav>
        ) : null}

        <ol className="divide-y divide-line">
          {filtered.map((project, index) => (
            <li key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                data-cursor="label=OPEN"
                className="group grid md:grid-cols-12 gap-5 md:gap-8 py-8 md:py-10 items-start"
              >
                <span className="md:col-span-1 font-mono text-[13px] text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-3">
                  <WorkCardMedia
                    thumbnail={project.thumbnail}
                    altText={project.altText}
                    ongoing={project.ongoing}
                  />
                </div>
                <div className="md:col-span-4">
                  <h2 className="font-display text-2xl md:text-3xl leading-tight text-ink group-hover:text-brand">
                    {project.title}
                  </h2>

                </div>
                <div className="md:col-span-3 text-[13px] md:text-[14px] leading-7 text-inkMuted">
                  <p>{project.stack.join(" · ")}</p>
                  <p className="mt-2 font-mono text-[12px] uppercase text-muted">
                    {project.year} / {project.role}
                  </p>
                  {project.tags && project.tags.length > 0 ? (
                    <p className="mt-2 text-[12px] text-muted">
                      {project.tags.join(" / ")}
                    </p>
                  ) : null}
                </div>
                <span
                  aria-hidden
                  className="md:col-span-1 md:justify-self-end font-mono text-[13px] text-muted group-hover:text-ink"
                >
                  Open
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-[14px] text-muted">
            {sp.tag ? "이 태그의 프로젝트가 없습니다." : "발행된 프로젝트가 없습니다."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
