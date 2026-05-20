"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  deleteProjectBySlug
} from "@/lib/storage";
import { requireAdmin } from "@/lib/adminProjects";
import { formatStorageError } from "@/lib/adminProjectForm";

/* ---------- Project CRUD ---------- */

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "");
  if (!slug) redirect("/admin/projects");
  try {
    await deleteProjectBySlug(slug, `admin: delete project "${slug}"`);
  } catch (e) {
    redirect(`/admin/projects?error=${encodeURIComponent(formatStorageError(e))}`);
  }
  revalidatePath("/", "layout");
  revalidatePath("/work");
  redirect("/admin/projects?deleted=1");
}
