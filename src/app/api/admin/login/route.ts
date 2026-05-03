import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";
  let password = "";
  let next = "/admin/projects";

  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const form = await req.formData();
    password = String(form.get("password") || "");
    next = String(form.get("next") || next);
  } else {
    const body = (await req.json().catch(() => ({}))) as { password?: string; next?: string };
    password = body.password || "";
    next = body.next || next;
  }

  const ok = await login(password);
  const url = new URL(req.url);
  if (!ok) {
    url.pathname = "/admin";
    url.searchParams.set("error", "invalid");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }
  url.pathname = next;
  url.search = "";
  return NextResponse.redirect(url, 303);
}
