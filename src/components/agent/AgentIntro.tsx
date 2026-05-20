"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { agentRecommendedKeywords } from "@/data/agentDictionary";
import {
  resolveAgentQuery,
  type AgentProject,
  type AgentResolvedResult
} from "@/lib/agentSearch";
import AgentResult from "./AgentResult";
import AgentSearchBox from "./AgentSearchBox";
import RecommendedKeywords from "./RecommendedKeywords";

type AgentIntroProps = {
  projects: AgentProject[];
};

export default function AgentIntro({ projects }: AgentIntroProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AgentResolvedResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focusSearch = () => {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const resetSearch = () => {
    setQuery("");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    focusSearch();
  };

  const runSearch = (nextQuery = query) => {
    const resolved = resolveAgentQuery(projects, nextQuery);

    if (!resolved) {
      setResult(null);
      focusSearch();
      return;
    }

    if (resolved.kind === "action" && resolved.intent === "reset_home") {
      resetSearch();
      return;
    }

    setQuery(nextQuery);
    setResult(resolved);
  };

  const selectKeyword = (keyword: string) => {
    setQuery(keyword);
    runSearch(keyword);
  };

  return (
    <section className="border-b border-line bg-surface">
      <div className="wrap flex min-h-[calc(100svh-57px)] items-center py-16 md:py-24">
        <div className="mx-auto w-full max-w-[860px]">
          <div className="text-center">
            <p className="font-mono text-[12px] uppercase text-muted md:text-[13px]">
              DABIN AGENT
            </p>
            <h1 className="mx-auto mt-4 max-w-[13ch] text-[38px] font-medium leading-[1.12] text-ink md:text-[58px]">
              박다빈의 작업 기록에서 무엇을 찾아드릴까요?
            </h1>
            <p className="mx-auto mt-5 max-w-[58ch] text-[15px] leading-7 text-inkMuted md:text-[16px]">
              포트폴리오 데이터 안에서 소개, 기술 스택, 연락처, 프로젝트 기록을 찾아드립니다.
            </p>
          </div>

          <div className="mt-8 md:mt-10">
            <AgentSearchBox
              query={query}
              inputRef={inputRef}
              onQueryChange={setQuery}
              onSearch={() => runSearch()}
            />
          </div>

          {!result ? (
            <div className="mt-6 space-y-5">
              <RecommendedKeywords
                keywords={agentRecommendedKeywords}
                onSelect={selectKeyword}
              />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/work"
                  data-cursor="link"
                  className="inline-flex h-12 items-center rounded-full bg-bg px-5 text-[14px] font-medium text-inkMuted shadow-[0_1px_0_rgb(var(--ink)/0.04)] transition hover:-translate-y-0.5 hover:text-ink hover:shadow-[0_8px_18px_rgb(var(--ink)/0.09)] md:h-14 md:px-6 md:text-[15px]"
                >
                  내 Work 메뉴 바로가기
                </Link>
                <button
                  type="button"
                  onClick={resetSearch}
                  data-cursor="link"
                  className="inline-flex h-12 items-center rounded-full bg-ink px-5 text-[14px] font-medium text-bg shadow-[0_1px_0_rgb(var(--ink)/0.04)] transition hover:-translate-y-0.5 hover:bg-brand hover:text-brandInk hover:shadow-[0_8px_18px_rgb(var(--ink)/0.13)] md:h-14 md:px-6 md:text-[15px]"
                >
                  포트폴리오 메인 바로가기
                </button>
              </div>
            </div>
          ) : (
            <AgentResult
              result={result}
              projectCount={projects.length}
              onReset={resetSearch}
              onSelectKeyword={selectKeyword}
            />
          )}
        </div>
      </div>
    </section>
  );
}
