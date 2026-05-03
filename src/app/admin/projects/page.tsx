import Link from "next/link";
import { getAdminProjects, deleteProjectAction } from "../actions";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  published: { label: "발행", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "임시", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  private: { label: "비공개", cls: "bg-zinc-100 text-zinc-600 border-zinc-300" }
};

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    error?: string;
    tag?: string;
  }>;
}) {
  const sp = await searchParams;
  const all = await getAdminProjects();

  // 정렬: order 큰 순서, 그 다음 입력 순
  const sorted = [...all].sort((a, b) => (b.order ?? 0) - (a.order ?? 0));

  // 모든 태그 (중복 제거)
  const tagSet = new Set<string>();
  for (const p of all) for (const t of p.tags ?? []) tagSet.add(t);
  const tags = Array.from(tagSet);

  const projects = sp.tag
    ? sorted.filter((p) => (p.tags ?? []).includes(sp.tag!))
    : sorted;

  return (
    <main className="wrap py-12 max-w-[1000px] mx-auto">
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

      {/* 태그 필터 */}
      {tags.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] text-muted mr-1">태그:</span>
          <Link
            href="/admin/projects"
            className={
              "text-[12px] px-2.5 py-1 border rounded-full " +
              (!sp.tag
                ? "bg-ink text-bg border-ink"
                : "border-line text-inkMuted hover:border-ink hover:text-ink")
            }
          >
            전체 ({all.length})
          </Link>
          {tags.map((t) => {
            const count = all.filter((p) => (p.tags ?? []).includes(t)).length;
            const active = sp.tag === t;
            return (
              <Link
                key={t}
                href={`/admin/projects?tag=${encodeURIComponent(t)}`}
                className={
                  "text-[12px] px-2.5 py-1 border rounded-full " +
                  (active
                    ? "bg-ink text-bg border-ink"
                    : "border-line text-inkMuted hover:border-ink hover:text-ink")
                }
              >
                {t} ({count})
              </Link>
            );
          })}
        </div>
      ) : null}

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
      {sp.error ? (
        <p className="mt-6 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2.5 whitespace-pre-line">
          {sp.error}
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {projects.map((p) => {
          const status = p.status ?? "published";
          const meta = STATUS_LABEL[status] ?? STATUS_LABEL.published;
          return (
            <li key={p.slug} className="py-4 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={
                      "text-[10px] px-1.5 py-0.5 rounded border font-mono " + meta.cls
                    }
                  >
                    {meta.label}
                  </span>
                  {p.order != null ? (
                    <span className="text-[10px] text-muted font-mono">
                      #{p.order}
                    </span>
                  ) : null}
                  <Link
                    href={`/admin/projects/${encodeURIComponent(p.slug)}`}
                    className="font-display font-medium text-[16px] hover:underline underline-offset-4"
                  >
                    {p.title}
                  </Link>
                </div>
                <p className="text-[12px] text-muted mt-1">
                  <code className="font-mono">{p.slug}</code> · {p.year || "-"} · {p.role || "-"}
                </p>
                {p.tags && p.tags.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 border border-line rounded text-inkMuted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
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
          );
        })}
        {projects.length === 0 ? (
          <li className="py-10 text-center text-[14px] text-muted">
            {sp.tag ? "이 태그의 작업물이 없습니다." : "작업물이 없습니다. 새로 만들어 주세요."}
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
