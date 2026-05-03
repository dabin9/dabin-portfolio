import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, projects, publicProjects } from "@/data/projects";
import { mockupMap } from "@/components/mockups";
import BlockRenderer from "@/components/BlockRenderer";
import BlockClientRenderer from "@/components/BlockClientRendererLazy";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return publicProjects(projects).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  // 비공개/임시저장은 공개 페이지에서 404
  if ((project.status ?? "published") !== "published") notFound();

  const visible = publicProjects(projects);
  const i = visible.findIndex((p) => p.slug === project.slug);
  const prev = visible[(i - 1 + visible.length) % visible.length];
  const next = visible[(i + 1) % visible.length];
  const Mock = mockupMap[project.slug];

  return (
    <article>
      <div className="wrap pt-14 md:pt-20 pb-16">
        <Link
          href="/work"
          data-cursor="link"
          className="text-[13px] text-muted hover:text-ink inline-block"
        >
          ← Work
        </Link>

        <header className="mt-8 grid md:grid-cols-12 gap-8 pb-10 border-b border-line">
          <div className="md:col-span-7">
            <p className="text-[13px] text-muted">{project.year} · {project.role}</p>
            <h1
              className="mt-4 font-display font-semibold leading-[1.08] tracking-tightest"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
            >
              {project.title}
            </h1>
            <p className="mt-5 text-[17px] text-inkMuted leading-[1.85] max-w-[58ch]">
              {project.summary}
            </p>
            {project.links?.length ? (
              <div className="mt-5 flex flex-wrap gap-4">
                {project.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] underline underline-offset-4 decoration-ink/30 hover:decoration-ink"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div className="md:col-span-5">
            {project.thumbnail ? (
              <div
                className="relative w-full overflow-hidden rounded-2xl border border-line bg-surface"
                style={{ aspectRatio: "16/10" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.thumbnail}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : Mock ? (
              <Mock />
            ) : null}
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            {project.tags && project.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 border border-line rounded-full text-inkMuted"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
            {typeof project.contribution === "number" ? (
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-[12px]">
                  <span className="text-muted">기여도</span>
                  <span className="text-ink font-mono tabular-nums">
                    {project.contribution}%
                  </span>
                </div>
                <div className="mt-2 h-1 w-full bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink transition-[width] duration-700"
                    style={{ width: `${project.contribution}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <section className="mt-12 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <p className="text-[13px] text-muted">Highlights</p>
          </div>
          <ul className="md:col-span-9 space-y-5">
            {project.highlights.map((h, idx) => (
              <li
                key={idx}
                className="grid grid-cols-[auto_1fr] gap-5 items-baseline border-t border-line pt-5"
              >
                <span className="font-serif-italic text-[24px] text-brand tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="text-[17px] leading-[1.82] text-ink">{h}</p>
              </li>
            ))}
          </ul>
        </section>

        {project.bodyHtml || (project.bodyBlocks && project.bodyBlocks.length > 0) ? (
          <section className="mt-16 grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="text-[13px] text-muted">Notes</p>
            </div>
            <div className="md:col-span-9 max-w-[760px]">
              {project.bodyHtml ? (
                <BlockRenderer html={project.bodyHtml} />
              ) : (
                <BlockClientRenderer blocks={project.bodyBlocks ?? []} />
              )}
            </div>
          </section>
        ) : null}
      </div>

      <nav className="border-t border-line">
        <div className="wrap py-8 flex items-center justify-between gap-6">
          <Link href={`/work/${prev.slug}`} className="group min-w-0 flex-1" data-cursor="link">
            <p className="text-[12px] text-muted">Previous</p>
            <p className="mt-1 text-[15px] group-hover:text-brand truncate">
              ← {prev.title}
            </p>
          </Link>
          <Link href={`/work/${next.slug}`} className="group min-w-0 flex-1 text-right" data-cursor="link">
            <p className="text-[12px] text-muted">Next</p>
            <p className="mt-1 text-[15px] group-hover:text-brand truncate">
              {next.title} →
            </p>
          </Link>
        </div>
      </nav>
    </article>
  );
}
