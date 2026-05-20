import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import type { Dirent } from "node:fs";
import { mediaOptions, type MediaOption, type MediaType } from "@/data/media";

const MEDIA_DIR = path.join(process.cwd(), "public/media");

const EXTENSION_TYPE: Record<string, MediaType> = {
  ".avif": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".webp": "image",
  ".gif": "gif",
  ".mp4": "video",
  ".webm": "video"
};

export async function getMediaOptions(): Promise<MediaOption[]> {
  const discovered = await readMediaFiles(MEDIA_DIR);
  const registeredByUrl = new Map(mediaOptions.map((option) => [option.url, option]));

  return discovered.map((option) => ({
    ...option,
    ...registeredByUrl.get(option.url)
  }));
}

async function readMediaFiles(dir: string, baseDir = dir): Promise<MediaOption[]> {
  let entries: Dirent[];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const options = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith(".")) return [];

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return readMediaFiles(fullPath, baseDir);
      if (!entry.isFile()) return [];

      const ext = path.extname(entry.name).toLowerCase();
      const type = EXTENSION_TYPE[ext];
      if (!type) return [];

      const relativePath = path.relative(baseDir, fullPath).split(path.sep).join("/");
      const url = `/media/${relativePath}`;
      const label = toLabel(relativePath);

      return [
        {
          label,
          url,
          type,
          alt: label
        }
      ];
    })
  );

  return options.flat().sort((a, b) => a.label.localeCompare(b.label));
}

function toLabel(filePath: string): string {
  const withoutExt = filePath.replace(/\.[^.]+$/, "");
  return withoutExt
    .split("/")
    .pop()!
    .replace(/[-_]+/g, " ")
    .trim();
}
