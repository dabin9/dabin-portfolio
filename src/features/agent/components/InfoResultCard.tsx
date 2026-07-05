import { agentSkillGroups, agentStrengths, type AgentInfoIntent } from "@/features/agent/model/agentDictionary";
import { site } from "@/shared/config/site";
import { env } from "@/shared/config/env";

type InfoResultCardProps = {
  intent: AgentInfoIntent;
  projectCount: number;
};

export default function InfoResultCard({ intent, projectCount }: InfoResultCardProps) {
  if (intent === "skills") return <SkillsCard />;
  if (intent === "contact") return <ContactCard />;
  if (intent === "careers") return <CareersCard />;
  if (intent === "strengths") return <StrengthsCard />;
  return <ProfileCard projectCount={projectCount} />;
}

function ProfileCard({ projectCount }: { projectCount: number }) {
  return (
    <article className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6">
      <p className="font-mono text-[11px] uppercase text-muted">Info Result</p>
      <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
        박다빈 소개
      </h3>
      <dl className="mt-5 divide-y divide-line text-[14px] leading-7 md:text-[15px]">
        <InfoRow label="Name" value={`${site.name} / ${site.nameEn}`} />
        <InfoRow label="Role" value={site.role} />
        <InfoRow label="Experience" value={`${site.year} years`} />
        <InfoRow label="Work" value={`공개 프로젝트 ${projectCount}개 / 누적 작업 ${site.projects}`} />
        <InfoRow label="Base" value={site.location} />
        <InfoRow label="Focus" value="Responsive UI / CMS / Admin Data Flow" />
      </dl>
      <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[14px] leading-7 text-inkMuted md:text-[15px]">
        {agentStrengths.slice(0, 3).map((strength) => (
          <li key={strength}>{strength}</li>
        ))}
      </ul>
    </article>
  );
}

function SkillsCard() {
  return (
    <article className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6">
      <p className="font-mono text-[11px] uppercase text-muted">Info Result</p>
      <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
        기술 스택
      </h3>
      <div className="mt-5 divide-y divide-line">
        {agentSkillGroups.map((group) => (
          <section key={group.title} className="py-4 first:pt-0 last:pb-0">
            <h4 className="font-mono text-[12px] uppercase text-muted">{group.title}</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-8 items-center rounded-full border border-line bg-surface px-3 text-[13px] text-inkMuted"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function StrengthsCard() {
  return (
    <article className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6">
      <p className="font-mono text-[11px] uppercase text-muted">Info Result</p>
      <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
        주요 강점
      </h3>
      <ul className="mt-5 divide-y divide-line text-[14px] leading-7 text-inkMuted md:text-[15px]">
        {agentStrengths.map((strength) => (
          <li key={strength} className="py-3 first:pt-0 last:pb-0">
            {strength}
          </li>
        ))}
      </ul>
    </article>
  );
}

function CareersCard() {
  const careers = [
    {
      company: "코디웍스",
      role: "프론트엔드 개발자 · 개발팀 매니징 겸임",
      period: "2023.07 ~ 2026.05",
      points: [
        "React 기반 운영 대시보드·CMS의 데이터 중심 어드민 UI 설계 및 개발",
        "다중 필터, 계층형 데이터, 검색 흐름을 고려한 컴포넌트 구조 설계",
        "공통 컴포넌트와 템플릿 구조로 다수 운영 사이트 구축·유지보수"
      ]
    },
    {
      company: "호나",
      role: "웹 퍼블리셔",
      period: "2022.01 ~ 2023.03",
      points: [
        "Figma 시안 기반 신규·리뉴얼 웹사이트 반응형 UI 퍼블리싱",
        "SCSS·JavaScript 기반 커스텀 인터랙션 구현 및 Git 형상 관리"
      ]
    }
  ];

  return (
    <article className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6">
      <p className="font-mono text-[11px] uppercase text-muted">Info Result</p>
      <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
        경력 요약
      </h3>
      <div className="mt-5 divide-y divide-line">
        {careers.map((career) => (
          <section key={career.company} className="py-5 first:pt-0 last:pb-0">
            <div className="grid gap-1 md:grid-cols-[140px_1fr]">
              <p className="font-mono text-[12px] uppercase text-muted">{career.period}</p>
              <div>
                <h4 className="text-[17px] font-semibold leading-7 text-ink">
                  {career.company}
                </h4>
                <p className="text-[14px] leading-7 text-inkMuted md:text-[15px]">
                  {career.role}
                </p>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-[14px] leading-7 text-inkMuted md:ml-[140px] md:text-[15px]">
              {career.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

function ContactCard() {
  const links = [
    env.email
      ? {
          label: "Email",
          value: env.email,
          href: `mailto:${env.email}`,
          external: false
        }
      : null,
    env.github
      ? {
          label: "GitHub",
          value: env.github,
          href: env.github,
          external: true
        }
      : null
  ].filter(Boolean) as {
    label: string;
    value: string;
    href: string;
    external: boolean;
  }[];

  return (
    <article className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6">
      <p className="font-mono text-[11px] uppercase text-muted">Info Result</p>
      <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
        연락처
      </h3>
      <p className="mt-3 text-[14px] leading-7 text-inkMuted md:text-[15px]">
        확인 가능한 연락 채널입니다.
      </p>
      <div className="mt-5 divide-y divide-line">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
            data-cursor="link"
            className="grid gap-1 py-3 text-[14px] transition first:pt-0 last:pb-0 hover:text-brand md:grid-cols-[120px_1fr] md:text-[15px]"
          >
            <span className="font-mono text-[12px] uppercase text-muted">{link.label}</span>
            <span className="truncate text-ink">{link.value}</span>
          </a>
        ))}
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 first:pt-0 last:pb-0 md:grid-cols-[120px_1fr]">
      <dt className="font-mono text-[12px] uppercase text-muted">{label}</dt>
      <dd className="text-inkMuted">{value}</dd>
    </div>
  );
}
