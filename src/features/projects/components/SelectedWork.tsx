import Link from "next/link";
import { projects, publicProjects, type Project } from "@/entities/project";
import { plainText } from "@/shared/lib/plainText";
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
                  <p className="mt-3 font-mono text-[12px] uppercase leading-5 text-muted">
                    {getProjectRoleLabel(project)}
                  </p>
                  <p className="mt-3 max-w-[54ch] text-[14px] leading-7 text-inkMuted md:text-[15px]">
                    {getProjectOutcome(project)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getProjectStackChips(project).map((item) => (
                      <span
                        key={`${project.slug}-stack-${item}`}
                        className="inline-flex min-h-8 items-center rounded-full border border-line bg-surface px-3 text-[12px] text-inkMuted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getProjectMetricBadges(project).map((item) => (
                      <span
                        key={`${project.slug}-metric-${item}`}
                        className="inline-flex min-h-7 items-center rounded-md bg-ink px-2.5 font-mono text-[11px] uppercase text-bg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
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

function getProjectRoleLabel(project: Project): string {
  return [project.role, project.company].filter(Boolean).join(" · ");
}

function getProjectOutcome(project: Project): string {
  const curated = selectedWorkOutcomes[project.slug];
  if (curated) return curated;

  const fallback =
    project.resultItems?.[0] ||
    project.highlights[0] ||
    project.summary ||
    "작업 구조와 구현 맥락을 상세 페이지에서 확인할 수 있습니다.";

  return plainText(fallback).replace(/\s+/g, " ").trim();
}

function getProjectStackChips(project: Project): string[] {
  return project.stack
    .flatMap((item) => item.split("·").map((part) => part.trim()))
    .filter(Boolean)
    .slice(0, 4);
}

function getProjectMetricBadges(project: Project): string[] {
  return selectedWorkMetrics[project.slug] ?? [];
}

const selectedWorkOutcomes: Record<string, string> = {
  "3": "주문 유형별 조회, 필터, 테이블 구조를 공통화해 운영자가 주문 상태를 빠르게 탐색하도록 개선했습니다.",
  "6": "법문과 논문 검색 결과를 하나의 탐색 흐름으로 정리해 자료 검색 이후의 후속 액션까지 연결했습니다.",
  "1": "숙박 사이트에 반복되는 화면과 운영 구조를 공통 패턴으로 정리해 브랜드별 구축 속도를 줄였습니다.",
  "4": "레거시 PHP/GnuBoard 구조를 역추적해 관리자 설정값과 프론트 상품·게시판 출력을 연결했습니다.",
  "5": "의료 상담 운영 목적에 맞춰 반응형 UI와 비회원 상담 접수, 관리자 확인 흐름을 연결했습니다."
};

const selectedWorkMetrics: Record<string, string[]> = {
  "3": ["3 order types", "4-5 filters", "16 columns"],
  "6": ["2 domains", "11 sources", "20/page"],
  "1": ["11 sites", "7d to 1d", "1 year"],
  "4": ["3 partners", "1 week", "commerce flow"],
  "5": ["CMS custom", "IO API", "consult flow"]
};
