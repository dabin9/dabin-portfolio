"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import BlockEditor from "./BlockEditorLazy";
import type { BlockEditorHandle } from "./BlockEditor";
import ImageUpload from "./ImageUpload";
import type { Project } from "@/data/projects";
import { saveProjectAction } from "@/app/admin/actions";

type Props = {
  project?: Project;
  mode: "new" | "edit";
};

/**
 * ProjectForm — 작업물 메타 + 본문(BlockNote) 편집 폼.
 *
 * BlockNote 의 HTML 직렬화는 async — onChange 만 의존하면
 * 빠른 submit 에서 race 가 난다. 그래서 submit 직전에 명시적으로
 * editorRef.flushToInputs() 를 await 해서 최신 HTML 을 보장한다.
 */
export default function ProjectForm({ project, mode }: Props) {
  const editorRef = useRef<BlockEditorHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const linksValue = (project?.links ?? [])
    .map((l) => `${l.label} | ${l.href}`)
    .join("\n");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // 1) 에디터의 최신 상태를 hidden 인풋에 동기화
      await editorRef.current?.flushToInputs();
      // 2) 갱신된 인풋 값으로 FormData 수집 후 server action 호출
      const fd = new FormData(formRef.current!);
      await saveProjectAction(fd);
      // server action 이 redirect 하므로 여기 도달하지 않음
    } catch (err) {
      // server action 의 redirect 는 NEXT_REDIRECT throw — 정상 흐름이라 무시
      const msg = (err as Error)?.message || "";
      if (!msg.includes("NEXT_REDIRECT")) {
        alert("저장 실패: " + msg);
        setSubmitting(false);
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="제목" name="title" defaultValue={project?.title} required />
        <Field
          label={
            mode === "edit"
              ? "Slug (변경하면 새 페이지가 생기고 기존 URL 은 사라져요)"
              : "Slug (비우면 제목으로 자동 생성)"
          }
          name="slug"
          defaultValue={project?.slug}
        />
      </div>

      <Textarea label="요약" name="summary" rows={3} defaultValue={project?.summary} />

      <ImageUpload name="thumbnail" defaultValue={project?.thumbnail} />

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

      <div className="flex flex-wrap items-center gap-6">
        <Checkbox label="홈에 노출" name="featured" defaultChecked={project?.featured} />
        <Checkbox label="진행 중" name="ongoing" defaultChecked={project?.ongoing} />
      </div>

      <div>
        <p className="text-[13px] text-ink mb-2">본문</p>
        <BlockEditor ref={editorRef} initialBlocks={project?.bodyBlocks} />
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-line">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-bg px-5 py-2.5 rounded-md text-[13px] hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "저장 중…" : mode === "new" ? "추가" : "저장"}
        </button>
        <Link
          href="/admin/projects"
          className="text-[13px] text-inkMuted hover:text-ink"
        >
          취소
        </Link>
      </div>
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
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted">{props.label}</span>
      <input
        type="text"
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        required={props.required}
        placeholder={props.placeholder}
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
