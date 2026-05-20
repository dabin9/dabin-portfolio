import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProject,
  projects,
  publicProjects,
  type Project,
  type ProjectMediaItem
} from "@/data/projects";
import BlockRenderer from "@/components/BlockRenderer";
import BlockClientRenderer from "@/components/BlockClientRendererLazy";
import ContributionMeter from "@/components/ContributionMeter";
import ProjectMediaCarousel from "@/components/ProjectMediaCarousel";

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

  // 👇 [수정 1] 상단 변수 선언부: 글 갯수에 따른 prev, next 계산 로직 추가
  const visible = publicProjects(projects);
  const i = visible.findIndex((p) => p.slug === project.slug);
  
  let prev = null;
  let next = null;

  if (visible.length >= 3) {
    prev = visible[(i - 1 + visible.length) % visible.length];
    next = visible[(i + 1) % visible.length];
  } else if (visible.length === 2) {
    prev = i === 1 ? visible[0] : null;
    next = i === 0 ? visible[1] : null;
  }
  // 👆 여기까지

  const mediaItems = getProjectMediaItems(project);
  const caseNotes = getCaseNotes(project);
  const resultBullets = getResultBullets(project);

  return (
    <article className="bg-bg">
      <div className="wrap pt-14 md:pt-20 pb-16">
        <Link
          href="/work"
          data-cursor="link"
          className="font-mono text-[12px] uppercase text-muted hover:text-ink inline-block"
        >
          Back to Works
        </Link>

        <header className="mt-8 grid md:grid-cols-12 gap-8 md:gap-14 pb-12 border-b border-line items-start">
          <div className="md:col-span-6 flex flex-col">

            <h1
              className="mt-4 font-display text-[3rem] leading-tight text-ink"
            >
              {project.title}
            </h1>

            <div className="mt-8 flex flex-col gap-4">

              <div className="max-w-[760px]">
              <p className="font-mono text-[12px] uppercase text-muted">
                Project Summary
              </p>
                <dl className="mt-6 grid sm:grid-cols-3 gap-4 border-y border-line py-5">
                  <MetaItem label="Date" value={project.year || "-"} />
                  <MetaItem label="Company" value={project.company || "-"} />
                </dl>
              </div>
            </div>
          </div>
          <div className="md:col-span-6">
            <ProjectMediaCarousel
              items={mediaItems}
              poster={project.thumbnail}
              placeholder={project.altText}
              altFallback={project.title}
            />
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            {project.tags && project.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[11px] uppercase text-inkMuted"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
            {typeof project.contribution === "number" ? (
              <ContributionMeter value={project.contribution} />
            ) : null}
          </div>
        </header>

        {project.bodyHtml || (project.bodyBlocks && project.bodyBlocks.length > 0) ? (
          <section className="mt-16 grid md:grid-cols-12 gap-8">
            <SectionLabel title="Archive Notes" />
            <div className="md:col-span-9 max-w-[760px]">
              {project.bodyHtml ? (
                <BlockRenderer html={project.bodyHtml} />
              ) : (
                <BlockClientRenderer blocks={project.bodyBlocks ?? []} />
              )}
            </div>
          </section>
        ) : null}

        {caseNotes.length > 0 ? (
          <section className="mt-14 grid md:grid-cols-12 gap-8">
            <SectionLabel title="Case Notes" />
            <div className="md:col-span-9 space-y-5">
              {caseNotes.map((note, idx) => (
                <div
                  key={`${note}-${idx}`}
                  className="border-t border-line pt-5"
                >
                  <p className="font-mono text-[12px] uppercase text-muted">
                    Case {String(idx + 1).padStart(2, "0")}
                  </p>
                  <dl className="mt-4 text-[15px] md:text-[16px] leading-8">
                    <CaseRow
                      label="고민했던 부분"
                      html={note.issueTitleHtml}
                      value={note.issueTitle || "-"}
                    />
                    <CaseRow
                      label="이슈사항"
                      html={note.problemHtml}
                      value={note.problem || project.summary || "-"}
                      separated
                    />
                    <CaseRow
                      label="시도 방안"
                      html={note.approachHtml}
                      value={note.approach || "-"}
                      separated
                    />
                    <CaseRow
                      label="결과"
                      html={note.resultHtml}
                      value={
                        note.result ||
                        (typeof project.contribution === "number"
                          ? `${project.contribution}% 기여 범위에서 구현과 정리를 완료한 항목입니다.`
                          : "구현 기록으로 남긴 항목입니다.")
                      }
                      separated
                    />
                  </dl>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {resultBullets.length > 0 ? (
          <section className="mt-14 grid md:grid-cols-12 gap-8">
            <div className="md:col-start-4 md:col-span-9">
              <div className="w-full bg-[#f0f0f0] p-[10px] font-mono text-[12px] font-bold uppercase text-[#000]">
                성과
              </div>
              <ul className="mt-5 space-y-5">
                {resultBullets.map((h, idx) => (
                  <li
                    key={idx}
                    className="grid grid-cols-[auto_1fr] gap-5 items-baseline border-t border-line pt-5"
                  >
                    <span className="font-mono text-[13px] text-brand tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <BlockRenderer
                        html={h}
                        className="text-[16px] md:text-[17px] leading-8 text-ink"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
        

        <section className="mt-16 grid md:grid-cols-12 gap-8 border-t border-line pt-8">
          <SectionLabel title="Links" />
          <div className="md:col-span-9 flex flex-wrap gap-x-5 gap-y-3">
            {project.links?.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[13px] uppercase underline underline-offset-[6px] decoration-lineStrong hover:decoration-ink"
              >
                {l.label} ↗
              </a>
            ))}
            <Link
              href="/work"
              data-cursor="link"
              className="font-mono text-[13px] uppercase underline underline-offset-[6px] decoration-lineStrong hover:decoration-ink"
            >
              Back to Works
            </Link>
          </div>
        </section>
      </div>

      {/* 👇 [수정 2] 하단 nav 렌더링부: 조건부 렌더링 및 빈 공간 추가 */}
      {(prev || next) && (
        <nav className="border-t border-line">
          <div className="wrap py-8 flex items-center justify-between gap-6">
            {prev ? (
              <Link href={`/work/${prev.slug}`} className="group min-w-0 flex-1" data-cursor="link">
                <p className="font-mono text-[12px] uppercase text-muted">Previous</p>
                <p className="mt-1 text-[15px] group-hover:text-brand truncate">
                  ← {prev.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {next ? (
              <Link href={`/work/${next.slug}`} className="group min-w-0 flex-1 text-right" data-cursor="link">
                <p className="font-mono text-[12px] uppercase text-muted">Next</p>
                <p className="mt-1 text-[15px] group-hover:text-brand truncate">
                  {next.title} →
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </nav>
      )}
      {/* 👆 여기까지 */}
    </article>
  );
}

function normalizeMediaType(value?: string): ProjectMediaItem["type"] {
  if (value === "image" || value === "gif" || value === "video") return value;
  return "image";
}

function getProjectMediaItems(project: Project): ProjectMediaItem[] {
  const items = (project.mediaItems ?? [])
    .map((item) => ({
      url: item.url?.trim() ?? "",
      type: normalizeMediaType(item.type),
      alt: item.alt?.trim() || project.title
    }))
    .filter((item) => item.url);

  if (items.length > 0) return items;

  const legacyUrl = project.mediaUrl || project.thumbnail || "";
  if (!legacyUrl) return [];

  return [
    {
      url: legacyUrl,
      type: project.mediaUrl ? normalizeMediaType(project.mediaType) : "image",
      alt: project.mediaAlt || project.title
    }
  ];
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="md:col-span-3">
      <p className="font-mono text-[12px] uppercase text-muted">{title}</p>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd className="mt-1 text-[14px] leading-6 text-ink">{value}</dd>
    </div>
  );
}

function CaseRow({
  label,
  html,
  value,
  separated = false
}: {
  label: string;
  html?: string;
  value: string;
  separated?: boolean;
}) {
  return (
    <div
      data-scroll-reveal
      className={
        "grid grid-cols-1 sm:grid-cols-[112px_minmax(0,1fr)] gap-2 sm:gap-4" +
        (separated ? " border-t border-line pt-3 mt-3" : "")
      }
    >
      <dt className="min-w-0">
        <span className="inline-flex justify-center items-center bg-[rgb(219_219_219_/_28%)] text-[#000000] px-2 py-[7px] rounded-[21px] leading-[1.2] text-[11px] font-medium">
          {label}
        </span>
      </dt>
      <dd className="min-w-0 text-ink">
        {html ? (
          <BlockRenderer html={html} className="case-note-rich text-inkMuted" />
        ) : (
          <p className="whitespace-pre-line text-inkMuted">{value}</p>
        )}
      </dd>
    </div>
  );
}

function getCaseNotes(project: Project): NonNullable<Project["caseNotes"]> {
  if (project.caseNotes && project.caseNotes.length > 0) return project.caseNotes;

  return project.highlights.slice(0, 3).map((item) => ({
    problem: project.summary || undefined,
    approach: item,
    result:
      typeof project.contribution === "number"
        ? `${project.contribution}% 기여 범위에서 구현과 정리를 완료한 항목입니다.`
        : "구현 기록으로 남긴 항목입니다."
  }));
}

function getResultBullets(project: Project): string[] {
  if (project.resultItems && project.resultItems.length > 0) return project.resultItems;

  return project.highlights.length > 3
    ? project.highlights.slice(3, 8)
    : project.highlights.slice(0, 5);
}
