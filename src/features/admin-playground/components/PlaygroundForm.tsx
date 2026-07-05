"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { MediaOption, MediaType } from "@/entities/project/model/media";
import { Field, Textarea } from "@/features/admin-projects/components/ProjectForm/FormControls";
import {
  MediaPreview,
  MediaSelect
} from "@/features/admin-projects/components/ProjectForm/MediaFields";

type Props = {
  mediaOptions: MediaOption[];
};

export default function PlaygroundForm({ mediaOptions }: Props) {
  const [thumbnail, setThumbnail] = useState("");
  const [title, setTitle] = useState("Playground 제목");
  const [description, setDescription] = useState("짧은 설명이 여기에 표시됩니다.");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewType = useMemo<MediaType>(() => {
    const selected = mediaOptions.find((option) => option.url === thumbnail);
    if (selected) return selected.type;
    return /\.gif($|\?)/i.test(thumbnail) ? "gif" : "image";
  }, [mediaOptions, thumbnail]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("thumbnail", thumbnail.trim());
      const response = await fetch("/api/admin/playground/save", {
        method: "POST",
        body: formData
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || `저장 요청 실패 (${response.status})`);
      }

      window.location.href = data.redirectTo || "/admin/playground";
    } catch (error) {
      alert(error instanceof Error ? error.message : "저장에 실패했어요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div onInput={(event) => setTitle((event.target as HTMLInputElement).value)}>
            <Field
              label="제목"
              name="title"
              required
              placeholder="예: 인터랙션 실험실"
            />
          </div>
          <div onInput={(event) => setLink((event.target as HTMLInputElement).value)}>
            <Field
              label="링크"
              name="link"
              required
              placeholder="https://..."
            />
          </div>
        </div>

        <div
          onInput={(event) =>
            setDescription((event.target as HTMLTextAreaElement).value)
          }
        >
          <Textarea
            label="내용"
            name="description"
            rows={5}
            placeholder="메인에 노출될 설명을 입력해 주세요."
          />
        </div>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <MediaSelect
              label="썸네일 선택"
              value={thumbnail}
              options={mediaOptions}
              onChange={setThumbnail}
              description="public/playground 폴더의 GIF, WEBP, PNG, JPG 파일을 불러옵니다."
            />
            <label className="block">
              <span className="text-[12px] text-muted">썸네일 경로 직접 입력</span>
              <input
                type="text"
                value={thumbnail}
                onChange={(event) => setThumbnail(event.target.value)}
                placeholder="/playground/example.webp"
                className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2 text-[14px] focus:border-ink focus:outline-none"
              />
            </label>
            <input type="hidden" name="thumbnail" value={thumbnail} readOnly />
          </div>

          <MediaPreview
            url={thumbnail}
            type={previewType}
            alt={title || "Playground 썸네일 미리보기"}
          />
        </section>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-ink px-5 py-2.5 text-[13px] text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="font-mono text-[11px] uppercase text-muted">Preview</p>
        <a
          href={link || "#"}
          target={link.startsWith("http") ? "_blank" : undefined}
          rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
          className="group mt-3 block overflow-hidden border border-line bg-bg"
        >
          <MediaPreview
            url={thumbnail}
            type={previewType}
            alt={title || "Playground preview"}
          />
          <div className="p-4">
            <h2 className="font-display text-[22px] leading-tight text-ink group-hover:text-brand">
              {title || "Playground 제목"}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-inkMuted">
              {description || "짧은 설명이 여기에 표시됩니다."}
            </p>
          </div>
        </a>
      </aside>
    </form>
  );
}
