import type {
  Project,
  ProjectCaseNote,
  ProjectLink,
  ProjectMediaItem,
  ProjectStatus
} from "./types";
import type { MediaType } from "./media";

export function parseProjects(value: unknown, source = "project data"): Project[] {
  if (!Array.isArray(value)) {
    throw new Error(`${source} must be an array of projects.`);
  }

  const invalidIndex = value.findIndex((item) => !isProject(item));
  if (invalidIndex >= 0) {
    throw new Error(`${source} contains an invalid project at index ${invalidIndex}.`);
  }

  return value;
}

export function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false;

  return (
    isString(value.slug) &&
    isString(value.title) &&
    isString(value.summary) &&
    isString(value.year) &&
    isString(value.role) &&
    isStringArray(value.stack) &&
    isStringArray(value.highlights) &&
    isOptionalString(value.company) &&
    isOptionalString(value.thumbnail) &&
    isOptionalString(value.altText) &&
    isOptionalString(value.hoverImage) &&
    isOptionalString(value.mediaUrl) &&
    isOptionalMediaType(value.mediaType) &&
    isOptionalString(value.mediaAlt) &&
    isOptionalArray(value.mediaItems, isProjectMediaItem) &&
    isOptionalArray(value.tags, isString) &&
    isOptionalNumber(value.contribution) &&
    isOptionalArray(value.caseNotes, isProjectCaseNote) &&
    isOptionalArray(value.resultItems, isString) &&
    isOptionalArray(value.links, isProjectLink) &&
    isOptionalBoolean(value.featured) &&
    isOptionalBoolean(value.ongoing) &&
    isOptionalNumber(value.order) &&
    isOptionalProjectStatus(value.status) &&
    isOptionalArray(value.bodyBlocks, isUnknown) &&
    isOptionalString(value.bodyHtml)
  );
}

function isProjectMediaItem(value: unknown): value is ProjectMediaItem {
  return (
    isRecord(value) &&
    isString(value.url) &&
    isMediaType(value.type) &&
    isOptionalString(value.alt)
  );
}

function isProjectCaseNote(value: unknown): value is ProjectCaseNote {
  return (
    isRecord(value) &&
    isOptionalString(value.issueTitle) &&
    isOptionalString(value.issueTitleHtml) &&
    isOptionalString(value.problem) &&
    isOptionalString(value.problemHtml) &&
    isString(value.approach) &&
    isOptionalString(value.approachHtml) &&
    isOptionalString(value.result) &&
    isOptionalString(value.resultHtml)
  );
}

function isProjectLink(value: unknown): value is ProjectLink {
  return isRecord(value) && isString(value.label) && isString(value.href);
}

function isOptionalProjectStatus(value: unknown): value is ProjectStatus | undefined {
  return value === undefined || value === "published" || value === "draft" || value === "private";
}

function isOptionalMediaType(value: unknown): value is MediaType | undefined {
  return value === undefined || isMediaType(value);
}

function isMediaType(value: unknown): value is MediaType {
  return value === "image" || value === "gif" || value === "video";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || isNumber(value);
}

function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === "boolean";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isOptionalArray<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] | undefined {
  return value === undefined || (Array.isArray(value) && value.every(guard));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isUnknown(_value: unknown): _value is unknown {
  return true;
}
