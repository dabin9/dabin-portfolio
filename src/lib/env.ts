/**
 * 공개(public) 환경변수 래퍼.
 * 값이 비어있을 경우 안전한 fallback 을 반환하며, 유효성을 한 곳에서 관리합니다.
 */

function fallback(value: string | undefined, fb = ""): string {
  return value && value.trim().length > 0 ? value.trim() : fb;
}

export const env = {
  github: fallback(process.env.NEXT_PUBLIC_GITHUB_URL, "https://github.com/dabin9"),
  email: fallback(
    process.env.NEXT_PUBLIC_EMAIL,
    fallback(process.env.NEXT_PUBLIC_CONTACT_EMAIL)
  ),
  linkedin: fallback(process.env.NEXT_PUBLIC_LINKEDIN_URL),
  blog: fallback(process.env.NEXT_PUBLIC_BLOG_URL),
  resume: fallback(process.env.NEXT_PUBLIC_RESUME_URL),
  notion: fallback(process.env.NEXT_PUBLIC_NOTION_URL, "https://davins.notion.site/2026-3557f37f13f4806ea50fd66de428dd5b?pvs=74)")
} as const;

export type SiteEnv = typeof env;
