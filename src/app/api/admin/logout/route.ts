import { NextResponse } from "next/server";
import { logout } from "@/features/admin/lib/auth";

export async function POST(req: Request) {
  await logout();
  const url = new URL(req.url);
  url.pathname = "/admin";
  url.search = "";
  return NextResponse.redirect(url, 303);
}
