export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  readTime: string; // "6분"
  tags: string[];
  /**
   * 본문은 MD 대신 일단 하드코딩된 문단 배열로 관리합니다.
   * 나중에 CMS/MDX 로 옮기기 쉽게, 렌더 시 단순 문단만 가정합니다.
   */
  body: string[];
};

export const insights: Insight[] = [
  {
    slug: "design-tokens-as-contract",
    title: "디자인 토큰을, 팀 사이의 계약서처럼 다룬다는 것",
    excerpt:
      "토큰을 '변수 이름 모음' 정도로 다루면 금세 무너진다. 토큰을 팀 간 계약서로 다뤘을 때 무엇이 달라졌는지 정리.",
    date: "2024-11-02",
    readTime: "8분",
    tags: ["design-system", "tokens"],
    body: [
      "처음에는 Primary/Secondary/Gray-500 같은 이름부터 시작했다. 잘 동작하는 것처럼 보였지만, 프로덕트가 늘어나자 같은 토큰이 제품마다 다른 의미로 소비되었다.",
      "그래서 토큰을 '의미'와 '원시값' 두 층으로 나누고, 의미 레이어를 디자이너와 함께 관리하는 계약서로 취급했다. PR 리뷰에 디자이너가 자연스럽게 참여하기 시작했고, 시맨틱 토큰의 추가/변경이 시스템 단위의 결정으로 다뤄지기 시작했다.",
      "결과적으로 가장 크게 바뀐 건 코드가 아니라 '대화의 단위'였다. 색상 하나를 바꾸는 이야기가, 무엇이 강조되어야 하는지에 대한 대화로 바뀌었다."
    ]
  },
  {
    slug: "rsc-mental-model",
    title: "RSC 를 '서버 템플릿'이 아니라 '데이터 경계'로 이해하기",
    excerpt:
      "React Server Components 를 처음 도입할 때 가장 큰 방해물은 습관이다. 'use client' 를 어디에 둘지 결정하는 내 기준.",
    date: "2024-08-14",
    readTime: "6분",
    tags: ["react", "next.js", "architecture"],
    body: [
      "RSC 를 단순히 '서버에서 렌더링되는 컴포넌트' 로 이해하면 금방 한계에 부딪힌다. 오히려 'use client' 경계를 '상호작용이 필요한 최소 섬(island)' 으로 보는 편이 설계가 쉬워졌다.",
      "페이지 단위로 서버 컴포넌트를 유지하고, 인터랙션이 필요한 곳만 얇게 클라이언트 컴포넌트로 노출한다. 이 관점이 자리 잡으니 데이터 패칭 위치 선택이 훨씬 단순해졌다.",
      "대부분의 상태는 서버 컴포넌트에 올라가 있고, 클라이언트 컴포넌트는 이벤트와 애니메이션만 다룬다. 이 단순한 규칙이 팀 전체의 러닝커브를 크게 줄였다."
    ]
  },
  {
    slug: "animation-is-information",
    title: "애니메이션은 장식이 아니라 정보다",
    excerpt:
      "'과한 애니메이션' 과 '부족한 애니메이션' 사이 어딘가에, 사용자가 인터페이스를 이해하는 데 꼭 필요한 최소한이 있다.",
    date: "2024-05-21",
    readTime: "5분",
    tags: ["ux", "motion"],
    body: [
      "인터랙션에 모션을 붙이는 이유는 '멋있어서' 가 아니라, 사용자가 방금 일어난 일을 이해하기 위해서다. 상태가 바뀌었는데 아무 신호가 없으면 사용자는 다시 클릭한다.",
      "반대로 애니메이션이 너무 화려하면 정보로서의 가치는 사라지고 장식만 남는다. 내가 따르는 가이드는 단순하다 — 이 모션이 사라져도 사용자가 혼란스럽지 않다면, 그 모션은 필요하지 않은 것이다.",
      "정말 필요한 몇 개의 모션을 공들여 만드는 편이, 모든 요소를 애니메이션으로 도배하는 것보다 훨씬 제품답게 느껴진다."
    ]
  }
];

export function getInsight(slug: string) {
  return insights.find((p) => p.slug === slug);
}
