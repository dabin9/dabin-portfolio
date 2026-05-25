export type AgentIntentType = "info" | "project" | "action";

export type AgentInfoIntent = "profile" | "skills" | "strengths" | "contact";
export type AgentProjectIntent = "featured" | "project_search";
export type AgentActionIntent = "go_work" | "reset_home";

type BaseAgentDictionaryEntry = {
  type: AgentIntentType;
  intent: AgentInfoIntent | AgentProjectIntent | AgentActionIntent;
  keywords: string[];
  title: string;
};

export type AgentInfoDictionaryEntry = BaseAgentDictionaryEntry & {
  type: "info";
  intent: AgentInfoIntent;
};

export type AgentProjectDictionaryEntry = BaseAgentDictionaryEntry & {
  type: "project";
  intent: AgentProjectIntent;
};

export type AgentActionDictionaryEntry = BaseAgentDictionaryEntry & {
  type: "action";
  intent: AgentActionIntent;
  label: string;
  path?: string;
};

export type AgentDictionaryEntry =
  | AgentInfoDictionaryEntry
  | AgentProjectDictionaryEntry
  | AgentActionDictionaryEntry;

export const agentDictionary: AgentDictionaryEntry[] = [
  {
    type: "action",
    intent: "go_work",
    keywords: [
      "work 보여줘",
      "work 페이지",
      "work 메뉴",
      "works",
      "works index",
      "all works",
      "프로젝트 전체",
      "전체 프로젝트",
      "작업물 전체",
      "작업 목록",
      "작업 리스트",
      "포트폴리오 전체",
      "포트폴리오 보기"
    ],
    title: "Work 페이지",
    label: "Work 페이지로 이동",
    path: "/work"
  },
  {
    type: "action",
    intent: "reset_home",
    keywords: [
      "메인",
      "홈",
      "처음",
      "돌아가기",
      "메인으로",
      "홈으로",
      "처음으로",
      "초기화",
      "리셋",
      "reset",
      "clear"
    ],
    title: "메인 화면",
    label: "메인 화면으로 돌아가기"
  },
  {
    type: "info",
    intent: "profile",
    keywords: [
      "누구",
      "소개",
      "이름",
      "직무",
      "경력",
      "연차",
      "몇 년",
      "무슨 일",
      "개발자",
      "profile",
      "about"
    ],
    title: "박다빈 소개"
  },
  {
    type: "info",
    intent: "skills",
    keywords: [
      "기술",
      "스택",
      "skill",
      "skills",
      "다룰 줄",
      "전체 기술",
      "사용 기술",
      "테크",
      "tech stack"
    ],
    title: "기술 스택"
  },
  {
    type: "info",
    intent: "strengths",
    keywords: [
      "강점",
      "장점",
      "잘하는",
      "주요 강점",
      "역량",
      "특징",
      "strength",
      "strengths"
    ],
    title: "주요 강점"
  },
  {
    type: "info",
    intent: "contact",
    keywords: [
      "연락",
      "연락처",
      "이메일",
      "메일",
      "email",
      "e-mail",
      "github",
      "깃허브",
      "contact",
      "링크"
    ],
    title: "연락처"
  },
  {
    type: "project",
    intent: "featured",
    keywords: [
      "대표",
      "대표 프로젝트",
      "대표 작업",
      "주요",
      "주요 프로젝트",
      "추천",
      "추천 프로젝트",
      "프로젝트 추천",
      "featured",
      "best work",
      "main project"
    ],
    title: "대표 프로젝트"
  },
  {
    type: "project",
    intent: "project_search",
    keywords: [
      "cms",
      "react",
      "리액트",
      "javascript",
      "js",
      "php",
      "gnuboard",
      "그누보드",
      "admin",
      "관리자",
      "responsive",
      "반응형",
      "automation",
      "자동화",
      "frontend",
      "프론트",
      "프론트엔드",
      "대시보드",
      "dashboard"
    ],
    title: "프로젝트 검색"
  }
];

export const agentRecommendedKeywords = [
  "대표 프로젝트",
  "기술 스택",
  "CMS 경험",
  "React 경험",
  "JavaScript 프로젝트",
  "연락처"
] as const;

export const agentEmptySuggestions = [
  "기술 스택",
  "대표 프로젝트",
  "CMS",
  "React",
  "JavaScript",
  "연락처"
] as const;

export const agentSkillGroups = [
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

export const agentStrengths = [
  "운영자가 직접 관리할 수 있는 CMS 기반 화면 구조 설계",
  "반응형 UI와 동적 렌더링을 함께 고려한 프론트엔드 구현",
  "PHP 템플릿, 게시판 스킨, 관리자 데이터 연동 흐름 정리",
  "반복 구축이 필요한 사이트를 공통 구조로 줄이는 자동화 관점"
] as const;

export const agentSearchAliases = {
  react: ["react", "리액", "리액트"],
  next: ["next", "nextjs", "next.js", "넥스트"],
  cms: ["cms", "관리자", "어드민", "콘텐츠관리", "콘텐츠 관리", "gnuboard", "그누보드", "게시판"],
  admin: ["admin", "운영", "관리자", "어드민"],
  dashboard: ["dashboard", "대시보드", "대쉬보드"],
  responsive: ["responsive", "반응형", "모바일"],
  automation: ["automation", "자동화", "공통화", "반복 구축"],
  frontend: ["frontend", "front end", "프론트", "프론트엔드", "ui"],
  javascript: ["javascript", "js", "자바스크립트", "vanilla js", "vanilla"],
  typescript: ["typescript", "ts", "타입스크립트"],
  php: ["php", "php template", "템플릿"],
  gnuboard: ["gnuboard", "그누보드", "그누보드5"],
  router: ["router", "라우터", "라우팅"],
  gsap: ["gsap", "animation", "애니메이션"],
  swiper: ["swiper", "slider", "슬라이더"]
} as const;
