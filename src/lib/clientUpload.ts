"use client";

import { upload } from "@vercel/blob/client";

/**
 * 단일 이미지 업로드.
 *
 * 두 경로 시도:
 *  1) @vercel/blob/client 의 upload() — 클라이언트가 Blob 스토어에 직접 PUT
 *     (multipart 모드로 큰 파일도 안전하게 분할 업로드)
 *  2) 실패 시 /api/admin/upload — dev fs 또는 작은 파일용 fallback
 *
 * 에러는 모두 console 에 자세히 찍고, 마지막에 사용자에게 보여줄 메시지를 throw 한다.
 */
export async function uploadImage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "img";
  const pathname = `uploads/${Date.now().toString(36)}-${safeName}`;

  // 1) Vercel Blob 직접 업로드
  try {
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/blob-token",
      contentType: file.type,
      multipart: true // 큰 파일도 분할 업로드로 안전
    });
    return blob.url;
  } catch (err) {
    console.error("[upload] Vercel Blob 직접 업로드 실패:", err);
    // fallback 으로 진행
  }

  // 2) 서버 라우트 fallback (dev / 작은 파일)
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      const msg = j.error || `${res.status} ${res.statusText}`;
      console.error("[upload] /api/admin/upload 실패:", msg);
      if (res.status === 413) {
        throw new Error(
          "이미지가 너무 커요. Vercel 의 Storage → Blob 스토어를 만들어 BLOB_READ_WRITE_TOKEN 을 설정해 주세요 (4MB 이상도 업로드 가능해집니다)."
        );
      }
      throw new Error(msg);
    }
    const { url } = (await res.json()) as { url: string };
    return url;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(String(err));
  }
}
