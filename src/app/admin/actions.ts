"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import {
  upsertProject,
  deleteProjectBySlug,
  readProjectsFresh
} from "@/lib/storage";
import type { Project, ProjectBlock } from "@/data/projects";

/* ---------- Project CRUD ---------- */

async function requireAuth() {
  if (!(await isLoggedIn())) {
    redirect("/admin?error=unauthenticated");
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function parseList(s: string): string[] {
  return s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseLinks(s: string): { label: string; href: string }[] {
  return s
    .split("\n")
    .map((line) => {
      const m = line.match(/^\s*(.+?)\s*\|\s*(\S+)\s*$/);
      return m ? { label: m[1], href: m[2] } : null;
    })
    .filter((x): x is { label: string; href: string } => !!x);
}

function projectFromForm(
  formData: FormData,
  blocks: ProjectBlock[],
  bodyHtml: string
): Project {
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugInput ? slugify(slugInput) : slugify(title);
  return {
    slug,
    title,
    summary: String(formData.get("summary") || "").trim(),
    year: String(formData.get("year") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    company: String(formData.get("company") || "").trim() || undefined,
    thumbnail: String(formData.get("thumbnail") || "").trim() || undefined,
    stack: parseList(String(formData.get("stack") || "")),
    highlights: parseList(String(formData.get("highlights") || "")),
    links: parseLinks(String(formData.get("links") || "")),
    featured: formData.get("featured") === "on",
    ongoing: formData.get("ongoing") === "on",
    bodyBlocks: blocks,
    bodyHtml: bodyHtml || undefined
  };
}

export async function saveProjectAction(formData: FormData) {
  await requireAuth();

  const blocksRaw = String(formData.get("blocks") || "[]");
  let blocks: ProjectBlock[] = [];
  try {
    blocks = JSON.parse(blocksRaw) as ProjectBlock[];
  } catch {
    blocks = [];
  }
  const bodyHtml = String(formData.get("blocksHtml") || "");

  const project = projectFromForm(formData, blocks, bodyHtml);
  if (!project.title) {
    redirect("/admin/projects/new?error=title");
  }
  if (!project.slug) {
    redirect("/admin/projects/new?error=slug");
  }

  await upsertProject(project, `admin: save project "${project.slug}"`);
  revalidatePath("/", "layout");
  revalidatePath(`/work/${project.slug}`);
  revalidatePath("/work");
  redirect(`/admin/projects?saved=${encodeURIComponent(project.slug)}`);
}

export async function deleteProjectAction(formData: FormData) {
  await requireAuth();
  const slug = String(formData.get("slug") || "");
  if (!slug) redirect("/admin/projects");
  await deleteProjectBySlug(slug, `admin: delete project "${slug}"`);
  revalidatePath("/", "layout");
  revalidatePath("/work");
  redirect("/admin/projects?deleted=1");
}

/* ---------- Helpers exposed to admin pages ---------- */

export async function getAdminProjects() {
  await requireAuth();
  const { projects } = await readProjectsFresh();
  return projects;
}
