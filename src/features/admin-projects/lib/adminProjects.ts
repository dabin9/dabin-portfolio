import { redirect } from "next/navigation";
import { isLoggedIn } from "@/features/admin/lib/auth";
import { readProjectsFresh } from "@/entities/project/repository/projectRepository";

export async function requireAdmin() {
  if (!(await isLoggedIn())) {
    redirect("/admin?error=unauthenticated");
  }
}

export async function getAdminProjects() {
  await requireAdmin();
  const { projects } = await readProjectsFresh();
  return projects;
}
