import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/features/admin/lib/auth";
import { readPlaygroundItemsFresh } from "@/entities/playground/repository/playgroundRepository";

export default async function AdminPlaygroundPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/admin?next=/admin/playground");

  const sp = await searchParams;
  const { items } = await readPlaygroundItemsFresh();

  return (
    <main className="wrap mx-auto max-w-[1000px] py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/projects" className="text-[13px] text-inkMuted hover:text-ink">
            ← 작업물 목록
          </Link>
          <p className="mt-5 text-[12px] uppercase tracking-[0.4em] text-muted">
            Admin
          </p>
          <h1 className="mt-2 font-display text-[26px] font-medium">Playground</h1>
        </div>
        <Link
          href="/admin/playground/new"
          className="rounded-md bg-ink px-4 py-2 text-[13px] text-bg transition hover:opacity-90"
        >
          + 새 Playground
        </Link>
      </div>

      {sp.saved ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-700">
          저장됨: <code className="font-mono">{sp.saved}</code>
          {process.env.VERCEL ? " · Vercel 재배포까지 ~30초 후 사이트에 반영됩니다." : null}
        </p>
      ) : null}
      {sp.error ? (
        <p className="mt-6 whitespace-pre-line rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
          {sp.error}
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.id} className="grid gap-4 py-4 md:grid-cols-[120px_1fr_auto]">
            <div
              className="relative overflow-hidden border border-line bg-surface"
              style={{ aspectRatio: "16/10" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnail}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-[18px] font-medium text-ink">
                {item.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-inkMuted">
                {item.description}
              </p>
              <p className="mt-1 truncate font-mono text-[11px] text-muted">
                {item.thumbnail}
              </p>
            </div>
            <a
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : undefined}
              rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="self-center text-[12px] text-ink hover:underline"
            >
              보기 ↗
            </a>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="py-10 text-center text-[14px] text-muted">
            아직 등록된 Playground가 없습니다.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
