import Link from "next/link";
import type { RankedAgentProject } from "@/lib/agentSearch";

type ProjectResultCardProps = {
  projects: RankedAgentProject[];
};

export default function ProjectResultCard({ projects }: ProjectResultCardProps) {
  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <article
          key={project.slug}
          className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase text-muted">Project Result</p>
              <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
                {project.title}
              </h3>
            </div>
            <Link
              href={`/work/${project.slug}`}
              data-cursor="link"
              className="inline-flex h-10 shrink-0 items-center rounded-full bg-ink px-4 font-mono text-[12px] uppercase text-bg transition hover:bg-brand hover:text-brandInk"
            >
              프로젝트 보기
            </Link>
          </div>

          <dl className="mt-5 grid gap-3 text-[13px] leading-6 text-inkMuted md:grid-cols-2 md:text-[14px]">
            <ProjectMeta label="개발 시기" value={project.year} />
            <ProjectMeta
              label="프로젝트 타입"
              value={project.role || project.tags?.[0] || "Portfolio Work"}
            />
          </dl>

          <p className="mt-4 text-[14px] leading-7 text-inkMuted md:text-[15px]">
            {project.displaySummary}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[...project.stack, ...(project.tags ?? [])].slice(0, 9).map((item, index) => (
              <span
                key={`${project.slug}-${item}-${index}`}
                className="inline-flex min-h-8 items-center rounded-full border border-line bg-surface px-3 text-[12px] text-inkMuted"
              >
                {item}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-3">
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd className="mt-1 text-inkMuted">{value}</dd>
    </div>
  );
}
