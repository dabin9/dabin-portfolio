import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNote, notes } from "@/data/notes";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return notes.map((post) => ({ id: post.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getNote(id);
  if (!post) return { title: "Notes" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const post = getNote(id);
  if (!post) notFound();

  return (
    <article className="bg-bg">
      <div className="wrap py-20 md:py-28 max-w-[760px] mx-auto">
        <div className="mb-10">
          <Link
            href="/blog"
            data-cursor="link"
            className="font-mono text-[12px] uppercase text-muted hover:text-ink"
          >
            Back to Notes
          </Link>
        </div>

        <header className="mb-12">
          <p className="font-mono text-[12px] uppercase text-muted">
            {formatDate(post.date)} / {post.readTime}
          </p>
          <h1 className="mt-4 font-display text-3xl md:text-5xl leading-tight text-ink">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 font-mono text-[11px] uppercase text-muted">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </header>

        <div className="rich-content text-[16px] md:text-[17px] leading-[1.85] text-ink">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-line text-[13px]">
          <Link
            href="/blog"
            data-cursor="link"
            className="font-mono text-[12px] uppercase text-inkMuted hover:text-ink"
          >
            Other Notes
          </Link>
        </footer>
      </div>
    </article>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(iso));
}
