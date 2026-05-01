/**
 * 보유 기술 스택.
 * 카테고리별로 묶어 두었고, Marquee / Grid 양쪽에서 모두 사용됩니다.
 */
export const skillGroups = [
  {
    title: "Language",
    items: ["TypeScript", "JavaScript (ES2023)", "HTML5", "CSS3"]
  },
  {
    title: "Framework",
    items: ["React", "Next.js", "Remix", "Vue (기초)"]
  },
  {
    title: "Styling",
    items: ["Tailwind CSS", "CSS Modules", "styled-components", "SCSS", "Radix UI"]
  },
  {
    title: "State & Data",
    items: ["Zustand", "TanStack Query", "SWR", "Redux Toolkit"]
  },
  {
    title: "Tooling",
    items: ["Vite", "Turborepo", "pnpm", "ESLint", "Prettier"]
  },
  {
    title: "Testing",
    items: ["Vitest", "Jest", "React Testing Library", "Playwright"]
  },
  {
    title: "Design & Ops",
    items: ["Figma", "Storybook", "Vercel", "GitHub Actions", "Sentry"]
  }
] as const;

export const marqueeSkills: string[] = skillGroups.flatMap((g) => g.items);
