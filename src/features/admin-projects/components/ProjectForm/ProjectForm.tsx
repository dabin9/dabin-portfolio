"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import type { Project, ProjectMediaItem } from "@/entities/project";
import type { MediaOption } from "@/entities/project/model/media";
import BlockEditor from "../BlockEditorLazy";
import type { BlockEditorHandle } from "../BlockEditor";
import TagInput from "../TagInput";
import { CaseNotesEditor, ResultItemsEditor } from "./ContentEditors";
import {
  Checkbox,
  DetailSectionLabel,
  EditableMetaItem,
  Field,
  InlineInput,
  RoleInputRow,
  Textarea
} from "./FormControls";
import {
  MediaPreview,
  MediaPreviewGrid,
  MediaSelect,
  MultiMediaSelect
} from "./MediaFields";
import WorkIndexPreview from "./WorkIndexPreview";
import type { PreviewProject } from "./types";
import {
  formChecked,
  formValue,
  getInitialCaseNotes,
  getInitialMediaItems,
  getInitialResultItems,
  normalizeMediaItems,
  parseList,
  withCurrentOption,
  withCurrentOptions
} from "./projectFormUtils";

type Props = {
  project?: Project;
  mode: "new" | "edit";
  /** 기존 태그 자동완성용 */
  allTags?: string[];
  mediaOptions?: MediaOption[];
};

/**
 * ProjectForm — 작업물 메타 + 본문 편집 폼.
 * 새 필드: altText, mediaItems, mediaUrl, mediaType, mediaAlt, tags, contribution, order, status
 */
