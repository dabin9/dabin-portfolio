import { NextResponse } from "next/server";
import { login } from "@/features/admin/lib/auth";
import { getRequestIp } from "@/shared/lib/requestIp";
import { recordSecurityEvent } from "@/features/analytics/lib/visitLog";

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

  const ip = getRequestIp(req.headers);
  const ok = await login(password, ip);
  const url = new URL(req.url);
  if (!ok) {
    await recordSecurityEvent({
      type: "login_failed",
      ip,
      path: "/admin",
      method: "POST",
      userAgent: req.headers.get("user-agent") || "",
      detail: "invalid password"
    });
    url.pathname = "/admin";
    url.searchParams.set("error", "invalid");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }
  await recordSecurityEvent({
    type: "login_success",
    ip,
    path: "/admin",
    method: "POST",
    userAgent: req.headers.get("user-agent") || "",
    detail: "admin login"
  });
  url.pathname = next;
  url.search = "";
  return NextResponse.redirect(url, 303);
}
