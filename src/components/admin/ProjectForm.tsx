"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import BlockEditor from "./BlockEditorLazy";
import type { BlockEditorHandle } from "./BlockEditor";
import ImageUpload from "./ImageUpload";
import TagInput from "./TagInput";
import type { Project } from "@/data/projects";
import { saveProjectAction } from "@/app/admin/actions";

type Props = {
  project?: Project;
  mode: "new" | "edit";
  /** 기존 태그 자동완성용 */
  allTags?: string[];
};

/**
 * ProjectForm — 작업물 메타 + 본문 편집 폼.
 * 새 필드: altText, hoverImage, tags, contribution, order, status
 */
export default function ProjectForm({ project, mode, allTags = [] }: Props) {
  const editorRef = useRef<BlockEditorHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [contribution, setContribution] = useState<number>(project?.contribution ?? 0);

  const linksValue = (project?.links ?? [])
    .map((l) => `${l.label} | ${l.href}`)
    .join("\n");

  async function submit(intent: "draft" | "private" | "publish" | "save") {
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = formRef.current!;
      // intent → status hidden 인풋 갱신
      const statusInput = form.elements.namedItem("status") as HTMLInputElement;
      if (intent === "draft") statusInput.value = "draft";
      else if (intent === "private") statusInput.value = "private";
      else if (intent === "publish") statusInput.value = "published";
      // intent === "save" : 기존 status 유지 (편집 시)

      await editorRef.current?.flushToInputs();
      const fd = new FormData(form);
      await saveProjectAction(fd);
    } catch (err) {
      const msg = (err as Error)?.message || "";
      if (!msg.includes("NEXT_REDIRECT")) {
        alert("저장 실패: " + msg);
        setSubmitting(false);
      }
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit("save");
  }

  const initialStatus = project?.status ?? "published";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-7">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="status" defaultValue={initialStatus} />

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="제목" name="title" defaultValue={project?.title} required />
        <Field
          label={
            mode === "edit"
              ? "Slug (변경 시 새 URL 생성, 기존은 사라짐)"
              : "Slug (비우면 제목으로 자동 생성)"
          }
          name="slug"
          defaultValue={project?.slug}
        />
      </div>

      <Textarea label="요약" name="summary" rows={2} defaultValue={project?.summary} />

      {/* 썸네일 + 호버 이미지 + 대체 글자 — 가로 3열 */}
      <div className="grid md:grid-cols-3 gap-5 items-start">
        <ImageUpload
          name="thumbnail"
          defaultValue={project?.thumbnail}
          label="썸네일"
          aspect="4/3"
          compact
        />
        <ImageUpload
          name="hoverImage"
          defaultValue={project?.hoverImage}
          label="마우스오버 이미지 (gif·webp 가능)"
          aspect="4/3"
          compact
        />
        <div>
          <Field
            label="대체 글자 (썸네일 없을 때 카드 중앙 노출 · 최대 6자)"
            name="altText"
            defaultValue={project?.altText}
            placeholder="예: 'A.D.S' / '커머스'"
            maxLength={6}
          />
          <p className="mt-1.5 text-[11px] text-muted">
            썸네일이 없고 이 값이 있으면 큰 글자로 표시됩니다.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Field label="연도" name="year" defaultValue={project?.year} />
        <Field label="역할" name="role" defaultValue={project?.role} />
        <Field label="근무처" name="company" defaultValue={project?.company} />
      </div>

      <Textarea
        label="기술 스택 (콤마 또는 줄바꿈)"
        name="stack"
        rows={2}
        defaultValue={(project?.stack ?? []).join(", ")}
      />

      <TagInput
        name="tags"
        defaultValue={project?.tags ?? []}
        suggestions={allTags}
      />

      {/* 기여도 0~100 */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] text-muted">기여도</span>
          <span className="text-[14px] tabular-nums font-mono text-ink">
            {contribution}%
          </span>
        </div>
        <input
          type="range"
          name="contribution"
          min={0}
          max={100}
          step={5}
          value={contribution}
          onChange={(e) => setContribution(Number(e.target.value))}
          className="w-full mt-2 accent-ink cursor-pointer"
        />
      </div>

      <Textarea
        label="하이라이트 (한 줄에 하나)"
        name="highlights"
        rows={4}
        defaultValue={(project?.highlights ?? []).join("\n")}
      />
      <Textarea
        label="외부 링크 (라벨 | URL — 한 줄에 하나)"
        name="links"
        rows={3}
        defaultValue={linksValue}
        placeholder={"Live | https://example.com\nCase study | https://..."}
      />

      <div className="grid md:grid-cols-2 gap-5">
        <Field
          label="순서 (클수록 앞으로 — 작은 숫자가 뒤로 / 최신이 앞)"
          name="order"
          type="number"
          defaultValue={project?.order != null ? String(project.order) : ""}
          placeholder="예: 100, 90, 80..."
        />
        <div className="flex flex-wrap items-center gap-6 pt-6">
          <Checkbox label="홈에 노출" name="featured" defaultChecked={project?.featured} />
          <Checkbox label="진행 중" name="ongoing" defaultChecked={project?.ongoing} />
        </div>
      </div>

      <div>
        <p className="text-[13px] text-ink mb-2">본문</p>
        <BlockEditor ref={editorRef} initialBlocks={project?.bodyBlocks} />
      </div>

      {/* 액션 버튼들 — 임시저장 / 비공개 / 발행 / 취소 */}
      <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-line">
        <button
          type="button"
          onClick={() => submit("publish")}
          disabled={submitting}
          className="bg-ink text-bg px-5 py-2.5 rounded-md text-[13px] hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "저장 중…" : "발행하기"}
        </button>
        <button
          type="button"
          onClick={() => submit("private")}
          disabled={submitting}
          className="border border-line text-ink px-5 py-2.5 rounded-md text-[13px] hover:border-ink transition disabled:opacity-50"
        >
          비공개 저장
        </button>
        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={submitting}
          className="border border-line text-inkMuted px-5 py-2.5 rounded-md text-[13px] hover:border-ink hover:text-ink transition disabled:opacity-50"
        >
          임시저장
        </button>
        <Link
          href="/admin/projects"
          className="ml-auto text-[13px] text-inkMuted hover:text-ink"
        >
          취소
        </Link>
      </div>

      <p className="text-[11px] text-muted -mt-2">
        현재 상태:{" "}
        <code className="font-mono text-ink">{initialStatus}</code> · 발행하기 = published · 비공개 = private (URL 알아도 접근 못 봄) · 임시저장 = draft
      </p>
    </form>
  );
}

/* ---------- inputs ---------- */

function Field(props: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted">{props.label}</span>
      <input
        type={props.type ?? "text"}
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        required={props.required}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        className="mt-1.5 w-full bg-surface border border-line rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-ink"
      />
    </label>
  );
}

function Textarea(props: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted">{props.label}</span>
      <textarea
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        rows={props.rows ?? 3}
        placeholder={props.placeholder}
        className="mt-1.5 w-full bg-surface border border-line rounded-md px-3 py-2 text-[14px] leading-[1.7] focus:outline-none focus:border-ink resize-y"
      />
    </label>
  );
}

function Checkbox(props: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
      <input
        type="checkbox"
        name={props.name}
        defaultChecked={!!props.defaultChecked}
        className="w-4 h-4 accent-ink"
      />
      {props.label}
    </label>
  );
}
