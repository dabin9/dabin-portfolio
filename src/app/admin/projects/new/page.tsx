import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function NewProjectPage() {
  if (!(await isLoggedIn())) redirect("/admin?next=/admin/projects/new");

  return (
    <main className="wrap py-12 max-w-[960px] mx-auto">
      <Link
        href="/admin/projects"
        className="text-[13px] text-inkMuted hover:text-ink"
      >
        ← 작업물 목록
      </Link>
      <h1 className="mt-3 font-display font-medium text-[26px]">새 작업물</h1>
      <p className="mt-1 text-[13px] text-muted">
        제목과 요약, 본문을 작성하고 저장하세요.
      </p>
      <div className="mt-10">
        <ProjectForm mode="new" />
      </div>
    </main>
  );
}
