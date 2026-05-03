import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { readProjectsFresh } from "@/lib/storage";
import ProjectForm from "@/components/admin/ProjectForm";

type Params = { slug: string };

export default async function EditProjectPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!(await isLoggedIn())) {
    redirect(`/admin?next=/admin/projects/${slug}`);
  }
  const { projects } = await readProjectsFresh();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="wrap py-12 max-w-[960px] mx-auto">
      <Link
        href="/admin/projects"
        className="text-[13px] text-inkMuted hover:text-ink"
      >
        ← 작업물 목록
      </Link>
      <h1 className="mt-3 font-display font-medium text-[26px]">{project.title}</h1>
      <p className="mt-1 text-[13px] text-muted font-mono">{project.slug}</p>
      <div className="mt-10">
        <ProjectForm mode="edit" project={project} />
      </div>
    </main>
  );
}
