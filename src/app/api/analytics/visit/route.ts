import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_IP_COOKIE } from "@/lib/auth";
import { getRequestIp } from "@/lib/requestIp";
import { recordVisit } from "@/lib/visitLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getRequestIp(req.headers);
  if (!ip) return new NextResponse(null, { status: 204 });

  const cookieStore = await cookies();
  const adminIp = cookieStore.get(ADMIN_IP_COOKIE)?.value || "";
  if (cookieStore.get(ADMIN_COOKIE)?.value || adminIp === ip) {
    return new NextResponse(null, { status: 204 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    path?: string;
    referrer?: string;
  };
  const path = body.path || "/";
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return new NextResponse(null, { status: 204 });
  }

  await recordVisit({
    ip,
    path,
    referrer: body.referrer || req.headers.get("referer") || "",
    userAgent: req.headers.get("user-agent") || ""
  });

  return new NextResponse(null, { status: 204 });
}
