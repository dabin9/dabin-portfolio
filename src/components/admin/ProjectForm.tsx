"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import BlockEditor from "./BlockEditorLazy";
import type { BlockEditorHandle } from "./BlockEditor";
import TagInput from "./TagInput";
import type { Project, ProjectCaseNote, ProjectMediaItem } from "@/data/projects";
import type { MediaOption, MediaType } from "@/data/media";
import WorkCardMedia from "@/components/WorkCardMedia";

type Props = {
  project?: Project;
  mode: "new" | "edit";
  /** 기존 태그 자동완성용 */
  allTags?: string[];
  mediaOptions?: MediaOption[];
};

type PreviewProject = {
  title: string;
  summary: string;
  year: string;
  role: string;
  stack: string[];
  tags: string[];
  altText: string;
  ongoing: boolean;
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

function normalizeMediaType(value?: string): MediaType {
  if (value === "image" || value === "gif" || value === "video") return value;
  return "image";
}

function getInitialCaseNotes(project?: Project): ProjectCaseNote[] {
  if (project?.caseNotes && project.caseNotes.length > 0) return project.caseNotes;

  const legacy = project?.highlights ?? [];
  if (legacy.length > 0) {
    return legacy.slice(0, 3).map((item) => ({
      issueTitle: "",
      problem: project?.summary || "",
      approach: item,
      result:
        typeof project?.contribution === "number"
          ? `${project.contribution}% 기여 범위에서 구현과 정리를 완료한 항목입니다.`
          : "구현 기록으로 남긴 항목입니다."
    }));
  }

  return [{ issueTitle: "", problem: "", approach: "", result: "" }];
}

function getInitialResultItems(project?: Project): string[] {
  if (project?.resultItems && project.resultItems.length > 0) return project.resultItems;
  const legacy = project?.highlights ?? [];
  if (legacy.length > 3) return legacy.slice(3);
  if (legacy.length > 0 && !project?.caseNotes?.length) return [];
  return [""];
}

function getInitialMediaItems(project?: Project): ProjectMediaItem[] {
  const items = (project?.mediaItems ?? [])
    .map((item) => ({
      url: item.url?.trim() ?? "",
      type: normalizeMediaType(item.type),
      alt: item.alt?.trim() || undefined
    }))
    .filter((item) => item.url);

  if (items.length > 0) return items;

  const legacyUrl = project?.mediaUrl || project?.hoverImage || "";
  if (!legacyUrl) return [];

  return [
    {
      url: legacyUrl,
      type: normalizeMediaType(project?.mediaType),
      alt: project?.mediaAlt || project?.title
    }
  ];
}

function normalizeMediaItems(
  items: ProjectMediaItem[],
  primaryAlt: string
): ProjectMediaItem[] {
  const seen = new Set<string>();
  return items
    .map((item, index) => ({
      url: item.url?.trim() ?? "",
      type: normalizeMediaType(item.type),
      alt: (index === 0 ? primaryAlt : item.alt)?.trim() || item.url
    }))
    .filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
}

function fieldInitialHtml(html?: string, text?: string): string {
  if (html?.trim()) return html;
  const value = text?.trim();
  if (!value) return "";
  if (isStoredBlockHtml(value)) return value;

  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line))) {
    return `<ul>${lines
      .map((line) => `<li>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</li>`)
      .join("")}</ul>`;
  }

  return value
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function isStoredBlockHtml(value: string): boolean {
  return (
    /<[^>]+>/.test(value) &&
    (value.includes("bn-block") ||
      value.includes("data-node-type") ||
      /^<(div|p|ul|ol|li|h[1-6]|blockquote)\b/i.test(value))
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function DetailSectionLabel({ title }: { title: string }) {
  return (
    <div className="md:col-span-3">
      <p className="font-mono text-[12px] uppercase text-muted">{title}</p>
    </div>
  );
}

function EditableMetaItem({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function RoleInputRow({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-line pt-3">
      <p className="mb-2 font-mono text-[11px] uppercase text-muted">{label}</p>
      {children}
    </div>
  );
}

function CaseNotesEditor({
  defaultItems,
  contribution,
  registerEditor
}: {
  defaultItems: ProjectCaseNote[];
  contribution: number;
  registerEditor: (key: string, handle: BlockEditorHandle | null) => void;
}) {
  const [items, setItems] = useState<ProjectCaseNote[]>(
    defaultItems.length > 0
      ? defaultItems
      : [{ issueTitle: "", problem: "", approach: "", result: "" }]
  );

  function addItem() {
    setItems((current) => [
      ...current,
      { issueTitle: "", problem: "", approach: "", result: "" }
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  return (
    <section className="mt-14 grid md:grid-cols-12 gap-8">
      <DetailSectionLabel title="Case Notes" />
      <div className="md:col-span-9 space-y-5">
        {items.map((item, idx) => (
          <div key={idx} className="border-t border-line pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[12px] uppercase text-muted">
                Case {String(idx + 1).padStart(2, "0")}
              </p>
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[12px] text-red-600 hover:underline underline-offset-4"
                >
                  삭제
                </button>
              ) : null}
            </div>
            <dl className="mt-3 space-y-3 text-[15px] md:text-[16px] leading-8">
              <CaseInputRow label="고민했던 부분">
                <div className="space-y-3">
                  <div>
                    <span className="mb-1 block font-mono text-[11px] uppercase text-muted">
                      타이틀
                    </span>
                    <BlockEditor
                      ref={(handle) => registerEditor(`case-${idx}-issue-title`, handle)}
                      blocksFieldName="caseIssueTitleBlocks"
                      htmlFieldName="caseIssueTitleHtml"
                      initialHtml={fieldInitialHtml(item.issueTitleHtml, item.issueTitle)}
                      compact
                      hideHelp
                    />
                  </div>
                  <div className="border-t border-line pt-3">
                    <span className="mb-1 block font-mono text-[11px] uppercase text-muted">
                      이슈사항
                    </span>
                    <BlockEditor
                      ref={(handle) => registerEditor(`case-${idx}-problem`, handle)}
                      blocksFieldName="caseProblemBlocks"
                      htmlFieldName="caseProblemHtml"
                      initialHtml={fieldInitialHtml(item.problemHtml, item.problem)}
                      compact
                      hideHelp
                    />
                  </div>
                </div>
              </CaseInputRow>
              <CaseInputRow label="시도 방안">
                <BlockEditor
                  ref={(handle) => registerEditor(`case-${idx}-approach`, handle)}
                  blocksFieldName="caseApproachBlocks"
                  htmlFieldName="caseApproachHtml"
                  initialHtml={fieldInitialHtml(item.approachHtml, item.approach)}
                  compact
                  hideHelp
                />
              </CaseInputRow>
              <CaseInputRow label="결과">
                <BlockEditor
                  ref={(handle) => registerEditor(`case-${idx}-result`, handle)}
                  blocksFieldName="caseResultBlocks"
                  htmlFieldName="caseResultHtml"
                  initialHtml={fieldInitialHtml(
                    item.resultHtml,
                    item.result ||
                      `${contribution}% 기여 범위에서 구현과 정리를 완료한 항목입니다.`
                  )}
                  compact
                  hideHelp
                />
              </CaseInputRow>
            </dl>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="border border-line px-3 py-2 text-[12px] text-inkMuted hover:border-ink hover:text-ink transition"
        >
          + Case 추가
        </button>
      </div>
    </section>
  );
}

function CaseInputRow({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-[96px_1fr] gap-1 md:gap-4">
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ResultItemsEditor({
  defaultItems,
  registerEditor
}: {
  defaultItems: string[];
  registerEditor: (key: string, handle: BlockEditorHandle | null) => void;
}) {
  const [items, setItems] = useState<string[]>(
    defaultItems.length > 0 ? defaultItems : [""]
  );

  function addItem() {
    setItems((current) => [...current, ""]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  return (
    <section className="mt-14 grid md:grid-cols-12 gap-8">
      <DetailSectionLabel title="Result" />
      <div className="md:col-span-9 space-y-5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[auto_1fr_auto] gap-5 items-start border-t border-line pt-5"
          >
            <span className="font-mono text-[13px] text-brand tabular-nums">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="w-full min-w-0">
              <BlockEditor
                ref={(handle) => registerEditor(`result-${idx}`, handle)}
                htmlFieldName="resultItems"
                blocksFieldName="resultBlocks"
                initialHtml={fieldInitialHtml(undefined, item)}
                compact
                hideHelp
              />
            </div>
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-[12px] text-red-600 hover:underline underline-offset-4"
              >
                삭제
              </button>
            ) : null}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="border border-line px-3 py-2 text-[12px] text-inkMuted hover:border-ink hover:text-ink transition"
        >
          + Result 추가
        </button>
      </div>
    </section>
  );
}

function InlineInput(props: {
  ariaLabel: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      aria-label={props.ariaLabel}
      type="text"
      name={props.name}
      value={props.value}
      defaultValue={props.value === undefined ? props.defaultValue ?? "" : undefined}
      onChange={(e) => props.onValueChange?.(e.target.value)}
      placeholder={props.placeholder}
      className="w-full bg-transparent border-0 border-b border-line px-0 py-1.5 text-[14px] leading-6 text-ink focus:outline-none focus:border-ink"
    />
  );
}

function InlineTextarea(props: {
  ariaLabel: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      aria-label={props.ariaLabel}
      name={props.name}
      defaultValue={props.defaultValue ?? ""}
      rows={props.rows ?? 3}
      placeholder={props.placeholder}
      className="w-full resize-y bg-transparent border-0 border-b border-line px-0 py-1.5 text-[15px] leading-7 text-ink placeholder:text-muted focus:outline-none focus:border-ink"
    />
  );
}

function WorkIndexPreview({
  project,
  thumbnail,
  index
}: {
  project: PreviewProject;
  thumbnail: string;
  index: number;
}) {
  return (
    <section className="border-y border-line py-5" aria-label="공개 목록 표시 미리보기">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase text-muted">
            Works Index Preview
          </p>
          <p className="mt-1 text-[12px] text-inkMuted">
            공개 프로젝트 목록에서 보이는 형식과 동일합니다.
          </p>
        </div>
        <span className="font-mono text-[11px] uppercase text-muted">Preview</span>
      </div>

      <div className="group mt-4 grid md:grid-cols-12 gap-5 md:gap-8 py-5 items-start">
        <span className="md:col-span-1 font-mono text-[13px] text-muted tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
        <div className="md:col-span-3">
          <WorkCardMedia
            thumbnail={thumbnail}
            altText={project.altText}
            ongoing={project.ongoing}
          />
        </div>
        <div className="md:col-span-4">
          <h2 className="font-display text-2xl md:text-3xl leading-tight text-ink group-hover:text-brand">
            {project.title}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-inkMuted">
            {project.summary}
          </p>
        </div>
        <div className="md:col-span-3 text-[13px] md:text-[14px] leading-7 text-inkMuted">
          <p>{project.stack.length > 0 ? project.stack.join(" · ") : "Stack"}</p>
          <p className="mt-2 font-mono text-[12px] uppercase text-muted">
            {project.year} / {project.role}
          </p>
          {project.tags.length > 0 ? (
            <p className="mt-2 text-[12px] text-muted">
              {project.tags.join(" / ")}
            </p>
          ) : null}
        </div>
        <span
          aria-hidden
          className="md:col-span-1 md:justify-self-end font-mono text-[13px] text-muted group-hover:text-ink"
        >
          Open
        </span>
      </div>
    </section>
  );
}

function formValue(form: HTMLFormElement, name: string): string {
  const item = form.elements.namedItem(name);
  if (!item) return "";
  if (item instanceof RadioNodeList) return String(item.value ?? "");
  if (item instanceof HTMLInputElement || item instanceof HTMLTextAreaElement) {
    return item.value;
  }
  return "";
}

function formChecked(form: HTMLFormElement, name: string): boolean {
  const item = form.elements.namedItem(name);
  return item instanceof HTMLInputElement ? item.checked : false;
}

function parseList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function withCurrentOption(
  options: MediaOption[],
  currentUrl: string,
  currentType: MediaType,
  currentAlt: string,
  currentLabel: string
): MediaOption[] {
  if (!currentUrl || options.some((option) => option.url === currentUrl)) return options;
  return [
    {
      label: currentLabel,
      url: currentUrl,
      type: currentType,
      alt: currentAlt
    },
    ...options
  ];
}

function withCurrentOptions(
  options: MediaOption[],
  currentItems: ProjectMediaItem[],
  currentLabel: string
): MediaOption[] {
  const urls = new Set(options.map((option) => option.url));
  const missing = currentItems
    .filter((item) => item.url && !urls.has(item.url))
    .map((item, index) => ({
      label: currentItems.length > 1 ? `${currentLabel} ${index + 1}` : currentLabel,
      url: item.url,
      type: normalizeMediaType(item.type),
      alt: item.alt || currentLabel
    }));

  return [...missing, ...options];
}

function MediaSelect(props: {
  label: string;
  value: string;
  options: MediaOption[];
  onChange: (value: string) => void;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = props.options.find((option) => option.url === props.value);
  const selectedLabel = selected
    ? `${selected.label} · ${selected.type} · ${selected.url}`
    : "선택 안 함";

  function choose(value: string) {
    props.onChange(value);
    setOpen(false);
  }

  return (
    <div
      className="block"
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span className="text-[12px] text-muted">{props.label}</span>
      <div className="relative mt-1.5">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 bg-surface border border-line rounded-md px-3 py-2 text-left text-[14px] focus:outline-none focus:border-ink"
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <span aria-hidden className="shrink-0 text-muted">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="listbox"
            aria-label={props.label}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-bg shadow-lg"
          >
            <button
              type="button"
              role="option"
              aria-selected={!props.value}
              onClick={() => choose("")}
              className={
                "block w-full px-3 py-2 text-left text-[13px] hover:bg-surface " +
                (!props.value ? "bg-surface text-ink" : "text-inkMuted")
              }
            >
              선택 안 함
            </button>
            {props.options.map((option) => {
              const isSelected = option.url === props.value;
              return (
                <button
                  key={`${option.type}:${option.url}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option.url)}
                  className={
                    "block w-full px-3 py-2 text-left hover:bg-surface " +
                    (isSelected ? "bg-surface" : "")
                  }
                >
                  <span className="block text-[13px] text-ink">{option.label}</span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
                    {option.type} · {option.url}
                  </span>
                </button>
              );
            })}
            {props.options.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-muted">
                public/media 폴더에 등록된 파일이 없습니다.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {props.description ? (
        <p className="mt-1.5 text-[11px] text-muted">{props.description}</p>
      ) : null}
    </div>
  );
}

function MultiMediaSelect(props: {
  label: string;
  value: ProjectMediaItem[];
  options: MediaOption[];
  onChange: (value: ProjectMediaItem[]) => void;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedUrls = new Set(props.value.map((item) => item.url));
  const selectedLabel =
    props.value.length > 0 ? `${props.value.length}개 선택됨` : "선택 안 함";

  function toggle(option: MediaOption) {
    if (selectedUrls.has(option.url)) {
      props.onChange(props.value.filter((item) => item.url !== option.url));
      return;
    }

    props.onChange([
      ...props.value,
      {
        url: option.url,
        type: option.type,
        alt: option.alt
      }
    ]);
  }

  function remove(url: string) {
    props.onChange(props.value.filter((item) => item.url !== url));
  }

  return (
    <div
      className="block"
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span className="text-[12px] text-muted">{props.label}</span>
      <div className="relative mt-1.5">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 bg-surface border border-line rounded-md px-3 py-2 text-left text-[14px] focus:outline-none focus:border-ink"
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <span aria-hidden className="shrink-0 text-muted">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="listbox"
            aria-label={props.label}
            className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-line bg-bg shadow-lg"
          >
            {props.options.map((option) => {
              const isSelected = selectedUrls.has(option.url);
              return (
                <button
                  key={`${option.type}:${option.url}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option)}
                  className={
                    "grid w-full grid-cols-[auto_1fr] gap-2 px-3 py-2 text-left hover:bg-surface " +
                    (isSelected ? "bg-surface" : "")
                  }
                >
                  <span className="mt-0.5 font-mono text-[11px] text-ink">
                    {isSelected ? "ON" : "--"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] text-ink">{option.label}</span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
                      {option.type} · {option.url}
                    </span>
                  </span>
                </button>
              );
            })}
            {props.options.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-muted">
                public/media 폴더에 등록된 파일이 없습니다.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {props.description ? (
        <p className="mt-1.5 text-[11px] text-muted">{props.description}</p>
      ) : null}
      {props.value.length > 0 ? (
        <ol className="mt-3 space-y-1.5">
          {props.value.map((item, index) => {
            const option = props.options.find((entry) => entry.url === item.url);
            return (
              <li
                key={`${item.url}:${index}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-line bg-surface px-3 py-2"
              >
                <span className="font-mono text-[11px] text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-ink">
                    {option?.label || item.url}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-muted">
                    {item.type} · {item.url}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(item.url)}
                  className="text-[12px] text-red-600 hover:underline underline-offset-4"
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

function MediaPreviewGrid({
  items,
  poster
}: {
  items: ProjectMediaItem[];
  poster?: string;
}) {
  if (items.length === 0) {
    return (
      <MediaPreview
        url=""
        type="image"
        alt="미디어 미리보기"
      />
    );
  }

  return (
    <div className={items.length > 1 ? "grid sm:grid-cols-2 gap-3" : ""}>
      {items.map((item, index) => (
        <div key={`${item.url}:${index}`} className="min-w-0">
          <MediaPreview
            url={item.url}
            type={normalizeMediaType(item.type)}
            alt={item.alt || "미디어 미리보기"}
            poster={poster}
          />
          {items.length > 1 ? (
            <p className="mt-1.5 truncate font-mono text-[11px] text-muted">
              {String(index + 1).padStart(2, "0")} · {item.type} · {item.url}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MediaPreview(props: {
  url: string;
  type: MediaType;
  alt: string;
  poster?: string;
}) {
  if (!props.url) {
    return (
      <div
        className="flex items-center justify-center border border-line bg-surface rounded-md text-[12px] text-muted"
        style={{ aspectRatio: "16/10" }}
      >
        선택된 미디어가 없습니다.
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden border border-line bg-surface rounded-md"
      style={{ aspectRatio: "16/10" }}
    >
      {props.type === "video" ? (
        <video
          src={props.url}
          poster={props.poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={props.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.url}
          alt={props.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
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
