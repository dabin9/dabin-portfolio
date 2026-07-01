import WorkCardMedia from "@/features/projects/components/WorkCardMedia";
import type { PreviewProject } from "./types";

export default function WorkIndexPreview({
  project,
  thumbnail,
  index
}: {
  project: PreviewProject;
  thumbnail: string;
  index: number;
}) {
  return (
    <section className="border-y border-line py-5" aria-label="공개 목록 표시 미리보기">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase text-muted">
            Works Index Preview
          </p>
          <p className="mt-1 text-[12px] text-inkMuted">
            공개 프로젝트 목록에서 보이는 형식과 동일합니다.
          </p>
        </div>
        <span className="font-mono text-[11px] uppercase text-muted">Preview</span>
      </div>

      <div className="group mt-4 grid md:grid-cols-12 gap-5 md:gap-8 py-5 items-start">
        <span className="md:col-span-1 font-mono text-[13px] text-muted tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <div className="md:col-span-3">
          <WorkCardMedia
            thumbnail={thumbnail}
            altText={project.altText}
            ongoing={project.ongoing}
          />
        </div>
        <div className="md:col-span-4">
          <h2 className="font-display text-2xl md:text-3xl leading-tight text-ink group-hover:text-brand">
            {project.title}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-inkMuted">
            {project.summary}
          </p>
        </div>
        <div className="md:col-span-3 text-[13px] md:text-[14px] leading-7 text-inkMuted">
          <p>{project.stack.length > 0 ? project.stack.join(" · ") : "Stack"}</p>
          <p className="mt-2 font-mono text-[12px] uppercase text-muted">
            {project.year} / {project.role}
          </p>
          {project.tags.length > 0 ? (
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
      </div>
    </section>
  );
}
