import { projects, publicProjects } from "@/entities/project";
import QaResultClient from "@/features/qa/components/QaResultClient";

export const metadata = { title: "Q&A Result" };

export default async function QaResultPage({
  searchParams
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const sp = await searchParams;
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

  return <QaResultClient projects={searchProjects} runId={sp.run || ""} />;
}
