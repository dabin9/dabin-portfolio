/**
 * 단일 비밀번호 + HMAC 서명 쿠키 인증.
 * - login(password): env.ADMIN_PASSWORD 와 비교, 일치하면 서명된 토큰을 쿠키로
 * - isLoggedIn(): 쿠키 토큰을 재계산해 검증
 *
 * env
 *   ADMIN_PASSWORD  — 단일 관리자 비밀번호
 *   ADMIN_SECRET    — 쿠키 서명용 secret (없으면 ADMIN_PASSWORD 그대로 사용)
 */

import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "dabin_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14일

function tokenFor(password: string) {
  const secret = (process.env.ADMIN_SECRET || password) + "::dabin-admin";
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export async function isLoggedIn(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  if (!c) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(c, "hex"),
      Buffer.from(tokenFor(expected), "hex")
    );
  } catch {
    return false;
  }
}

export async function login(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return false;
  (await cookies()).set(COOKIE, tokenFor(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE
  });
  return true;
}

export async function logout(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
