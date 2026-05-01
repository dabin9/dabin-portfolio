import Link from "next/link";
import { fetchTistoryPosts, type TistoryPost } from "@/lib/tistory";
import { env } from "@/lib/env";
import { site } from "@/data/site";
import Reveal from "./Reveal";

/**
 * Tistory Blog — 베이지 배경 + 중앙 정렬 헤더, RSS 글 목록.
 * 미연결 시 안내 카드를 노출.
 */
export default async function TistoryBlog() {
  const posts = env.tistory ? await fetchTistoryPosts(env.tistory, 6) : [];

  return (
    <section
      id="blog"
      className="border-b border-line"
      style={{ background: "rgb(var(--surface))" }}
    >
      <div className="wrap py-28 md:py-36">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[12px] tracking-[0.4em] text-muted uppercase">
            Blog
          </p>
          <p className="mt-3 font-serif-italic text-[20px] md:text-[24px] text-ink">
            articles you may like
          </p>
          <h2
            className="mt-6 font-display font-medium leading-[1.2] tracking-tightest mx-auto max-w-[22ch]"
            style={{ fontSize: "clamp(1.8rem, 4.4vw, 3rem)" }}
          >
            차곡차곡 쌓아온{" "}
            <span className="font-serif-italic">기록들.</span>
          </h2>
          <div className="mt-6 mx-auto max-w-[58ch] space-y-1 text-[15px] md:text-[16px] leading-[1.85] text-inkMuted">
            {site.blogIntro.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <NotConnected />
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {posts.map((post, i) => (
              <Reveal key={post.link} delay={i * 0.04}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </ul>
        )}

        {env.tistory ? (
          <div className="mt-14 text-center">
            <Link
              href="/blog"
              data-cursor="link"
              className="inline-flex items-center gap-2 text-[13px] text-ink border-b border-ink/30 hover:border-ink pb-1"
            >
              블로그 전체 보기 <span aria-hidden>→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PostCard({ post }: { post: TistoryPost }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      data-cursor="label=READ"
      className="group flex flex-col h-full bg-bg border border-line rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-sm transition"
    >
      <div className="aspect-[16/10] bg-surface relative overflow-hidden">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif-italic text-ink/30 text-[clamp(2rem,4vw,3rem)]">
              {post.title.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[12px] text-muted">{formatDate(post.pubDate)}</p>
        <h3 className="mt-2 font-display font-medium text-[17px] leading-[1.35] tracking-tight line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-2 text-[13px] text-inkMuted leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}
        <span className="mt-auto pt-4 inline-flex items-center gap-1 text-[12px] text-inkMuted group-hover:text-ink">
          읽기 <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
      </div>
    </Link>
  );
}

function NotConnected() {
  return (
    <div className="mx-auto max-w-[60ch] border border-dashed border-line rounded-2xl bg-bg p-8 md:p-10 text-left">
      <p className="text-[12px] tracking-[0.3em] text-muted uppercase">
        Tistory 연동 대기 중
      </p>
      <h3 className="mt-3 font-display font-medium text-[20px] md:text-[22px] leading-snug">
        블로그 RSS 를 연결하면 최신 글이 자동으로 보여요.
      </h3>
      <ol className="mt-6 space-y-2.5 text-[14px] text-inkMuted leading-relaxed">
        <li>
          1. 프로젝트 루트에 <code className="font-mono text-ink">.env.local</code> 파일을 만들어 주세요.
        </li>
        <li>
          2. 한 줄 추가 — <code className="font-mono text-ink">NEXT_PUBLIC_TISTORY_NAME=내블로그이름</code>
          <span className="block text-[13px] text-muted mt-1">
            (블로그 주소가 <code className="font-mono">myblog.tistory.com</code> 이면{" "}
            <code className="font-mono">myblog</code> 만)
          </span>
        </li>
        <li>3. 개발 서버 재시작 — 30분 캐시로 자동 갱신됩니다.</li>
      </ol>
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
