/**
 * 프로젝트 데이터 read/write 추상화.
 *
 * - 읽기: 항상 로컬 JSON 파일을 import (가장 빠름, 빌드에 번들).
 *         단 admin 화면은 prod 에서 GitHub 의 최신본을 읽어와야
 *         "방금 저장한 게 즉시 보임" 이 보장된다 → readProjectsFresh().
 * - 쓰기: dev 는 fs.writeFile, prod (Vercel) 은 GitHub commit.
 *         커밋되면 Vercel 이 자동 재배포 → public 사이트 갱신.
 */

import fs from "node:fs/promises";
import path from "node:path";
import bundled from "@/data/projects.json";
import type { Project } from "@/data/projects";
import { getJsonFile, putJsonFile } from "./github";

const REPO_PATH = "src/data/projects.json";
const LOCAL_PATH = path.join(process.cwd(), REPO_PATH);

const isVercel = !!process.env.VERCEL;

/** public 페이지에서 호출 — 빠른 정적 read */
export function readProjects(): Project[] {
  return bundled as Project[];
}

/** admin 화면에서 호출 — 가장 최신 (prod: GitHub, dev: local) */
export async function readProjectsFresh(): Promise<{
  projects: Project[];
  sha?: string;
}> {
  if (isVercel) {
    const remote = await getJsonFile<Project[]>(REPO_PATH);
    if (remote) return { projects: remote.data, sha: remote.sha };
    return { projects: bundled as Project[] };
  }
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return { projects: JSON.parse(raw) as Project[] };
  } catch {
    return { projects: bundled as Project[] };
  }
}

/** 전체 프로젝트 배열을 통째로 저장 */
export async function writeProjects(
  projects: Project[],
  message: string,
  prevSha?: string
): Promise<void> {
  if (isVercel) {
    let sha = prevSha;
    if (!sha) {
      const remote = await getJsonFile<Project[]>(REPO_PATH);
      sha = remote?.sha;
    }
    await putJsonFile(REPO_PATH, projects, message, sha);
    return;
  }
  await fs.writeFile(LOCAL_PATH, JSON.stringify(projects, null, 2) + "\n", "utf8");
}

/** 단일 프로젝트 upsert — 같은 slug 면 교체, 없으면 맨 앞에 추가 */
export async function upsertProject(
  project: Project,
  message: string
): Promise<void> {
  const { projects, sha } = await readProjectsFresh();
  const i = projects.findIndex((p) => p.slug === project.slug);
  const next = [...projects];
  if (i >= 0) next[i] = project;
  else next.unshift(project);
  await writeProjects(next, message, sha);
}

/** slug 로 삭제 */
export async function deleteProjectBySlug(
  slug: string,
  message: string
): Promise<void> {
  const { projects, sha } = await readProjectsFresh();
  const next = projects.filter((p) => p.slug !== slug);
  await writeProjects(next, message, sha);
}
