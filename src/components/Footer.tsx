import Link from "next/link";
import { site } from "@/data/site";
import { env } from "@/lib/env";

export default function Footer() {
  const year = new Date().getFullYear();
  const links = [
    env.github && { label: "GitHub", href: env.github },
    env.linkedin && { label: "LinkedIn", href: env.linkedin },
    env.blog && { label: "Blog", href: env.blog },
    env.email && { label: "Email", href: `mailto:${env.email}` }
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="border-t border-line">
      <div className="wrap py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <p
            className="font-display font-semibold leading-[1.16] tracking-tightest max-w-[22ch]"
            style={{ fontSize: "clamp(1.5rem, 2.2vw, 2.25rem)" }}
          >
            함께 만들어 보고 <span className="font-serif-italic text-brand">싶은 게</span> 있다면 —
          </p>
          <Link
            href={`mailto:${env.email}`}
            data-cursor="link"
            className="mt-3 inline-block text-[14px] text-inkMuted hover:text-ink underline underline-offset-[6px] decoration-ink/30 hover:decoration-ink transition"
          >
            {env.email}
          </Link>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                data-cursor="link"
                className="text-inkMuted hover:text-ink inline-flex items-center gap-1"
              >
                {l.label}
                <span aria-hidden className="text-muted">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap pb-10 flex items-center justify-between text-[12px] text-muted">
        <span>© {year} {site.name} · 키보드 팔레트는 <kbd className="font-mono border border-line px-1">⌘K</kbd></span>
        <span>{site.location}</span>
      </div>
    </footer>
  );
}
