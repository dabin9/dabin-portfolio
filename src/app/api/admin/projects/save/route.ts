import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { getRequestIp } from "@/lib/requestIp";
import { recordSecurityEvent } from "@/lib/visitLog";
import { upsertProject } from "@/lib/storage";
import { formatStorageError, projectFromForm } from "@/lib/adminProjectForm";
import type { ProjectBlock } from "@/data/projects";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    await recordSecurityEvent({
      type: "unauthorized_api",
      ip: getRequestIp(req.headers),
      path: new URL(req.url).pathname,
      method: "POST",
      userAgent: req.headers.get("user-agent") || "",
      detail: "project save without admin session"
    });
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const formData = await req.formData();
  const blocksRaw = String(formData.get("blocks") || "[]");
  let blocks: ProjectBlock[] = [];

  try {
    blocks = JSON.parse(blocksRaw) as ProjectBlock[];
  } catch {
    blocks = [];
  }

  const project = projectFromForm(
    formData,
    blocks,
    String(formData.get("blocksHtml") || "")
  );

  if (!project.title) {
    return NextResponse.json({ error: "제목이 비어있어요." }, { status: 400 });
  }
  if (!project.slug) {
    return NextResponse.json(
      { error: "Slug 를 입력하거나 제목을 영문/한글로 적어주세요." },
      { status: 400 }
    );
  }

  try {
    await upsertProject(project, `admin: save project "${project.slug}"`);
  } catch (e) {
    return NextResponse.json({ error: formatStorageError(e) }, { status: 500 });
  }

  revalidatePath("/", "layout");
  revalidatePath(`/work/${project.slug}`);
  revalidatePath("/work");

  return NextResponse.json({
    ok: true,
    redirectTo: `/admin/projects?saved=${encodeURIComponent(project.slug)}`
  });
}
