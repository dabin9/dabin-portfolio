import { site } from "@/shared/config/site";

export default function About() {
  return (
    <section
      id="about"
      className="border-b border-line"
      style={{ background: "rgb(var(--surface))" }}
    >
      <div className="wrap py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-8 md:gap-14">
          <div className="md:col-span-3">
            <p className="font-mono text-[12px] uppercase text-muted">
              Profile Note
            </p>
          </div>

          <div className="md:col-span-6">
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-ink">
              운영과 구현 사이를 정리하는 프론트엔드 개발자
            </h2>
            <div className="mt-7 space-y-4 text-[15px] md:text-[16px] leading-8 text-inkMuted">
              {site.bio.slice(1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <dl className="md:col-span-3 border-t border-line text-[13px]">
            <ArchiveMeta label="Current" value={site.role} />
            <ArchiveMeta label="Location" value={site.location} />
            <ArchiveMeta label="Archive" value="Works / Notes / CMS" />
          </dl>
        </div>
      </div>
    </section>
  );
}

function ArchiveMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line py-4">
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
