"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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

const introItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function AgentIntro({ projects }: AgentIntroProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AgentResolvedResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focusSearch = useCallback(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const resetSearch = useCallback(() => {
    setQuery("");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    focusSearch();
  }, [focusSearch]);

  useEffect(() => {
    const resetFromHeader = () => resetSearch();

    window.addEventListener("agent:reset", resetFromHeader);
    return () => window.removeEventListener("agent:reset", resetFromHeader);
  }, [resetSearch]);

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
    <section className="overflow-x-hidden border-b border-[#dce2e8] bg-[#f3f7fb] text-[#2b2f33]">
      <div className="wrap flex min-h-[calc(100svh-57px)] items-center py-14 md:py-24">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.07 }}
          className="mx-auto w-full min-w-0 max-w-[960px]"
        >
          <motion.div
            variants={introItem}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mb-7 text-left sm:pl-5 md:pl-6"
          >
            <p className="font-mono text-[13px] uppercase leading-6 tracking-[0.18em] text-[#66717c]">
              DABIN AGENT
            </p>
            <h1 className="mt-2 whitespace-nowrap text-[14px] font-medium leading-[1.12] text-[#25292d] min-[430px]:text-[20px] sm:text-[30px] md:text-[40px] lg:text-[44px]">
              반갑습니다. 오늘도 같이 발견해볼까요?
            </h1>
          </motion.div>

          <motion.div
            variants={introItem}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <AgentSearchBox
              query={query}
              inputRef={inputRef}
              onQueryChange={setQuery}
              onSearch={() => runSearch()}
            />
          </motion.div>

          {!result ? (
            <motion.div
              variants={introItem}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-7 space-y-7"
            >
              <RecommendedKeywords
                keywords={agentRecommendedKeywords}
                onSelect={selectKeyword}
                tone="hero"
              />
              <div className="flex flex-col items-center gap-5">
                <Link
                  href="/work"
                  data-cursor="link"
                  className="inline-flex h-14 items-center rounded-full bg-white px-6 text-[15px] font-medium text-[#59616a] shadow-[0_1px_0_rgba(28,39,49,0.02)] transition hover:-translate-y-0.5 hover:text-[#25292d] hover:shadow-[0_8px_18px_rgba(28,39,49,0.09)] md:h-[60px] md:px-7 md:text-[16px]"
                >
                  내 work 메뉴 바로가기
                </Link>
                <a
                  href="#work"
                  data-cursor="link"
                  className="group inline-flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6f7b86] transition hover:text-[#25292d]"
                  aria-label="Scroll down to selected works"
                >
                  <span>Scroll down</span>
                  <span className="relative h-8 w-px overflow-hidden bg-[#c7d1dc]">
                    <span className="absolute left-0 top-0 block h-3 w-px animate-[scrollDown_1.45s_ease-in-out_infinite] bg-[#25292d]" />
                  </span>
                </a>
              </div>
            </motion.div>
          ) : (
            <AgentResult
              result={result}
              projectCount={projects.length}
              onReset={resetSearch}
              onSelectKeyword={selectKeyword}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
