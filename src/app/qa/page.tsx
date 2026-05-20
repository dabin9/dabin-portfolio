import { projects, publicProjects } from "@/data/projects";
import QaHeroCopy from "./QaHeroCopy";
import QaSearch from "./QaSearch";

export const metadata = { title: "Q&A" };

export default function QaPage() {
  const searchProjects = publicProjects(projects).map(
    ({ slug, title, summary, year, role, company, stack, tags, highlights, order }) => ({
      slug,
      title,
      summary,
      year,
      role,
      company,
      stack,
      tags,
      highlights,
      order
    })
  );

  return (
    <section className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f7fb] px-5 text-[#2b2f33]">
      <div className="w-full max-w-[760px] -translate-y-[3vh]">
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
