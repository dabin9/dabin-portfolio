import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";

/**
 * 클라이언트가 Blob 으로 직접 업로드할 때 쓰는 토큰을 발급한다.
 *
 * 왜 필요한가?
 * - Vercel 의 일반 serverless 함수는 요청 본문이 4.5MB 로 제한된다.
 * - 이미지(특히 휴대폰 사진)는 4.5MB 를 쉽게 넘긴다 → 413 Content Too Large.
 * - @vercel/blob/client 의 upload() 는 클라이언트가 Blob 으로 바이트를 직접
 *   PUT 하므로 함수 본문 한도를 우회한다. 이 라우트는 그 흐름의 토큰 발급용.
 *
 * 환경변수: BLOB_READ_WRITE_TOKEN (Vercel Storage → Blob 만들면 자동 주입)
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN 미설정 — Vercel 의 Storage 메뉴에서 Blob 스토어를 만드세요."
      },
      { status: 500 }
    );
  }

  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
        addRandomSuffix: true,
        maximumSizeInBytes: 12 * 1024 * 1024 // 12MB
      }),
      onUploadCompleted: async () => {
        // 후처리 필요하면 여기에 (예: DB 기록). 지금은 noop.
      }
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
