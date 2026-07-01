import {
  agentDictionary,
  agentEmptySuggestions,
  agentSearchAliases,
  type AgentActionIntent,
  type AgentInfoIntent
} from "@/features/agent/model/agentDictionary";
import { plainText } from "@/shared/lib/plainText";

export type AgentProject = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  role: string;
  company?: string;
  stack: string[];
  tags?: string[];
  highlights: string[];
  resultItems?: string[];
  description?: string;
  searchText?: string;
  featured?: boolean;
  order?: number;
};

export type RankedAgentProject = AgentProject & {
  score: number;
  displaySummary: string;
  matchReasons: string[];
};

export type AgentResolvedResult =
  | {
      kind: "info";
      intent: AgentInfoIntent;
      title: string;
      query: string;
      message: string;
    }
  | {
      kind: "project";
      title: string;
      query: string;
      message: string;
      projects: RankedAgentProject[];
    }
  | {
      kind: "action";
      intent: AgentActionIntent;
      title: string;
      query: string;
      message: string;
      label: string;
      path?: string;
    }
  | {
      kind: "empty";
      query: string;
      message: string;
      suggestions: string[];
    };

export function resolveAgentQuery(
  projects: AgentProject[],
  rawQuery: string
): AgentResolvedResult | null {
  const query = rawQuery.trim();
  const normalizedQuery = normalizeAgentQuery(query);
  if (!normalizedQuery) return null;

  const action = findDictionaryEntry("action", normalizedQuery);
  if (action) {
    return {
      kind: "action",
      intent: action.intent,
      title: action.title,
      query,
      message: getActionMessage(action.intent),
      label: action.label,
      path: action.path
    };
  }

  const info = findDictionaryEntry("info", normalizedQuery);
  if (info) {
    return {
      kind: "info",
      intent: info.intent,
      title: info.title,
      query,
      message: getInfoMessage(info.intent)
    };
  }

  const projectIntent = findDictionaryEntry("project", normalizedQuery);
  const rankedProjects =
    projectIntent?.intent === "featured"
      ? getFeaturedProjects(projects)
      : rankAgentProjects(projects, query);

  if (rankedProjects.length > 0) {
    return {
      kind: "project",
      title: projectIntent?.title ?? "프로젝트 검색",
      query,
      message:
        projectIntent?.intent === "featured"
          ? "질문을 확인했어요. 대표 작업으로 분류된 프로젝트를 모았습니다."
          : `질문을 확인했어요. ${getReadableQueryLabel(query)}와 관련성이 높은 프로젝트를 찾았습니다.`,
      projects: rankedProjects.slice(0, 4)
    };
  }

  return {
    kind: "empty",
    query,
    message:
      "포트폴리오 데이터에서 확인할 수 없는 질문이에요. DABIN AGENT는 박다빈의 작업 기록, 기술 스택, 프로젝트 정보만 검색할 수 있어요.",
    suggestions: [...agentEmptySuggestions]
  };
}

export function rankAgentProjects(
  list: AgentProject[],
  rawQuery: string
): RankedAgentProject[] {
  const normalizedQuery = normalizeAgentQuery(rawQuery);
  if (!normalizedQuery) return [];

  const queryTerms = expandAgentTerms(rawQuery);

  return list
    .map((project) => {
      const fields = getSearchableProjectFields(project);
      const haystack = expandAgentText(fields.map((field) => field.value).join(" "));
      const haystackTokens = haystack.split(" ").filter(Boolean);
      let score = haystack.includes(normalizedQuery) ? 8 : 0;
      const reasonScores = new Map<string, number>();

      for (const term of queryTerms) {
        if (term.length < 2) continue;

        if (haystack.includes(term)) {
          score += 3;
        }

        if (
          haystackTokens.some(
            (candidate) =>
              candidate.length >= 3 &&
              (candidate.includes(term) || term.includes(candidate))
          )
        ) {
          score += 2;
        }

        for (const field of fields) {
          const fieldText = expandAgentText(field.value);
          if (fieldText.includes(term)) {
            score += field.weight;
            reasonScores.set(field.label, (reasonScores.get(field.label) ?? 0) + field.weight);
          }
        }
      }

      if (project.featured && score > 0) score += 1;

      return {
        ...project,
        score,
        displaySummary: getProjectDisplaySummary(project),
        matchReasons: getTopMatchReasons(reasonScores)
      };
    })
    .filter((project) => project.score > 0)
    .sort((a, b) => b.score - a.score || (a.order ?? 0) - (b.order ?? 0));
}

export function normalizeAgentQuery(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.+#]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findDictionaryEntry<T extends "action" | "info" | "project">(
  type: T,
  normalizedQuery: string
) {
  return agentDictionary.find((entry) => {
    if (entry.type !== type) return false;

    return entry.keywords.some((keyword) => {
      const normalizedKeyword = normalizeAgentQuery(keyword);
      if (!normalizedKeyword) return false;
      return (
        normalizedQuery === normalizedKeyword ||
        normalizedQuery.includes(normalizedKeyword)
      );
    });
  }) as Extract<(typeof agentDictionary)[number], { type: T }> | undefined;
}

