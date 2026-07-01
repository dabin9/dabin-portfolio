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

/** BlockNote 본문 블록. 공개 페이지에서 HTML 로 변환해 렌더한다. */
export type ProjectBlock = unknown;

/** 발행 상태. 공개 페이지 노출 여부를 결정한다. */
export type ProjectStatus = "published" | "draft" | "private";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  role: string;
  /** 근무처/소속 */
  company?: string;
  /** 썸네일 이미지 URL */
  thumbnail?: string;
  /** thumbnail 이 없을 때 카드 중앙에 표시할 대체 글자 */
  altText?: string;
  /** 마우스 오버 시 보일 이미지 */
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
  /** 분류 태그. 목록 필터에 사용 */
  tags?: string[];
  /** 기여도 0~100 (%) */
  contribution?: number;
  /** 상세 페이지 Case Notes 섹션 */
  caseNotes?: ProjectCaseNote[];
  /** 상세 페이지 Result 섹션 */
  resultItems?: string[];
  /** Legacy: caseNotes/resultItems 없을 때 fallback 으로 사용 */
  highlights: string[];
  links?: ProjectLink[];
  /** 홈 노출 여부 */
  featured?: boolean;
  /** 진행 중 표시 */
  ongoing?: boolean;
  /** 정렬용 가중치. 작을수록 앞에 노출된다. */
  order?: number;
  /** 발행 상태. 기본값은 published */
  status?: ProjectStatus;
  /** BlockNote 에디터 컨텐츠 */
  bodyBlocks?: ProjectBlock[];
  /** BlockNote 가 직렬화한 HTML */
  bodyHtml?: string;
};
