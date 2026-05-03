import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";

/**
 * 환경 진단 엔드포인트.
 * /api/admin/diag 를 admin 로그인 상태에서 열면, env 가 어떤 게 빠졌는지 한눈에.
 *
 * 비밀번호/토큰 값 자체는 노출하지 않고 boolean 과 prefix 만 보여줌.
 */
export async function GET() {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const blob = process.env.BLOB_READ_WRITE_TOKEN || "";
  const gh = process.env.GITHUB_TOKEN || "";

  return NextResponse.json({
    env: {
      VERCEL: process.env.VERCEL ?? null,
      NODE_ENV: process.env.NODE_ENV ?? null,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      ADMIN_SECRET: !!process.env.ADMIN_SECRET,
      BLOB_READ_WRITE_TOKEN: blob ? `set (prefix: ${blob.slice(0, 12)}…, len ${blob.length})` : "MISSING",
      GITHUB_TOKEN: gh ? `set (prefix: ${gh.slice(0, 8)}…, len ${gh.length})` : "MISSING",
      GITHUB_OWNER: process.env.GITHUB_OWNER || "MISSING",
      GITHUB_REPO: process.env.GITHUB_REPO || "MISSING",
      GITHUB_BRANCH: process.env.GITHUB_BRANCH || "main (default)"
    },
    expected: {
      uploadFlow:
        "이미지 업로드 = Vercel Blob 직접 PUT. BLOB_READ_WRITE_TOKEN 가 있어야 작동. fallback /api/admin/upload 는 4MB 제한.",
      saveFlow:
        "작업물 저장 = GitHub Contents API commit. GITHUB_TOKEN/OWNER/REPO 셋 다 필요. 저장 후 Vercel 자동 재배포."
    }
  });
}
