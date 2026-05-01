/**
 * 공개(public) 환경변수 래퍼.
 * 값이 비어있을 경우 안전한 fallback 을 반환하며, 유효성을 한 곳에서 관리합니다.
 */

function fallback(value: string | undefined, fb = ""): string {
  return value && value.trim().length > 0 ? value.trim() : fb;
}

const tistoryName = fallback(process.env.NEXT_PUBLIC_TISTORY_NAME);
const tistoryUrl = tistoryName
  ? `https://${tistoryName}.tistory.com`
  : fallback(process.env.NEXT_PUBLIC_TISTORY_URL);

export const env = {
  email: fallback(process.env.NEXT_PUBLIC_CONTACT_EMAIL, "ekqls940919@gmail.com"),
  github: fallback(process.env.NEXT_PUBLIC_GITHUB_URL, "https://github.com/didrod205"),
  linkedin: fallback(process.env.NEXT_PUBLIC_LINKEDIN_URL),
  blog: fallback(process.env.NEXT_PUBLIC_BLOG_URL, tistoryUrl),
  resume: fallback(process.env.NEXT_PUBLIC_RESUME_URL),
  /** Tistory 블로그 베이스 URL (예: https://yourname.tistory.com). 비어있으면 블로그 섹션이 안내 상태로 표시됩니다. */
  tistory: tistoryUrl
} as const;

export type SiteEnv = typeof env;