function getFeaturedProjects(projects: AgentProject[]): RankedAgentProject[] {
  const featured = projects.filter((project) => project.featured);
  const source = featured.length > 0 ? featured : projects.slice(0, 4);

  return source
    .map((project, index) => ({
      ...project,
      score: 100 - index,
      displaySummary: getProjectDisplaySummary(project),
      matchReasons: ["대표 프로젝트", "성과 요약"]
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getActionMessage(intent: AgentActionIntent): string {
  if (intent === "go_work") return "등록된 프로젝트를 확인할 수 있는 Work 페이지로 이동할 수 있어요.";
  if (intent === "go_blog") return "작업 기록과 회고를 모아둔 Blog 페이지로 이동할 수 있어요.";
  return "검색 상태를 초기화하고 DABIN AGENT 첫 화면으로 돌아갈게요.";
}

function getInfoMessage(intent: AgentInfoIntent): string {
  if (intent === "skills") return "박다빈의 주요 기술 스택입니다.";
  if (intent === "contact") return "확인 가능한 연락 채널입니다.";
  if (intent === "careers") return "박다빈의 경력 흐름과 담당 업무를 요약했습니다.";
  if (intent === "strengths") return "포트폴리오 데이터에서 반복적으로 드러나는 주요 강점입니다.";
  return "박다빈의 포트폴리오 기본 정보입니다.";
}

function getReadableQueryLabel(query: string): string {
  const normalized = normalizeAgentQuery(query);
  const alias = Object.entries(agentSearchAliases).find(([canonical, aliases]) => {
    return (
      normalized.includes(canonical) ||
      aliases.some((item) => normalized.includes(normalizeAgentQuery(item)))
    );
  });

  if (alias) return alias[0] === "javascript" ? "JavaScript" : alias[0];
  return `"${query}"`;
}

function getProjectDisplaySummary(project: AgentProject): string {
  const fallback =
    project.resultItems?.[0] ||
    project.highlights[0] ||
    project.searchText ||
    project.description ||
    "작업 구조와 구현 맥락을 상세 페이지에서 확인할 수 있습니다.";

  return stripLineBreaks(plainText(project.summary || fallback)).slice(0, 118);
}

function expandAgentText(value: string): string {
  return uniqueTerms([normalizeAgentQuery(value), ...expandAgentTerms(value)]).join(" ");
}

function expandAgentTerms(value: string): string[] {
  const normalized = normalizeAgentQuery(value);
  if (!normalized) return [];

  const terms = normalized
    .split(" ")
    .filter((token) => token.length >= 2 && !agentQueryStopWords.has(token));
  const expanded = [...terms];

  for (const term of terms) {
    for (const [canonical, aliases] of Object.entries(agentSearchAliases)) {
      if (
        term === canonical ||
        term.includes(canonical) ||
        aliases.some((alias) => {
          const normalizedAlias = normalizeAgentQuery(alias);
          return (
            term === normalizedAlias ||
            term.includes(normalizedAlias) ||
            normalizedAlias.includes(term)
          );
        })
      ) {
        expanded.push(canonical, ...aliases.map(normalizeAgentQuery));
      }
    }
  }

  return uniqueTerms(expanded);
}

const agentQueryStopWords = new Set([
  "있어",
  "있나요",
  "하나요",
  "해봤어",
  "해봤나요",
  "할줄",
  "할수",
  "알아",
  "가능",
  "가능해",
  "보여줘",
  "궁금",
  "관련",
  "경험",
  "프로젝트",
  "작업",
  "작업물",
  "알려줘",
  "해주세요",
  "뭐야",
  "무엇",
  "어떤",
  "있음",
  "가능한",
  "show",
  "tell",
  "about",
  "can",
  "you",
  "have",
  "has",
  "with",
  "work",
  "project",
  "experience"
]);

function getSearchableProjectFields(project: AgentProject) {
  return [
    { label: "프로젝트 제목", weight: 4, value: project.title },
    { label: "기술 스택", weight: 5, value: project.stack.join(" ") },
    { label: "프로젝트 태그", weight: 4, value: (project.tags ?? []).join(" ") },
    { label: "역할·회사", weight: 3, value: [project.role, project.company ?? ""].join(" ") },
    {
      label: "성과 요약",
      weight: 3,
      value: [project.summary, project.highlights.join(" "), project.resultItems?.join(" ") ?? ""].join(" ")
    },
    { label: "상세 설명", weight: 1, value: [project.description ?? "", project.searchText ?? ""].join(" ") }
  ];
}

function getTopMatchReasons(reasonScores: Map<string, number>): string[] {
  return Array.from(reasonScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label]) => label)
    .slice(0, 3);
}

function uniqueTerms(terms: string[]): string[] {
  return Array.from(
    new Set(terms.flatMap((term) => normalizeAgentQuery(term).split(" ")))
  )
    .map((term) => term.trim())
    .filter(Boolean);
}

function stripLineBreaks(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
