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

  // 1) Vercel Blob 직접 업로드 (single-PUT — 가장 안정적)
  console.log("[upload] 1단계: Vercel Blob 직접 업로드 시도", { name: file.name, size: file.size, type: file.type });
  try {
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/blob-token",
      contentType: file.type
    });
    console.log("[upload] 1단계 성공:", blob.url);
    return blob.url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[upload] 1단계 실패:", msg, err);
    // fallback 으로 진행
  }

  // 2) 서버 라우트 fallback (dev / 작은 파일)
  console.log("[upload] 2단계: /api/admin/upload fallback 시도");
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
      console.error("[upload] 2단계 실패:", msg);
      if (res.status === 413) {
        throw new Error(
          `이미지가 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). Vercel Storage → Blob 스토어를 만들고 재배포하면 큰 이미지도 가능해집니다. /api/admin/diag 로 BLOB_READ_WRITE_TOKEN 설정 여부 확인하세요.`
        );
      }
      if (res.status === 401) {
        throw new Error("로그인이 만료됐습니다. /admin 에서 다시 로그인해 주세요.");
      }
      throw new Error(msg);
    }
    const { url } = (await res.json()) as { url: string };
    console.log("[upload] 2단계 성공:", url);
    return url;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(String(err));
  }
}
