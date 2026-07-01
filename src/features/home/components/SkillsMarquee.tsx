import { skillGroups } from "@/features/home/data/skills";

export default function SkillsMarquee() {
  return (
    <section id="stack" className="bg-bg border-b border-line">
      <div className="wrap py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-8 md:gap-14">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase text-muted">
              Skills
            </p>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-ink">
              Working Stack
            </h2>
            <div className="mt-8 border-t border-line">
              {skillGroups.map((group) => (
                <div
                  key={group.title}
                  className="grid md:grid-cols-[180px_1fr] gap-3 md:gap-8 border-b border-line py-5"
                >
                  <p className="font-mono text-[12px] uppercase text-muted">
                    {group.title}
                  </p>
                  <p className="text-[15px] md:text-[16px] leading-8 text-ink">
                    {group.items.join(" / ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
