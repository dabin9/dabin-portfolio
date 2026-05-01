import { notFound } from "next/navigation";
import Link from "next/link";
import { getInsight, insights } from "@/data/insights";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return insights.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function InsightPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) notFound();

  const i = insights.findIndex((p) => p.slug === post.slug);
  const next = insights[(i + 1) % insights.length];

  return (
    <article>
      <div className="wrap pt-14 md:pt-20 pb-20">
        <div className="mx-auto max-w-[680px]">
          <Link
            href="/insights"
            data-cursor="link"
            className="text-[13px] text-muted hover:text-ink inline-block"
          >
            ← Insights
          </Link>

          <header className="mt-8 border-b border-line pb-10">
            <p className="text-[13px] text-muted">
              {formatDate(post.date)} · {post.readTime}
            </p>
            <h1
              className="mt-4 font-display font-semibold leading-[1.18] tracking-tightest"
              style={{ fontSize: "clamp(2rem, 4.4vw, 3.25rem)" }}
            >
              {post.title}
            </h1>
            <p className="mt-6 text-[17px] text-inkMuted leading-[1.82]">
              {post.excerpt}
            </p>
          </header>

          <div className="mt-10 space-y-7 text-[17px] md:text-[18px] leading-[1.9] text-ink prose-ink">
            {post.body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="mt-14 pt-6 border-t border-line flex flex-wrap gap-4 text-[13px] text-muted">
            {post.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        </div>
      </div>

      <nav className="border-t border-line">
        <div className="wrap py-8">
          <div className="mx-auto max-w-[680px] flex items-center justify-between gap-6">
            <Link
              href="/insights"
              data-cursor="link"
              className="text-[13px] text-muted hover:text-ink"
            >
              ← 모든 글
            </Link>
            <Link
              href={`/insights/${next.slug}`}
              data-cursor="link"
              className="group text-right min-w-0"
            >
              <p className="text-[12px] text-muted">Next</p>
              <p className="mt-1 text-[15px] group-hover:text-brand truncate">
                {next.title} →
              </p>
            </Link>
          </div>
        </div>
      </nav>
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
