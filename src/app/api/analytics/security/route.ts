import { NextResponse } from "next/server";
import { hasInternalAnalyticsToken } from "@/features/analytics/lib/internalAnalytics";
import { recordSecurityEvent, type SecurityEventType } from "@/features/analytics/lib/visitLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!hasInternalAnalyticsToken(req.headers)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    type?: SecurityEventType;
    ip?: string;
    path?: string;
    method?: string;
    userAgent?: string;
    detail?: string;
  };

  if (!isSecurityEventType(body.type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  await recordSecurityEvent({
    type: body.type,
    ip: body.ip || "unknown",
    path: body.path || "/",
    method: body.method || "GET",
    userAgent: body.userAgent || "",
    detail: body.detail || ""
  });

  return new NextResponse(null, { status: 204 });
}

function isSecurityEventType(value: unknown): value is SecurityEventType {
  return (
    value === "login_success" ||
    value === "login_failed" ||
    value === "unauthorized_admin" ||
    value === "unauthorized_api"
  );
}
