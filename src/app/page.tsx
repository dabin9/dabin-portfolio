import AgentIntro from "@/features/agent/components/AgentIntro";
import ContactSection from "@/features/contact/components/ContactSection";
import SelectedWork from "@/features/projects/components/SelectedWork";
import { publicProjects } from "@/entities/project";
import { readProjectsFresh } from "@/entities/project/repository/projectRepository";
import { getProjectSearchText } from "@/entities/project/model/searchText";
import { playgroundItems, publicPlaygroundItems } from "@/entities/playground";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { projects } = await readProjectsFresh();
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
      <SelectedWork projects={projects} />
      <ContactSection playgroundItems={publicPlaygroundItems(playgroundItems)} />
    </>
  );
}
