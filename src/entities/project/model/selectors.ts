import type { Project } from "./types";

export function findProjectBySlug(list: Project[], slug: string) {
  return list.find((project) => project.slug === slug);
}

export function publicProjects(list: Project[]): Project[] {
  return list
    .filter((project) => (project.status ?? "published") === "published")
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function allTags(list: Project[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const project of list) {
    for (const tag of project.tags ?? []) {
      if (!seen.has(tag)) {
        seen.add(tag);
        out.push(tag);
      }
    }
  }

  return out;
}
