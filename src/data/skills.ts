/**
 * 보유 기술 스택.
 * 아카이브형 홈에서는 아이콘 대신 텍스트 테이블로 보여줍니다.
 */
export const skillGroups = [
  {
    title: "Core",
    items: ["HTML5", "CSS3", "JavaScript", "PHP", "TypeScript"]
  },
  {
    title: "Frameworks",
    items: ["React", "Swiper.js", "GSAP", "three.js"]
  },
  {
    title: "Styling",
    items: ["SCSS", "Tailwind CSS", "styled-components", "CSS Modules"]
  },
  {
    title: "Tools",
    items: ["Git / GitHub", "Figma", "Photoshop", "Codex", "Gemini"]
  }
] as const;

export const marqueeSkills: string[] = skillGroups.flatMap((g) => g.items);
