import type {
  Project,
  ProjectBlock,
  ProjectCaseNote,
  ProjectMediaItem,
  ProjectStatus
} from "@/data/projects";
import type { MediaType } from "@/data/media";
import { stripEmptyBlockNoteBlocks } from "@/lib/blocknoteHtml";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function parseList(s: string): string[] {
  return s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseLinks(s: string): { label: string; href: string }[] {
  return s
    .split("\n")
    .map((line) => {
      const value = line.trim();
      if (!value) return null;

      const m = value.match(/^(.+?)\s*\|\s*(\S+)\s*$/);
      if (m) return { label: m[1].trim(), href: m[2].trim() };

      if (/^https?:\/\/\S+$/i.test(value)) {
        return { label: "Company 사이트 보러가기", href: value };
      }

      return null;
    })
    .filter((x): x is { label: string; href: string } => !!x);
}

function formValues(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((value) => String(value || "").trim());
}

function cleanHtml(value: string): string {
  const html = stripEmptyBlockNoteBlocks(value.trim());
  if (!html) return "";
  if (!htmlToText(html)) return "";
  return html;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function parseCaseNotes(formData: FormData): ProjectCaseNote[] {
  const issueTitleHtmls = formValues(formData, "caseIssueTitleHtml").map(cleanHtml);
  const problemHtmls = formValues(formData, "caseProblemHtml").map(cleanHtml);
  const approachHtmls = formValues(formData, "caseApproachHtml").map(cleanHtml);
  const resultHtmls = formValues(formData, "caseResultHtml").map(cleanHtml);
  const issueTitles = formValues(formData, "caseIssueTitle");
  const problems = formValues(formData, "caseProblem");
  const approaches = formValues(formData, "caseApproach");
  const results = formValues(formData, "caseResult");
  const length = Math.max(
    issueTitleHtmls.length,
    problemHtmls.length,
    approachHtmls.length,
    resultHtmls.length,
    issueTitles.length,
    problems.length,
    approaches.length,
    results.length
  );
  const out: ProjectCaseNote[] = [];

  for (let i = 0; i < length; i += 1) {
    const issueTitleHtml = issueTitleHtmls[i] || "";
    const problemHtml = problemHtmls[i] || "";
    const approachHtml = approachHtmls[i] || "";
    const resultHtml = resultHtmls[i] || "";
    const issueTitle = issueTitles[i] || htmlToText(issueTitleHtml);
    const problem = problems[i] || htmlToText(problemHtml);
    const approach = approaches[i] || htmlToText(approachHtml);
    const result = results[i] || htmlToText(resultHtml);
    if (
      !issueTitle &&
      !issueTitleHtml &&
      !problem &&
      !problemHtml &&
      !approach &&
      !approachHtml &&
      !result &&
      !resultHtml
    ) continue;
    out.push({
      issueTitle: issueTitle || undefined,
      issueTitleHtml: issueTitleHtml || undefined,
      problem: problem || undefined,
      problemHtml: problemHtml || undefined,
      approach,
      approachHtml: approachHtml || undefined,
      result: result || undefined,
      resultHtml: resultHtml || undefined
    });
  }

  return out;
}

function normalizeMediaType(value: string): MediaType {
  if (value === "image" || value === "gif" || value === "video") return value;
  return "image";
}

function parseMediaItems(formData: FormData): ProjectMediaItem[] {
  const raw = String(formData.get("mediaItems") || "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const items: ProjectMediaItem[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      const url = String(record.url || "").trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      items.push({
        url,
        type: normalizeMediaType(String(record.type || "")),
        alt: String(record.alt || "").trim() || undefined
      });
    }
    return items;
  } catch {
    return [];
  }
}

export function projectFromForm(
  formData: FormData,
  blocks: ProjectBlock[],
  bodyHtml: string
): Project {
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugInput ? slugify(slugInput) : slugify(title);
  const altText = String(formData.get("altText") || "").trim().slice(0, 6);
  const contribRaw = String(formData.get("contribution") || "").trim();
  const contribNum =
    contribRaw === "" ? undefined : Math.max(0, Math.min(100, Number(contribRaw)));
  const orderRaw = String(formData.get("order") || "").trim();
  const orderNum = orderRaw === "" ? undefined : Number(orderRaw);
  const thumbnail = String(formData.get("thumbnail") || "").trim();
  const mediaUrl = String(formData.get("mediaUrl") || "").trim();
  const mediaType = normalizeMediaType(String(formData.get("mediaType") || ""));
  const mediaAlt = String(formData.get("mediaAlt") || "").trim();
  const parsedMediaItems = parseMediaItems(formData);
  const mediaItems =
    parsedMediaItems.length > 0
      ? parsedMediaItems
      : mediaUrl
        ? [{ url: mediaUrl, type: mediaType, alt: mediaAlt || undefined }]
        : [];
  const primaryMedia = mediaItems[0];
  const statusRaw = String(formData.get("status") || "published");
  const status: ProjectStatus = ["published", "draft", "private"].includes(statusRaw)
    ? (statusRaw as ProjectStatus)
    : "published";
  const caseNotes = parseCaseNotes(formData);
  const resultItems = formValues(formData, "resultItems").map(cleanHtml).filter(Boolean);
  const resultItemTexts = resultItems.map(htmlToText).filter(Boolean);
  const legacyHighlights = parseList(String(formData.get("highlights") || ""));
  const highlights =
    legacyHighlights.length > 0
      ? legacyHighlights
      : [
          ...caseNotes.map((note) => note.approach || note.problem || note.result || ""),
          ...resultItemTexts
        ].filter(Boolean);

  return {
    slug,
    title,
    summary: String(formData.get("summary") || "").trim(),
    year: String(formData.get("year") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    company: String(formData.get("company") || "").trim() || undefined,
    thumbnail: thumbnail || undefined,
    altText: altText || undefined,
    hoverImage: primaryMedia?.url || undefined,
    mediaUrl: primaryMedia?.url || undefined,
    mediaType: primaryMedia?.type ?? mediaType,
    mediaAlt: primaryMedia?.alt || mediaAlt || undefined,
    mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
    stack: parseList(String(formData.get("stack") || "")),
    tags: parseList(String(formData.get("tags") || "")),
    contribution: Number.isFinite(contribNum) ? contribNum : undefined,
    caseNotes,
    resultItems,
    highlights,
    links: parseLinks(String(formData.get("links") || "")),
    featured: formData.get("featured") === "on",
    ongoing: formData.get("ongoing") === "on",
    order: Number.isFinite(orderNum) ? orderNum : undefined,
    status,
    bodyBlocks: blocks,
    bodyHtml: bodyHtml || undefined
  };
}

export function formatStorageError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/GitHub backend not configured/i.test(msg)) {
    return "Vercel 환경변수 GITHUB_TOKEN · GITHUB_OWNER · GITHUB_REPO 가 설정돼야 저장이 가능해요.";
  }
  if (/401|Bad credentials/i.test(msg)) {
    return "GitHub 토큰이 거부됨 (401). PAT 의 repo scope · 만료여부 확인.";
  }
  if (/403/i.test(msg)) {
    return "GitHub 가 권한을 거절(403). PAT 의 repo write 권한 또는 fine-grained 권한 확인.";
  }
  if (/404/i.test(msg)) {
    return "GitHub 저장소를 찾지 못함(404). GITHUB_OWNER · GITHUB_REPO 가 정확한지 확인.";
  }
  if (/409|sha/i.test(msg)) {
    return "동시 편집 충돌(409). 새로고침 후 다시 저장해 주세요.";
  }
  return "저장 실패: " + msg;
}
