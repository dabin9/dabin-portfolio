import data from "./projects.json";
import type { MediaType } from "./media";

export type ProjectLink = { label: string; href: string };
export type ProjectMediaItem = {
  url: string;
  type: MediaType;
  alt?: string;
};
export type ProjectCaseNote = {
  issueTitle?: string;
  issueTitleHtml?: string;
  problem?: string;
  problemHtml?: string;
  approach: string;
  approachHtml?: string;
  result?: string;
  resultHtml?: string;
};

/** BlockNote 본문 블록 — 구조 자유. 공개 페이지에서 HTML 로 변환해 렌더한다. */
export type ProjectBlock = unknown;

/** 발행 상태 — 공개 페이지 노출 여부 결정 */
export type ProjectStatus = "published" | "draft" | "private";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  role: string;
  /** 근무처/소속 */
  company?: string;
  /** 썸네일 이미지 URL (업로드된 blob 또는 외부 URL) */
  thumbnail?: string;
  /** 썸네일 대체 글자 (5~6자) — thumbnail 이 없을 때 카드 중앙에 큰 글씨로 */
  altText?: string;
  /** 마우스 오버 시 보일 이미지 (gif/webp 가능) */
  hoverImage?: string;
  /** 상세/인터랙션 미리보기 미디어 URL */
  mediaUrl?: string;
  /** 상세/인터랙션 미리보기 미디어 타입 */
  mediaType?: MediaType;
  /** 실제 이미지/영상 접근성 대체 텍스트 */
  mediaAlt?: string;
  /** 상세/인터랙션 미디어 목록. 없으면 legacy mediaUrl/mediaType/mediaAlt 를 사용 */
  mediaItems?: ProjectMediaItem[];
  stack: string[];
  /** 분류 태그 — 목록 필터에 사용 */
  tags?: string[];
  /** 기여도 0~100 (%) — 상세 페이지에 표시 */
  contribution?: number;
  /** 상세 페이지 Case Notes 섹션 */
  caseNotes?: ProjectCaseNote[];
  /** 상세 페이지 Result 섹션 */
  resultItems?: string[];
  /** Legacy: 예전 하이라이트 입력값. caseNotes/resultItems 없을 때 fallback 으로 사용 */
  highlights: string[];
  links?: ProjectLink[];
  /** 홈 노출 여부 */
  featured?: boolean;
  /** 진행 중 표시 */
  ongoing?: boolean;
  /**
   * 정렬용 가중치. 클수록 앞으로.
   * 사용자가 입력한 "1, 2, 3..." 은 작을수록 뒤로 → UI 에서 입력받아 그대로 저장.
   */
  order?: number;
  /** 발행 상태 — 기본 published */
  status?: ProjectStatus;
  /** BlockNote 에디터 컨텐츠 (배열) — 편집 시 다시 열기 위해 보관 */
  bodyBlocks?: ProjectBlock[];
  /** BlockNote 가 직렬화한 HTML — 공개 페이지에서 그대로 렌더 */
  bodyHtml?: string;
};

export const projects: Project[] = data as Project[];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/**
 * 공개 페이지에서 보일 작업물만 필터하고 정렬한다.
 * - status === 'draft' | 'private' 는 숨김
 * - order 는 클수록 앞 (없으면 0 으로 처리). 동률이면 입력 순서 유지(=배열 순서).
 */
export function publicProjects(list: Project[] = projects): Project[] {
  return list
    .filter((p) => (p.status ?? "published") === "published")
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** 모든 태그 (중복 제거, 작업물 출현 순) */
export function allTags(list: Project[] = projects): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of list) {
    for (const t of p.tags ?? []) {
      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
  }
  return out;
}
