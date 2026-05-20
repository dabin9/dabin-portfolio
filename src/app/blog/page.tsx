import Link from "next/link";
import type { Metadata } from "next";
import { notes } from "@/data/notes";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Notes",
  description: `${site.name} 의 작업 기록 모음`
};

export default function BlogIndexPage() {
  return (
    <section className="bg-bg">
      <div className="wrap pt-16 md:pt-24 pb-24">
        <div className="grid md:grid-cols-12 gap-8 md:gap-14 border-b border-line pb-8">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase text-muted">
              Notes / All
            </p>
          </div>
          <div className="md:col-span-9">
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-ink">
              Notes Archive
            </h1>
            <div className="mt-4 max-w-[58ch] space-y-2 text-[15px] md:text-[16px] leading-8 text-inkMuted">
              {site.blogIntro.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <ol className="divide-y divide-line">
          {notes.map((post, index) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                data-cursor="label=READ"
                className="group grid md:grid-cols-12 gap-5 md:gap-8 py-8"
              >
                <span className="md:col-span-2 font-mono text-[13px] text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-7">
                  <p className="font-mono text-[12px] uppercase text-muted">
                    {formatDate(post.date)} / {post.readTime}
                  </p>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl leading-tight text-ink group-hover:text-brand">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-[14px] md:text-[15px] leading-7 text-inkMuted">
                    {post.excerpt}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="md:col-span-3 md:justify-self-end font-mono text-[13px] text-muted group-hover:text-ink"
                >
                  Read
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(iso));
}
