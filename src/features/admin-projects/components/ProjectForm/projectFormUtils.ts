import type {
  Project,
  ProjectCaseNote,
  ProjectMediaItem
} from "@/entities/project";
import type { MediaOption, MediaType } from "@/entities/project/model/media";

export function normalizeMediaType(value?: string): MediaType {
  if (value === "image" || value === "gif" || value === "video") return value;
  return "image";
}

export function getInitialCaseNotes(project?: Project): ProjectCaseNote[] {
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

export function getInitialResultItems(project?: Project): string[] {
  if (project?.resultItems && project.resultItems.length > 0) {
    return project.resultItems;
  }
  const legacy = project?.highlights ?? [];
  if (legacy.length > 3) return legacy.slice(3);
  if (legacy.length > 0 && !project?.caseNotes?.length) return [];
  return [""];
}

export function getInitialMediaItems(project?: Project): ProjectMediaItem[] {
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

export function normalizeMediaItems(
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

export function fieldInitialHtml(html?: string, text?: string): string {
  if (html?.trim()) return html;
  const value = text?.trim();
  if (!value) return "";
  if (isStoredBlockHtml(value)) return value;

  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

export function formValue(form: HTMLFormElement, name: string): string {
  const item = form.elements.namedItem(name);
  if (!item) return "";
  if (item instanceof RadioNodeList) return String(item.value ?? "");
  if (item instanceof HTMLInputElement || item instanceof HTMLTextAreaElement) {
    return item.value;
  }
  return "";
}

export function formChecked(form: HTMLFormElement, name: string): boolean {
  const item = form.elements.namedItem(name);
  return item instanceof HTMLInputElement ? item.checked : false;
}

export function parseList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function withCurrentOption(
  options: MediaOption[],
  currentUrl: string,
  currentType: MediaType,
  currentAlt: string,
  currentLabel: string
): MediaOption[] {
  if (!currentUrl || options.some((option) => option.url === currentUrl)) {
    return options;
  }
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

export function withCurrentOptions(
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
