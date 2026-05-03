import data from "./projects.json";

export type ProjectLink = { label: string; href: string };

/** BlockNote 본문 블록 — 구조 자유. 공개 페이지에서 HTML 로 변환해 렌더한다. */
export type ProjectBlock = unknown;

export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  role: string;
  /** 근무처/소속 */
  company?: string;
  stack: string[];
  highlights: string[];
  links?: ProjectLink[];
  /** 홈 노출 여부 */
  featured?: boolean;
  /** 진행 중 표시 */
  ongoing?: boolean;
  /** BlockNote 에디터 컨텐츠 (배열) — 편집 시 다시 열기 위해 보관 */
  bodyBlocks?: ProjectBlock[];
  /** BlockNote 가 직렬화한 HTML — 공개 페이지에서 그대로 렌더 */
  bodyHtml?: string;
};

export const projects: Project[] = data as Project[];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
