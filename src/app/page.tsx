import AgentIntro from "@/components/agent/AgentIntro";
import SelectedWork from "@/components/SelectedWork";
import { projects, publicProjects } from "@/data/projects";

export default function HomePage() {
  const agentProjects = publicProjects(projects).map((project) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    year: project.year,
    role: project.role,
    company: project.company,
    stack: project.stack,
    tags: project.tags,
    highlights: project.highlights,
    resultItems: project.resultItems,
    featured: project.featured,
    order: project.order,
    description: [
      ...(project.caseNotes ?? []).flatMap((note) => [
        note.issueTitle ?? "",
        note.problem ?? "",
        note.approach,
        note.result ?? ""
      ]),
      ...(project.resultItems ?? []),
      ...project.highlights
    ].join(" ")
  }));

  return (
    <>
      <AgentIntro projects={agentProjects} />
      <SelectedWork />
    </>
  );
}
