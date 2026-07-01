import { plainText } from "@/shared/lib/plainText";

export type QaSearchProject = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  role: string;
  company?: string;
  stack: string[];
  tags?: string[];
  highlights: string[];
  searchText?: string;
  order?: number;
};

export type RankedQaProject = QaSearchProject & { score: number };

const SEARCH_ALIASES = {
  react: ["react", "리액", "리액트"],
  next: ["next", "nextjs", "next.js", "넥스트"],
  cms: ["cms", "관리자", "어드민", "콘텐츠관리", "콘텐츠 관리"],
  admin: ["admin", "운영", "관리자", "어드민"],
  dashboard: ["dashboard", "대시보드", "대쉬보드"],
  responsive: ["responsive", "반응형"],
  automation: ["automation", "자동화"],
  frontend: ["frontend", "front end", "프론트", "프론트엔드"],
  javascript: ["javascript", "js", "자바스크립트"],
  php: ["php"],
  router: ["router", "라우터", "라우팅"]
} as const;

export function rankQaProjects(
  list: QaSearchProject[],
  query: string
): RankedQaProject[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const queryTokens = expandSearchTerms(query);

  return list
    .map((project) => {
      const haystack = expandSearchText(
        [
          project.slug,
          project.title,
          project.summary,
          project.year,
          project.role,
          project.company ?? "",
          project.stack.join(" "),
          (project.tags ?? []).join(" "),
          project.highlights.join(" "),
          project.searchText ?? ""
        ].join(" ")
      );
      const haystackTokens = haystack.split(" ").filter(Boolean);
      let score = haystack.includes(normalizedQuery) ? 8 : 0;

      for (const token of queryTokens) {
        if (haystack.includes(token)) {
          score += 3;
          continue;
        }
        if (
          haystackTokens.some(
            (candidate) =>
              candidate.length >= 3 &&
              (candidate.includes(token) || token.includes(candidate))
          )
        ) {
          score += 2;
        }
      }

      return { ...project, score };
    })
    .filter((project) => project.score > 0)
    .sort((a, b) => b.score - a.score || (a.order ?? 0) - (b.order ?? 0));
}

export function textMatchesQaQuery(value: string, query: string): boolean {
  const terms = expandSearchTerms(query);
  if (terms.length === 0) return false;

  const haystack = expandSearchText(value);
  const haystackTokens = haystack.split(" ").filter(Boolean);

  return terms.some(
    (term) =>
      haystack.includes(term) ||
      haystackTokens.some(
        (candidate) =>
          candidate.length >= 3 &&
          (candidate.includes(term) || term.includes(candidate))
      )
  );
}

function expandSearchText(value: string): string {
  return uniqueTerms([
    normalize(value),
    ...expandSearchTerms(value)
  ]).join(" ");
}

function expandSearchTerms(value: string): string[] {
  const normalized = normalize(value);
  if (!normalized) return [];

  const terms = normalized.split(" ").filter((token) => token.length >= 2);
  const expanded = [...terms];

  for (const term of terms) {
    for (const [canonical, aliases] of Object.entries(SEARCH_ALIASES)) {
      if (
        term === canonical ||
        term.includes(canonical) ||
        aliases.some((alias) => {
          const normalizedAlias = normalize(alias);
          return (
            term === normalizedAlias ||
            term.includes(normalizedAlias) ||
            normalizedAlias.includes(term)
          );
        })
      ) {
        expanded.push(canonical, ...aliases.map(normalize));
      }
    }
  }

  return uniqueTerms(expanded);
}

function uniqueTerms(terms: string[]): string[] {
  return Array.from(new Set(terms.flatMap((term) => normalize(term).split(" "))))
    .map((term) => term.trim())
    .filter(Boolean);
}

function normalize(value: string): string {
  return plainText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
