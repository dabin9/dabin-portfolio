import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLoggedIn } from "@/features/admin/lib/auth";
import { readProjectsFresh } from "@/entities/project/repository/projectRepository";
import { allTags as collectTags } from "@/entities/project";
import { getMediaOptions } from "@/features/admin-projects/lib/mediaOptions";
import ProjectForm from "@/features/admin-projects/components/ProjectForm";

type Params = { slug: string };

export default async function EditProjectPage({
  params,
  searchParams
}: {
  params: Promise<Params>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  if (!(await isLoggedIn())) {
    redirect(`/admin?next=/admin/projects/${slug}`);
  }
  const sp = await searchParams;
  const { projects } = await readProjectsFresh();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const mediaOptions = await getMediaOptions();

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

      {sp.error ? (
        <p className="mt-5 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2.5 whitespace-pre-line">
          {sp.error}
        </p>
      ) : null}

      <div className="mt-10">
        <ProjectForm
          mode="edit"
          project={project}
          allTags={collectTags(projects)}
          mediaOptions={mediaOptions}
        />
      </div>
    </main>
  );
}
