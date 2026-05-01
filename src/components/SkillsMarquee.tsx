import { marqueeSkills, skillGroups } from "@/data/skills";

export default function SkillsMarquee() {
  const loop = [...marqueeSkills, ...marqueeSkills];

  return (
    <section id="stack" className="bg-bg border-b border-line">
      <div className="wrap pt-28 md:pt-32 pb-14 text-center">
        <p className="text-[12px] tracking-[0.4em] text-muted uppercase">
          Craft &amp; System
        </p>
        <p className="mt-3 font-serif-italic text-[20px] md:text-[24px] text-ink">
          tools i love working with
        </p>
        <h2
          className="mt-6 font-display font-medium leading-[1.2] tracking-tightest mx-auto max-w-[22ch]"
          style={{ fontSize: "clamp(1.8rem, 4.4vw, 3rem)" }}
        >
          유행보다 <span className="font-serif-italic">문제</span>,
          <br />
          그 위에 시스템.
        </h2>
      </div>

      <div className="mask-fade-x overflow-hidden border-y border-line">
        <div
          className="flex gap-12 whitespace-nowrap animate-marquee py-5 will-change-transform text-[15px] text-inkMuted"
          style={{ width: "max-content" }}
          aria-hidden
        >
          {loop.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-12">
              {s}
              <span className="text-lineStrong">·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="wrap py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-x-14 max-w-[1000px] mx-auto">
          {skillGroups.map((g) => (
            <div key={g.title}>
              <p className="text-[13px] text-ink mb-3 font-serif-italic">{g.title}</p>
              <ul className="space-y-1.5 text-[14px] text-inkMuted">
                {g.items.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
