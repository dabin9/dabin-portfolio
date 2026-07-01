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
    fallback(process.env.NEXT_PUBLIC_CONTACT_EMAIL, "devjenny19@gmail.com")
  ),
  linkedin: fallback(process.env.NEXT_PUBLIC_LINKEDIN_URL),
  blog: fallback(process.env.NEXT_PUBLIC_BLOG_URL)
} as const;

export type SiteEnv = typeof env;
