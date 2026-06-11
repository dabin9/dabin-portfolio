/**
 * 보유 기술 스택.
 * 아카이브형 홈에서는 아이콘 대신 텍스트 테이블로 보여줍니다.
 */
export const skillGroups = [
  {
    title: "Core",
    items: ["JavaScript", "TypeScript", "HTML5", "CSS3"]
  },
  {
    title: "Library",
    items: ["React", "React Router", "Swiper.js", "GSAP"]
  },
  {
    title: "Styling",
    items: ["Tailwind", "styled-components", "SCSS"]
  },
  {
    title: "State / Data",
    items: ["상태 관리", "조건부·리스트 렌더링", "CMS 연동", "CRUD"]
  },
  {
    title: "Tools",
    items: ["Git", "Figma"]
  },
  {
    title: "기타",
    items: ["PHP / GnuBoard"]
  }
] as const;

export const marqueeSkills: string[] = skillGroups.flatMap((g) => g.items);
