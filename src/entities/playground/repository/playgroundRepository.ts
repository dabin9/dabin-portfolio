import fs from "node:fs/promises";
import path from "node:path";
import bundled from "@/entities/playground/data/playground.json";
import type { PlaygroundItem } from "@/entities/playground/model/types";
import { parsePlaygroundItems } from "@/entities/playground/model/guards";
import { getJsonFile, putJsonFile } from "@/shared/lib/github";

const REPO_PATH = "src/entities/playground/data/playground.json";
const LOCAL_PATH = path.join(process.cwd(), REPO_PATH);

const isVercel = !!process.env.VERCEL;
const bundledItems = parsePlaygroundItems(bundled, "bundled playground data");

export function readPlaygroundItems(): PlaygroundItem[] {
  return bundledItems;
}

export function publicPlaygroundItems(
  list: PlaygroundItem[] = bundledItems
): PlaygroundItem[] {
  return list
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readPlaygroundItemsFresh(): Promise<{
  items: PlaygroundItem[];
  sha?: string;
}> {
  if (isVercel) {
    const remote = await getJsonFile<PlaygroundItem[]>(REPO_PATH);
    if (remote) {
      return {
        items: parsePlaygroundItems(remote.data, `GitHub ${REPO_PATH}`),
        sha: remote.sha
      };
    }
    return { items: bundledItems };
  }

  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return {
      items: parsePlaygroundItems(JSON.parse(raw) as unknown, LOCAL_PATH)
    };
  } catch {
    return { items: bundledItems };
  }
}

export async function writePlaygroundItems(
  items: PlaygroundItem[],
  message: string,
  prevSha?: string
): Promise<void> {
  if (isVercel) {
    let sha = prevSha;
    if (!sha) {
      const remote = await getJsonFile<PlaygroundItem[]>(REPO_PATH);
      sha = remote?.sha;
    }
    await putJsonFile(REPO_PATH, items, message, sha);
    return;
  }

  await fs.writeFile(LOCAL_PATH, JSON.stringify(items, null, 2) + "\n", "utf8");
}

export async function addPlaygroundItem(
  item: PlaygroundItem,
  message: string
): Promise<void> {
  const { items, sha } = await readPlaygroundItemsFresh();
  await writePlaygroundItems([item, ...items], message, sha);
}
