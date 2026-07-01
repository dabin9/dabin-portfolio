import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/features/admin/lib/auth";
import { getRequestIp } from "@/shared/lib/requestIp";
import { recordSecurityEvent } from "@/features/analytics/lib/visitLog";

/**
 * Vercel Blob 클라이언트 직접 업로드용 토큰 발급.
 *
 * 흐름:
 *   browser  --POST--> /api/admin/blob-token   (요청)
 *   browser  <-token-- /api/admin/blob-token   (응답)
 *   browser  ---PUT--> blob.vercel-storage     (실제 바이트 업로드, 함수 한도 우회)
 *
 * 환경변수: BLOB_READ_WRITE_TOKEN — Vercel Storage → Blob 만들면 자동 주입됨
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!(await isLoggedIn())) {
    await recordSecurityEvent({
      type: "unauthorized_api",
      ip: getRequestIp(req.headers),
      path: new URL(req.url).pathname,
      method: "POST",
      userAgent: req.headers.get("user-agent") || "",
      detail: "blob token without admin session"
    });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[blob-token] BLOB_READ_WRITE_TOKEN missing");
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN 미설정 — Vercel 대시보드의 Storage 메뉴에서 Blob 스토어를 만들고 재배포해 주세요."
      },
      { status: 500 }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif",
          "image/avif"
        ],
        addRandomSuffix: true,
        maximumSizeInBytes: 20 * 1024 * 1024 // 20MB
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("[blob-token] upload completed:", blob.pathname);
      }
    });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[blob-token] handleUpload threw:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
