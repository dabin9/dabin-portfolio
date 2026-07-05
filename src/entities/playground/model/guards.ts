import type { PlaygroundItem } from "./types";

export function parsePlaygroundItems(
  value: unknown,
  source = "playground data"
): PlaygroundItem[] {
  if (!Array.isArray(value)) {
    throw new Error(`${source} must be an array of playground items.`);
  }

  const invalidIndex = value.findIndex((item) => !isPlaygroundItem(item));
  if (invalidIndex >= 0) {
    throw new Error(
      `${source} contains an invalid playground item at index ${invalidIndex}.`
    );
  }

  return value;
}

function isPlaygroundItem(value: unknown): value is PlaygroundItem {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    isString(value.thumbnail) &&
    isString(value.link) &&
    isString(value.createdAt)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
