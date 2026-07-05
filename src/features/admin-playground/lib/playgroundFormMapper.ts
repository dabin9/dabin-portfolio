import type { PlaygroundItem } from "@/entities/playground";

export function playgroundItemFromForm(formData: FormData): PlaygroundItem {
  const now = new Date();
  const title = cleanText(String(formData.get("title") || ""), 120);

  return {
    id: `${slugify(title) || "playground"}-${now.getTime().toString(36)}`,
    title,
    description: cleanText(String(formData.get("description") || ""), 600),
    thumbnail: cleanText(String(formData.get("thumbnail") || ""), 500),
    link: normalizeLink(String(formData.get("link") || "")),
    createdAt: now.toISOString()
  };
}

export function validatePlaygroundItem(item: PlaygroundItem): string | null {
  if (!item.title) return "제목을 입력해 주세요.";
  if (!item.description) return "내용을 입력해 주세요.";
  if (!item.thumbnail) return "썸네일을 선택하거나 입력해 주세요.";
  if (!item.link) return "링크를 입력해 주세요.";
  return null;
}

function normalizeLink(value: string): string {
  const link = cleanText(value, 500);
  if (!link) return "";
  if (/^(https?:\/\/|\/)/i.test(link)) return link;
  if (/^[^\s]+\.[^\s]+/.test(link)) return `https://${link}`;
  return link;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function cleanText(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}
