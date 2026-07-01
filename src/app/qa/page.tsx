import { projects, publicProjects } from "@/entities/project";
import { getProjectSearchText } from "@/entities/project/model/searchText";
import QaHeroCopy from "@/features/qa/components/QaHeroCopy";
import QaSearch from "@/features/qa/components/QaSearch";

export const metadata = { title: "Q&A" };

export default function QaPage() {
  const searchProjects = publicProjects(projects).map(
    (project) => ({
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      year: project.year,
      role: project.role,
      company: project.company,
      stack: project.stack,
      tags: project.tags,
      highlights: project.highlights,
      searchText: getProjectSearchText(project),
      order: project.order
    })
  );

  return (
    <section className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f7fb] px-5 text-[#2b2f33]">
      <div className="w-full max-w-[960px] -translate-y-[3vh]">
        <div className="mb-7 pl-5 md:pl-6">
          <p className="font-mono text-[13px] uppercase leading-6 tracking-[0.18em] text-[#66717c]">
            DABIN AGENT
          </p>
          <QaHeroCopy />
        </div>

        <QaSearch projects={searchProjects} />
      </div>
    </section>
  );
}
