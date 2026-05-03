"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { uploadImage } from "@/lib/clientUpload";

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
  /** 표시 비율 (예: "16/10") */
  aspect?: string;
  /** true 면 작은 사이즈로 (admin 폼에서 가로 3열에 어울리게) */
  compact?: boolean;
};

/**
 * ImageUpload — 클릭 또는 드래그-드롭으로 이미지 업로드.
 * - /api/admin/upload 로 POST → URL 받아 hidden input + 미리보기 갱신
 * - 외부 URL 직접 붙여넣기도 가능 (텍스트 인풋)
 * - 비우기 버튼
 */
export default function ImageUpload({
  name,
  defaultValue = "",
  label = "썸네일",
  aspect = "16/10",
  compact = false
}: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const next = await uploadImage(file);
      setUrl(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  }

  return (
    <div>
      <p className="text-[12px] text-muted mb-1.5">{label}</p>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="relative cursor-pointer border border-dashed border-line rounded-xl bg-surface hover:border-ink transition overflow-hidden"
        style={{ aspectRatio: aspect }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className={"absolute inset-0 flex flex-col items-center justify-center text-center px-3 text-muted " + (compact ? "text-[11px]" : "text-[13px]")}>
            <span className={compact ? "text-[18px] mb-0.5" : "text-[26px] mb-1"}>⤴</span>
            <span>이미지 드롭 또는 클릭</span>
            {!compact ? (
              <span className="text-[11px] mt-1">JPG · PNG · WEBP · GIF (max 8MB)</span>
            ) : null}
          </div>
        )}
        {busy ? (
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm flex items-center justify-center text-bg text-[12px]">
            업로드 중…
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="또는 이미지 URL 붙여넣기"
          className="flex-1 bg-surface border border-line rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
        />
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-[12px] text-inkMuted hover:text-red-600 px-2 py-1"
          >
            비우기
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-[12px] text-red-600">{error}</p> : null}

      <input ref={fileRef} type="file" accept="image/*" onChange={onPick} hidden />
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
