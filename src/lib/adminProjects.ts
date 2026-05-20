import { redirect } from "next/navigation";
import { isLoggedIn } from "./auth";
import { readProjectsFresh } from "./storage";

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
