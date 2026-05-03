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
    redirect("/admin/projects/new?error=" + encodeURIComponent("제목이 비어있어요"));
  }
  if (!project.slug) {
    redirect("/admin/projects/new?error=" + encodeURIComponent("Slug 를 입력하거나 제목을 영문/한글로 적어주세요"));
  }

  const editPath =
    formData.get("mode") === "edit"
      ? `/admin/projects/${encodeURIComponent(project.slug)}`
      : "/admin/projects/new";

  try {
    await upsertProject(project, `admin: save project "${project.slug}"`);
  } catch (e) {
    redirect(`${editPath}?error=${encodeURIComponent(formatStorageError(e))}`);
  }
  revalidatePath("/", "layout");
  revalidatePath(`/work/${project.slug}`);
  revalidatePath("/work");
  redirect(`/admin/projects?saved=${encodeURIComponent(project.slug)}`);
}

export async function deleteProjectAction(formData: FormData) {
  await requireAuth();
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

/**
 * 스토리지 레이어 에러를 사용자에게 보여줄 형태로 정돈한다.
 * GitHub 미설정/권한문제는 가장 흔한 실패라 별도 가이드 메시지를 붙인다.
 */
function formatStorageError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/GitHub backend not configured/i.test(msg)) {
    return "Vercel 환경변수 GITHUB_TOKEN · GITHUB_OWNER · GITHUB_REPO 가 설정돼야 저장이 가능해요.";
  }
  if (/401|Bad credentials/i.test(msg)) {
    return "GitHub 토큰이 거부됨 (401). PAT 의 repo scope · 만료여부 확인.";
  }
  if (/403/i.test(msg)) {
    return "GitHub 가 권한을 거절(403). PAT 의 repo write 권한 또는 fine-grained 권한 확인.";
  }
  if (/404/i.test(msg)) {
    return "GitHub 저장소를 찾지 못함(404). GITHUB_OWNER · GITHUB_REPO 가 정확한지 확인.";
  }
  if (/409|sha/i.test(msg)) {
    return "동시 편집 충돌(409). 새로고침 후 다시 저장해 주세요.";
  }
  return "저장 실패: " + msg;
}

/* ---------- Helpers exposed to admin pages ---------- */

export async function getAdminProjects() {
  await requireAuth();
  const { projects } = await readProjectsFresh();
  return projects;
}
