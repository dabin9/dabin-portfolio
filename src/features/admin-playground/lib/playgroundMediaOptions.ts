import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import type { Dirent } from "node:fs";
import type { MediaOption, MediaType } from "@/entities/project/model/media";

const PLAYGROUND_DIR = path.join(process.cwd(), "public/playground");

const EXTENSION_TYPE: Record<string, MediaType> = {
  ".avif": "image",
  ".gif": "gif",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".webp": "image"
};

export async function getPlaygroundMediaOptions(): Promise<MediaOption[]> {
  return readPlaygroundFiles(PLAYGROUND_DIR);
}

async function readPlaygroundFiles(
  dir: string,
  baseDir = dir
): Promise<MediaOption[]> {
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
      if (entry.isDirectory()) return readPlaygroundFiles(fullPath, baseDir);
      if (!entry.isFile()) return [];

      const ext = path.extname(entry.name).toLowerCase();
      const type = EXTENSION_TYPE[ext];
      if (!type) return [];

      const relativePath = path.relative(baseDir, fullPath).split(path.sep).join("/");
      const url = `/playground/${relativePath}`;
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
