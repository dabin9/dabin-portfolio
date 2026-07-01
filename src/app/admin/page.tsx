import { redirect } from "next/navigation";
import { isLoggedIn } from "@/features/admin/lib/auth";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  if (await isLoggedIn()) redirect(sp.next || "/admin/projects");

  const errorMessage =
    sp.error === "invalid"
      ? "비밀번호가 일치하지 않아요."
      : sp.error === "unauthenticated"
        ? "로그인이 필요해요."
        : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        action="/api/admin/login"
        method="POST"
        className="w-full max-w-[360px] border border-line rounded-2xl bg-bg p-8"
      >
        <p className="text-[12px] tracking-[0.4em] text-muted uppercase">
          Admin
        </p>
        <h1 className="mt-3 font-display font-medium text-[22px] leading-snug">
          관리자 로그인
        </h1>
        <p className="mt-2 text-[13px] text-inkMuted">
          작업물 CRUD 를 위해 비밀번호를 입력하세요.
        </p>

        <input type="hidden" name="next" value={sp.next || "/admin/projects"} />

        <label className="block mt-6">
          <span className="text-[12px] text-muted">비밀번호</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="mt-1.5 w-full bg-surface border border-line rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink"
          />
        </label>

        {errorMessage ? (
          <p className="mt-3 text-[12px] text-red-500">{errorMessage}</p>
        ) : null}

        <button
          type="submit"
          className="mt-6 w-full bg-ink text-bg py-2.5 rounded-md text-[13px] hover:opacity-90 transition"
        >
          로그인
        </button>

        {!process.env.ADMIN_PASSWORD ? (
          <p className="mt-4 text-[11px] text-amber-600 leading-relaxed">
            ⚠ <code>ADMIN_PASSWORD</code> 환경변수가 비어있어요. <br />
            <code>.env.local</code> 에 추가하고 dev 서버를 재시작하세요.
          </p>
        ) : null}
      </form>
    </main>
  );
}
