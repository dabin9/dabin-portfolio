import { NextResponse, type NextRequest } from "next/server";

/**
 * /admin 하위 경로 진입 전 쿠키만 가볍게 검사 (1차 게이트).
 * 정확한 검증(HMAC 비교)은 서버 컴포넌트/액션에서 다시 isLoggedIn() 으로 한다.
 *
 * - 쿠키가 아예 없으면 /admin 로그인 페이지로 리다이렉트
 * - /admin (로그인 페이지) 자체는 통과
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  const cookie = req.cookies.get("dabin_admin");
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
