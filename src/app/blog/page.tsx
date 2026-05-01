import Link from "next/link";
import type { Metadata } from "next";
import { fetchTistoryPosts } from "@/lib/tistory";
import { env } from "@/lib/env";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `${site.name} 의 블로그 글 모음`
};

export const revalidate = 1800; // 30분

export default async function BlogIndexPage() {
  const posts = env.tistory ? await fetchTistoryPosts(env.tistory, 60) : [];

  return (
    <section className="bg-bg">
      <div className="wrap py-24 md:py-32">
        <div className="text-center mb-14 md:mb-20">
          <p className="text-[12px] tracking-[0.4em] text-muted uppercase">Blog</p>
          <h1
            className="mt-6 font-display font-medium leading-[1.2] tracking-tightest mx-auto max-w-[24ch]"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.2rem)" }}
          >
            차곡차곡 쌓아온 <span className="font-serif-italic">기록들.</span>
          </h1>
          <div className="mt-6 mx-auto max-w-[58ch] space-y-1 text-[15px] text-inkMuted leading-[1.85]">
            {site.blogIntro.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <NotConnected />
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/blog/${p.id}`}
                  data-cursor="label=READ"
                  className="group flex flex-col h-full bg-bg border border-line rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-sm transition"
                >
                  <div className="aspect-[16/10] bg-surface relative overflow-hidden">
                    {p.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbnail}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif-italic text-ink/30 text-[clamp(2rem,4vw,3rem)]">
                          {p.title.slice(0, 1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-[12px] text-muted">{formatDate(p.pubDate)}</p>
                    <h2 className="mt-2 font-display font-medium text-[17px] leading-[1.35] tracking-tight line-clamp-2">
                      {p.title}
                    </h2>
                    {p.excerpt ? (
                      <p className="mt-2 text-[13px] text-inkMuted leading-relaxed line-clamp-3">
                        {p.excerpt}
                      </p>
                    ) : null}
                    <span className="mt-auto pt-4 inline-flex items-center gap-1 text-[12px] text-inkMuted group-hover:text-ink">
                      읽기 <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {env.tistory ? (
          <div className="mt-16 text-center">
            <a
              href={env.tistory}
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="inline-flex items-center gap-2 text-[13px] text-inkMuted hover:text-ink"
            >
              티스토리 원문에서 보기 <span aria-hidden>↗</span>
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NotConnected() {
  return (
    <div className="mx-auto max-w-[60ch] border border-dashed border-line rounded-2xl bg-bg p-8 md:p-10 text-left">
      <p className="text-[12px] tracking-[0.3em] text-muted uppercase">
        Tistory 연동 대기 중
      </p>
      <h3 className="mt-3 font-display font-medium text-[20px] md:text-[22px] leading-snug">
        블로그 RSS 를 연결하면 글 목록이 자동으로 보여요.
      </h3>
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(iso));
}
