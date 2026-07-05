import type { PlaygroundItem } from "@/entities/playground";

type Props = {
  items: PlaygroundItem[];
};

export default function PlaygroundSection({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section id="playground" className="scroll-mt-24 bg-bg">
      <div className="wrap py-20 md:py-28">
        <div className="grid gap-8 border-b border-line pb-8 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase text-muted">
              Playground
            </p>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">
              Playground
            </h2>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-8 text-inkMuted md:text-[16px]">
              작은 실험과 외부 링크를 가볍게 모아둔 공간입니다.
            </p>
          </div>
        </div>

        <div className="grid gap-5 pt-8 md:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target={isExternalLink(item.link) ? "_blank" : undefined}
              rel={isExternalLink(item.link) ? "noopener noreferrer" : undefined}
              data-cursor="label=OPEN"
              className="group grid overflow-hidden border border-line bg-bg md:grid-cols-[0.95fr_1.05fr]"
            >
              <div
                className="relative overflow-hidden bg-surface"
                style={{ aspectRatio: "16/11" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex min-w-0 flex-col justify-between p-5 md:p-6">
                <div>
                  <h3 className="font-display text-[26px] leading-tight text-ink group-hover:text-brand md:text-[32px]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[14px] leading-7 text-inkMuted md:text-[15px]">
                    {item.description}
                  </p>
                </div>
                <span className="mt-7 font-mono text-[12px] uppercase text-muted group-hover:text-ink">
                  Open
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function isExternalLink(link: string): boolean {
  return /^https?:\/\//i.test(link);
}
