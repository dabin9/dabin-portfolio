import Link from "next/link";
import { env } from "@/lib/env";
import MagneticLink from "./MagneticLink";

/**
 * ContactCta — 잉크 풀블리드. 한 글자씩 끊은 메일 시그니처.
 */
export default function ContactCta() {
  const links = [
    env.github && { label: "GitHub", href: env.github },
    env.linkedin && { label: "LinkedIn", href: env.linkedin },
    env.tistory && { label: "Tistory", href: env.tistory },
    env.resume && { label: "Résumé", href: env.resume }
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="contact" className="relative">
      <div
        className="relative overflow-hidden"
        style={{ background: "rgb(var(--ink))", color: "rgb(var(--bg))" }}
      >
        <div className="relative wrap py-28 md:py-36 text-center">
          <p className="text-[12px] tracking-[0.4em] opacity-60 uppercase">
            Contact
          </p>
          <p className="mt-3 font-serif-italic text-[20px] md:text-[24px] opacity-90">
            knock knock
          </p>

          <h2
            className="mt-6 font-display font-medium leading-[1.15] tracking-tightest mx-auto max-w-[20ch]"
            style={{ fontSize: "clamp(2rem, 5.4vw, 4rem)" }}
          >
            똑똑, <span className="font-serif-italic">함께 일할 사람</span>을
            <br />
            찾고 계신가요?
          </h2>

          <p className="mt-6 text-[16px] md:text-[17px] opacity-80">
            메일은 언제든 환영이에요 🙌
          </p>

          <a
            href={`mailto:${env.email}`}
            data-cursor="link"
            className="mt-6 inline-flex items-center gap-1 text-[15px] md:text-[16px] font-mono opacity-90 hover:opacity-100 underline underline-offset-[6px] decoration-current/40 hover:decoration-current"
          >
            {env.email}
          </a>

          <div className="mt-10 mx-auto max-w-[60ch] text-[15px] md:text-[16px] leading-[1.85] opacity-80 text-left">
            <p>
              역량과 경험을 갖춘 프론트엔드 개발자를 찾고 계신가요? 합류 및 협업
              제안이 있으시다면 언제든지 연락해 주세요! 함께 할 멋진 일에 대해
              메일을 보내주시면 1~2일 내로 답장을 드릴게요.
            </p>
            <p className="mt-4 opacity-70">
              또는 저와 나누고 싶은 얘기가 있으신가요? 포트폴리오나 개발과 관련이
              없는 내용이여도 좋아요. 궁금한 내용이 있다면 편하게 말씀해 주세요 :)
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <MagneticLink
              href={`mailto:${env.email}`}
              data-cursor="label=MAIL"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-[13px] rounded-full transition-colors"
              style={{ background: "rgb(var(--bg))", color: "rgb(var(--ink))" }}
            >
              메일 보내기
              <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </MagneticLink>
            <Link
              href="/contact"
              data-cursor="link"
              className="text-[13px] underline underline-offset-[6px] decoration-current/40 hover:decoration-current"
            >
              연락 폼으로
            </Link>
          </div>

          {links.length > 0 ? (
            <ul className="mt-14 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px]">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="inline-flex items-center gap-1 opacity-80 hover:opacity-100 underline underline-offset-[6px] decoration-current/30 hover:decoration-current"
                  >
                    {l.label}
                    <span aria-hidden className="text-[10px]">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
