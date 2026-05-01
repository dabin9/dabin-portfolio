import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  fetchTistoryArticle,
  fetchTistoryPosts
} from "@/lib/tistory";
import { env } from "@/lib/env";

type Params = { id: string };

export const revalidate = 1800; // 30분

export async function generateStaticParams() {
  if (!env.tistory) return [];
  const posts = await fetchTistoryPosts(env.tistory, 30);
  return posts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!env.tistory) return { title: "Blog" };
  const article = await fetchTistoryArticle(env.tistory, id);
  if (!article) return { title: "Blog" };
  return {
    title: article.title,
    openGraph: {
      title: article.title,
      images: article.image ? [article.image] : undefined,
      type: "article",
      publishedTime: article.date || undefined
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  if (!env.tistory) notFound();

  const article = await fetchTistoryArticle(env.tistory, id);
  if (!article) notFound();

  return (
    <article className="bg-bg">
      <div className="wrap py-20 md:py-28 max-w-[760px] mx-auto">
        <div className="mb-10">
          <Link
            href="/blog"
            data-cursor="link"
            className="inline-flex items-center gap-1 text-[13px] text-inkMuted hover:text-ink"
          >
            <span aria-hidden>←</span> Blog
          </Link>
        </div>

        <header className="mb-12">
          <p className="text-[12px] tracking-[0.3em] text-muted uppercase">
            {formatDate(article.date)}
          </p>
          <h1
            className="mt-4 font-display font-medium leading-[1.25] tracking-tightest"
            style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)" }}
          >
            {article.title}
          </h1>
        </header>

        <div
          className="tistory-content text-[16px] md:text-[17px] leading-[1.85] text-ink"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        <footer className="mt-16 pt-8 border-t border-line flex flex-wrap items-center justify-between gap-4 text-[13px]">
          <Link
            href="/blog"
            data-cursor="link"
            className="text-inkMuted hover:text-ink inline-flex items-center gap-1"
          >
            <span aria-hidden>←</span> 다른 글 보기
          </Link>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            data-cursor="link"
            className="text-inkMuted hover:text-ink inline-flex items-center gap-1"
          >
            티스토리 원문 <span aria-hidden>↗</span>
          </a>
        </footer>
      </div>
    </article>
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
