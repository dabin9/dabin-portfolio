import { env } from "@/lib/env";

export default function Footer() {
  const externalLinks = [
    env.github && { label: "GitHub", href: env.github }
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer
      className="border-t border-line"
      style={{ background: "rgb(var(--ink))", color: "rgb(var(--bg))" }}
    >
      <div className="wrap min-h-[60px] py-3 flex items-center gap-5 overflow-x-auto whitespace-nowrap font-mono text-[11px] uppercase">
        <p className="shrink-0 opacity-55">© 2026 Dabin Park</p>
        <p className="shrink-0 opacity-55">Frontend Developer · Seoul, South Korea</p>
        {externalLinks.length > 0 ? (
          <nav
            aria-label="외부 링크"
            className="ml-auto shrink-0 flex items-center gap-4 opacity-75"
          >
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="hover:opacity-100"
              >
                {link.label} ↗
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
