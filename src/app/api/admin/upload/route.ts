import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { put } from "@vercel/blob";
import { isLoggedIn } from "@/lib/auth";

// Vercel serverless 함수의 본문 한도(~4.5MB)를 넘기지 않도록 보수적으로 잡는다.
// 큰 이미지는 클라이언트가 @vercel/blob/client 로 직접 업로드하는 경로를 탄다.
const MAX = 4 * 1024 * 1024; // 4MB
const isVercel = !!process.env.VERCEL;

/**
 * 단일 이미지 업로드.
 * - Vercel: @vercel/blob 으로 public blob 저장 (BLOB_READ_WRITE_TOKEN 필요)
 * - 로컬 dev: public/uploads/ 에 파일로 저장 (fs)
 *
 * 응답: { url: string }
 *   BlockNote 의 uploadFile 콜백이 이 url 을 그대로 사용한다.
 */
export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json(
      { error: `파일이 너무 커요 (max ${MAX / 1024 / 1024}MB)` },
      { status: 413 }
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지만 업로드 가능" }, { status: 400 });
  }

  const ext = (file.type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "");
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const filename = `${stamp}-${rand}.${ext}`;

  if (isVercel) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN 미설정 — Vercel 의 Storage 메뉴에서 Blob 스토어를 만들어 주세요." },
        { status: 500 }
      );
    }
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type
    });
    return NextResponse.json({ url: blob.url });
  }

  // 로컬: public/uploads
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buf);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
