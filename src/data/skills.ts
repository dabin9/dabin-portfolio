/**
 * 보유 기술 스택.
 * 아카이브형 홈에서는 아이콘 대신 텍스트 테이블로 보여줍니다.
 */
export const skillGroups = [
  {
    title: "Core",
    items: ["HTML", "CSS", "JavaScript", "TypeScript"]
  },
  {
    title: "Frontend",
    items: ["React", "Responsive UI", "Interaction"]
  },
  {
    title: "CMS Integration",
    items: ["PHP", "GnuBoard", "Admin Data Binding"]
  },
  {
    title: "Tools",
    items: ["Git", "Figma", "Notion", "Vercel"]
  }
] as const;

export const marqueeSkills: string[] = skillGroups.flatMap((g) => g.items);
