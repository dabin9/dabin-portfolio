import Link from "next/link";
import { projects, publicProjects } from "@/entities/project";
import WorkCardMedia from "./WorkCardMedia";

export default function SelectedWork() {
  const featured = publicProjects(projects).filter((p) => p.featured);

  return (
    <section id="work" className="bg-bg">
      <div className="wrap py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-8 md:gap-14 border-b border-line pb-8">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase text-muted">
              Selected Works
            </p>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-ink">
              Project Index
            </h2>
            <p className="mt-4 max-w-[58ch] text-[15px] md:text-[16px] leading-8 text-inkMuted">
              실제 운영되는 웹사이트의 UI, 콘텐츠 관리 구조, 인터랙션 구현 기록을
              번호형 인덱스로 정리했습니다.
            </p>
          </div>
        </div>

        <ol className="divide-y divide-line">
          {featured.map((project, index) => (
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
                  <h3 className="font-display text-2xl md:text-3xl leading-tight text-ink group-hover:text-brand">
                    {project.title}
                  </h3>

                </div>

                <span
                  aria-hidden
                  className="md:col-span-1 md:justify-self-end font-mono text-[13px] text-muted group-hover:text-ink"
                >
                  View
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="pt-8 border-t border-line">
          <Link
            href="/work"
            data-cursor="link"
            className="font-mono text-[13px] uppercase text-ink underline underline-offset-[6px] decoration-lineStrong hover:decoration-ink"
          >
            All Works
          </Link>
        </div>
      </div>
    </section>
  );
}
