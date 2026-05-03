import Link from "next/link";
import { getAdminProjects, deleteProjectAction } from "../actions";

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  const projects = await getAdminProjects();

  return (
    <main className="wrap py-12 max-w-[960px] mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] tracking-[0.4em] text-muted uppercase">Admin</p>
          <h1 className="mt-2 font-display font-medium text-[26px]">작업물</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/new"
            className="bg-ink text-bg px-4 py-2 rounded-md text-[13px] hover:opacity-90 transition"
          >
            + 새 작업물
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button className="text-[13px] text-inkMuted hover:text-ink underline underline-offset-4 decoration-ink/30">
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {sp.saved ? (
        <p className="mt-6 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-2.5">
          저장됨: <code className="font-mono">{sp.saved}</code>
          {process.env.VERCEL ? " · Vercel 재배포까지 ~30초 후 사이트에 반영됩니다." : null}
        </p>
      ) : null}
      {sp.deleted ? (
        <p className="mt-6 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5">
          삭제됨.
        </p>
      ) : null}

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {projects.map((p) => (
          <li key={p.slug} className="py-4 flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/projects/${encodeURIComponent(p.slug)}`}
                className="font-display font-medium text-[16px] hover:underline underline-offset-4"
              >
                {p.title}
              </Link>
              <p className="text-[12px] text-muted mt-1">
                <code className="font-mono">{p.slug}</code> · {p.year} · {p.role}
              </p>
              {p.summary ? (
                <p className="text-[13px] text-inkMuted mt-1 line-clamp-1">
                  {p.summary}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/work/${p.slug}`}
                target="_blank"
                className="text-[12px] text-inkMuted hover:text-ink"
              >
                보기 ↗
              </Link>
              <Link
                href={`/admin/projects/${encodeURIComponent(p.slug)}`}
                className="text-[12px] text-ink hover:underline underline-offset-4"
              >
                편집
              </Link>
              <form action={deleteProjectAction}>
                <input type="hidden" name="slug" value={p.slug} />
                <button
                  type="submit"
                  className="text-[12px] text-red-600 hover:underline underline-offset-4"
                  formNoValidate
                >
                  삭제
                </button>
              </form>
            </div>
          </li>
        ))}
        {projects.length === 0 ? (
          <li className="py-10 text-center text-[14px] text-muted">
            작업물이 없습니다. 새로 만들어 주세요.
          </li>
        ) : null}
      </ul>

      {!process.env.GITHUB_TOKEN && process.env.VERCEL ? (
        <p className="mt-10 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
          ⚠ <code>GITHUB_TOKEN</code> · <code>GITHUB_OWNER</code> · <code>GITHUB_REPO</code>{" "}
          환경변수가 설정되어야 Vercel 에서 저장이 가능해요.
        </p>
      ) : null}
    </main>
  );
}
