import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/features/admin/lib/auth";
import { recordSecurityEvent } from "@/features/analytics/lib/visitLog";
import {
  playgroundItemFromForm,
  validatePlaygroundItem
} from "@/features/admin-playground/lib/playgroundFormMapper";
import { addPlaygroundItem } from "@/entities/playground/repository/playgroundRepository";
import { getRequestIp } from "@/shared/lib/requestIp";
import { formatStorageError } from "@/features/admin-projects/lib/projectFormMapper";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    await recordSecurityEvent({
      type: "unauthorized_api",
      ip: getRequestIp(req.headers),
      path: new URL(req.url).pathname,
      method: "POST",
      userAgent: req.headers.get("user-agent") || "",
      detail: "playground save without admin session"
    });
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const formData = await req.formData();
  const item = playgroundItemFromForm(formData);
  const error = validatePlaygroundItem(item);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await addPlaygroundItem(item, `admin: add playground "${item.title}"`);
  } catch (storageError) {
    return NextResponse.json(
      { error: formatStorageError(storageError) },
      { status: 500 }
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/playground");

  return NextResponse.json({
    ok: true,
    redirectTo: `/admin/playground?saved=${encodeURIComponent(item.id)}`
  });
}
