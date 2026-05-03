"use client";

import { upload } from "@vercel/blob/client";

/**
 * 어디서 호출해도 동작하는 단일 이미지 업로드 함수.
 *
 *  1. 먼저 @vercel/blob/client 로 Blob 직접 업로드를 시도 → 함수 본문 4.5MB 한도 우회
 *  2. 실패하면 (= dev 환경 또는 Blob 미설정) /api/admin/upload 로 fallback (fs)
 *
 * BlockNote uploadFile, ImageUpload 위젯이 모두 이걸 쓴다.
 */
export async function uploadImage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "img";
  const pathname = `uploads/${Date.now().toString(36)}-${safeName}`;

  // 1) 클라이언트 직접 업로드 (prod 경로)
  try {
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/blob-token",
      contentType: file.type
    });
    return blob.url;
  } catch (err) {
    // 2) dev 또는 Blob 미설정 — 서버 라우트로 fallback
    if (process.env.NODE_ENV === "production") {
      // prod 인데 Blob 직접 업로드가 실패했으면 원인 노출
      console.warn("Blob direct upload failed, falling back to server route", err);
    }
  }

  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || `업로드 실패 (${res.status})`);
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}