export default function ProjectForm({
  project,
  mode,
  allTags = [],
  mediaOptions = []
}: Props) {
  const editorRef = useRef<BlockEditorHandle>(null);
  const caseEditorRefs = useRef<Record<string, BlockEditorHandle | null>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Project["status"]>(project?.status ?? "published");
  const [contribution, setContribution] = useState<number>(project?.contribution ?? 0);
  const [thumbnail, setThumbnail] = useState(project?.thumbnail ?? "");
  const [mediaItems, setMediaItems] = useState<ProjectMediaItem[]>(() =>
    getInitialMediaItems(project)
  );
  const [mediaAlt, setMediaAlt] = useState(() => {
    const initialMediaItems = getInitialMediaItems(project);
    return project?.mediaAlt ?? initialMediaItems[0]?.alt ?? project?.title ?? "";
  });
  const [year, setYear] = useState(project?.year ?? "");
  const [role, setRole] = useState(project?.role ?? "");
  const [company, setCompany] = useState(project?.company ?? "");
  const [preview, setPreview] = useState<PreviewProject>(() => ({
    title: project?.title || "프로젝트 제목",
    summary: project?.summary || "프로젝트 요약이 여기에 표시됩니다.",
    year: project?.year || "Year",
    role: project?.role || "Role",
    stack: project?.stack ?? [],
    tags: project?.tags ?? [],
    altText: project?.altText ?? "",
    ongoing: Boolean(project?.ongoing)
  }));

  const linksValue = (project?.links ?? [])
    .map((l) => `${l.label} | ${l.href}`)
    .join("\n");
  const initialCaseNotes = getInitialCaseNotes(project);
  const initialResultItems = getInitialResultItems(project);
  const normalizedMediaItems = normalizeMediaItems(
    mediaItems,
    mediaAlt || project?.title || ""
  );
  const primaryMedia = normalizedMediaItems[0];
  const mediaUrl = primaryMedia?.url ?? "";
  const mediaType = primaryMedia?.type ?? "image";
  const thumbnailOptions = withCurrentOption(
    mediaOptions.filter((option) => option.type === "image" || option.type === "gif"),
    thumbnail,
    "image",
    mediaAlt || project?.title || "현재 저장된 썸네일",
    "현재 저장된 썸네일"
  );
  const detailMediaOptions = withCurrentOptions(
    mediaOptions,
    normalizedMediaItems,
    "현재 저장된 미디어"
  );

  function onThumbnailChange(nextUrl: string) {
    setThumbnail(nextUrl);
  }

  function onMediaItemsChange(nextItems: ProjectMediaItem[]) {
    const currentPrimaryUrl = mediaItems[0]?.url;
    const nextPrimary = nextItems[0];
    setMediaItems(nextItems);
    if (!nextPrimary) {
      setMediaAlt(project?.title || "");
    } else if (nextPrimary.url !== currentPrimaryUrl) {
      setMediaAlt(nextPrimary.alt || project?.title || "");
    }
  }

  function syncPreviewFromForm(e?: FormEvent<HTMLFormElement>) {
    const form = formRef.current;
    if (!form) return;
    const target = e?.target;

    if (
      target instanceof HTMLInputElement &&
      ["year", "role", "company"].includes(target.name)
    ) {
      const peers = form.elements.namedItem(target.name);
      if (peers instanceof RadioNodeList) {
        for (const peer of Array.from(peers)) {
          if (
            peer instanceof HTMLInputElement &&
            peer !== target &&
            peer.value !== target.value
          ) {
            peer.value = target.value;
          }
        }
      }
    }

    setPreview((current) => ({
      ...current,
      title: formValue(form, "title") || "프로젝트 제목",
      summary: formValue(form, "summary") || "프로젝트 요약이 여기에 표시됩니다.",
      year: formValue(form, "year") || "Year",
      role: formValue(form, "role") || "Role",
      stack: parseList(formValue(form, "stack")),
      altText: formValue(form, "altText"),
      ongoing: formChecked(form, "ongoing")
    }));
  }

  function registerCaseEditor(key: string, handle: BlockEditorHandle | null) {
    if (handle) caseEditorRefs.current[key] = handle;
    else delete caseEditorRefs.current[key];
  }

  async function flushEditorsToInputs() {
    await Promise.all([
      editorRef.current?.flushToInputs(),
      ...Object.values(caseEditorRefs.current).map((editor) =>
        editor?.flushToInputs()
      )
    ]);
  }

  async function submit(intent: "draft" | "private" | "publish" | "save") {
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = formRef.current!;
      const nextStatus =
        intent === "save"
          ? status ?? "published"
          : intent === "publish"
            ? "published"
            : intent;

      await flushEditorsToInputs();
      const fd = new FormData(form);
      fd.set("status", nextStatus);
      const res = await fetch("/api/admin/projects/save", {
        method: "POST",
        body: fd
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `저장 요청 실패 (${res.status})`);
      }

      setStatus(nextStatus);
      window.location.href = data.redirectTo || "/admin/projects";
    } catch (err) {
      const msg = (err as Error)?.message || "";
      if (!msg.includes("NEXT_REDIRECT")) {
        alert(msg.startsWith("저장 실패:") ? msg : "저장 실패: " + msg);
        setSubmitting(false);
      }
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit("save");
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onInput={(e) => syncPreviewFromForm(e)}
      onChange={(e) => syncPreviewFromForm(e)}
      className="space-y-7"
    >
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="status" value={status ?? "published"} readOnly />
      <input type="hidden" name="thumbnail" value={thumbnail} />
      <input type="hidden" name="mediaItems" value={JSON.stringify(normalizedMediaItems)} />
      <input type="hidden" name="mediaUrl" value={mediaUrl} />
      <input type="hidden" name="mediaType" value={mediaType} />
      <input type="hidden" name="mediaAlt" value={mediaAlt} />
      <input type="hidden" name="hoverImage" value={mediaUrl} />
      <input type="hidden" name="summary" value={project?.summary ?? ""} />

      <WorkIndexPreview
        project={preview}
        thumbnail={thumbnail}
        index={1}
      />

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
        <Textarea
  label="기술 스택"
  name="stack"
  rows={3}
  defaultValue={(project?.stack ?? []).join(", ")}
  placeholder="예: HTML5, CSS3, JavaScript, PHP, GnuBoard, Swiper.js"
/>
      </div>

      <section className="grid gap-5 lg:grid-cols-2 items-start">
        <div className="space-y-3">
          <MediaSelect
            label="썸네일 이미지/GIF 선택"
            value={thumbnail}
            options={thumbnailOptions}
            onChange={onThumbnailChange}
            description="목록과 카드에서는 이 썸네일 이미지 또는 GIF를 사용합니다."
          />
          <MediaPreview
            url={thumbnail}
            type="image"
            alt={mediaAlt || project?.title || "썸네일 미리보기"}
          />
        </div>

        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5 items-start">
            <Field
              label="대체 글자 (썸네일 없을 때 카드 중앙 노출 · 최대 6자)"
              name="altText"
              defaultValue={project?.altText}
              placeholder="예: 'A.D.S' / '커머스'"
              maxLength={6}
            />
            <label className="block">
              <span className="text-[12px] text-muted">대표 미디어 대체 텍스트</span>
              <input
                type="text"
                value={mediaAlt}
                onChange={(e) => setMediaAlt(e.target.value)}
                placeholder="예: 벨포레 리조트 메인 인터랙션 화면"
                className="mt-1.5 w-full bg-surface border border-line rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-ink"
              />
              <p className="mt-1.5 text-[11px] text-muted">
                실제 이미지/영상 접근성 텍스트입니다. 카드용 대체 글자와 같은 값으로 강제하지 않습니다.
              </p>
            </label>
          </div>
          <p className="text-[11px] text-muted">
            썸네일이 없고 대체 글자가 있으면 목록/카드 중앙에 큰 글자로 표시됩니다.
          </p>
        </div>

        <div className="space-y-3">
          <MultiMediaSelect
            label="상세/인터랙션 미디어 선택"
            value={normalizedMediaItems}
            options={detailMediaOptions}
            onChange={onMediaItemsChange}
            description="상세 페이지에서 사용할 이미지, GIF, 영상 경로입니다. 여러 개를 선택하면 공개 화면에서 슬라이드로 표시됩니다."
          />
          <MediaPreviewGrid
            items={normalizedMediaItems}
            poster={thumbnail}
          />
        </div>

        <div>
          <dl className="mt-6 grid sm:grid-cols-3 gap-4 border-y border-line py-5">
            <EditableMetaItem label="Date">
              <InlineInput
                ariaLabel="Date"
                name="year"
                value={year}
                onValueChange={(value) => setYear(value)}
              />
            </EditableMetaItem>
            <EditableMetaItem label="Role">
              <InlineInput
                ariaLabel="Role"
                name="role"
                value={role}
                onValueChange={(value) => setRole(value)}
              />
            </EditableMetaItem>
            <EditableMetaItem label="Company">
              <InlineInput
                ariaLabel="Company"
                name="company"
                value={company}
                onValueChange={(value) => setCompany(value)}
              />
            </EditableMetaItem>
            
          </dl>
        </div>
      </section>

      <section className="mt-16 grid md:grid-cols-12 gap-8">
        <DetailSectionLabel title="Archive Notes" />
        <div className="md:col-span-9 max-w-[760px]">
          <BlockEditor
            ref={editorRef}
            initialBlocks={project?.bodyBlocks}
            initialHtml={project?.bodyHtml}
          />
        </div>
      </section>

      <section className="mt-14 grid md:grid-cols-12 gap-8">
        <DetailSectionLabel title="My Role" />
        <div className="md:col-span-9 max-w-[760px] space-y-3">
          <RoleInputRow label="Role">
            <InlineInput
              ariaLabel="Role"
              name="role"
              value={role}
              onValueChange={(value) => setRole(value)}
            />
          </RoleInputRow>
          <RoleInputRow label="Company">
            <InlineInput
              ariaLabel="Company"
              name="company"
              value={company}
              onValueChange={(value) => setCompany(value)}
            />
          </RoleInputRow>
          <RoleInputRow label="Focus">
            <TagInput
              name="tags"
              defaultValue={project?.tags ?? []}
              suggestions={allTags}
              label="Focus / Tags"
              onChange={(tags) => setPreview((current) => ({ ...current, tags }))}
            />
          </RoleInputRow>
          <RoleInputRow label="Contribution">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-muted">Contribution</span>
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
          </RoleInputRow>
        </div>
      </section>

      <CaseNotesEditor
        defaultItems={initialCaseNotes}
        contribution={contribution}
        registerEditor={registerCaseEditor}
      />

      <ResultItemsEditor
        defaultItems={initialResultItems}
        registerEditor={registerCaseEditor}
      />

      <Textarea
        label="외부 링크 (URL 또는 라벨 | URL — 한 줄에 하나)"
        name="links"
        rows={3}
        defaultValue={linksValue}
        placeholder={"https://example.com\nCase study | https://..."}
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
        <code className="font-mono text-ink">{status ?? "published"}</code> · 발행하기 = published · 비공개 = private (URL 알아도 접근 못 봄) · 임시저장 = draft
      </p>
    </form>
  );
}

