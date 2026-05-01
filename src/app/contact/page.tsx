import Link from "next/link";
import { env } from "@/lib/env";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  const links = [
    env.github && { label: "GitHub", href: env.github },
    env.linkedin && { label: "LinkedIn", href: env.linkedin },
    env.blog && { label: "Blog", href: env.blog },
    env.resume && { label: "Resume", href: env.resume }
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section>
      <div className="wrap pt-14 md:pt-20 pb-24">
        <p className="text-[13px] text-muted flex items-center gap-3">
          <span>C</span>
          <span className="w-5 h-px bg-ink/40" />
          <span>Contact</span>
        </p>
        <h1
          className="mt-4 font-display font-semibold leading-[1.08] tracking-tightest max-w-[18ch]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
        >
          무엇이든, <span className="font-serif-italic text-brand">적어</span> 주세요.
        </h1>
        <p className="mt-5 text-[15px] text-inkMuted max-w-[54ch] leading-relaxed">
          채용 · 외주 · 커피챗 모두 환영합니다. 답장은 보통 1 영업일 내에 드립니다.
        </p>

        <div className="mt-12 md:mt-16 grid md:grid-cols-12 gap-10 md:gap-14">
          <aside className="md:col-span-4 order-2 md:order-1">
            <p className="text-[13px] text-muted">이메일</p>
            <Link
              href={`mailto:${env.email}`}
              data-cursor="link"
              className="mt-2 inline-block font-display font-semibold text-xl md:text-2xl tracking-tight hover:text-brand break-all"
            >
              {env.email}
            </Link>

            <p className="mt-10 text-[13px] text-muted">링크</p>
            <ul className="mt-3 space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="text-[14px] text-inkMuted hover:text-ink inline-flex items-center gap-1"
                  >
                    {l.label}
                    <span className="text-muted">↗</span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-[13px] text-muted">활동 가능</p>
            <p className="mt-2 text-[14px] text-inkMuted leading-relaxed">
              Seoul, KST (UTC+9).
              <br />
              신규 프로젝트 / 포지션 모두 가능.
            </p>
          </aside>

          <div className="md:col-span-8 order-1 md:order-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
