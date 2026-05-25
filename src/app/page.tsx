import AgentIntro from "@/components/agent/AgentIntro";
import SelectedWork from "@/components/SelectedWork";
import { projects, publicProjects } from "@/data/projects";
import { getProjectSearchText } from "@/lib/projectSearchText";

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
    searchText: getProjectSearchText(project)
  }));

  return (
    <>
      <AgentIntro projects={agentProjects} />
      <SelectedWork />
    </>
  );
}
