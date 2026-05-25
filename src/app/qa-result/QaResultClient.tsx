"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { readQaRun } from "@/lib/qaRun";
import { plainText } from "@/lib/plainText";
import {
  rankQaProjects,
  type QaSearchProject,
  type RankedQaProject
} from "@/lib/qaSearch";
import QaResultSearch from "./QaResultSearch";

type RunState =
  | { status: "loading"; query: "" }
  | { status: "ready"; query: string }
  | { status: "missing"; query: "" };

type AnswerPhase = "thinking" | "answered";

export default function QaResultClient({
  projects,
  runId
}: {
  projects: QaSearchProject[];
  runId: string;
}) {
  const [runState, setRunState] = useState<RunState>({
    status: "loading",
    query: ""
  });
  const [answerPhase, setAnswerPhase] = useState<AnswerPhase>("thinking");
  const [followUpMessage, setFollowUpMessage] = useState<string | null>(null);

  useEffect(() => {
    const payload = readQaRun(runId);
    if (!payload) {
      setRunState({ status: "missing", query: "" });
      return;
    }

    setRunState({ status: "ready", query: payload.query });
  }, [runId]);

  useEffect(() => {
    setFollowUpMessage(null);

    if (runState.status !== "ready") {
      setAnswerPhase("answered");
      return;
    }

    setAnswerPhase("thinking");
    const timer = window.setTimeout(() => {
      setAnswerPhase("answered");
    }, 480);

    return () => window.clearTimeout(timer);
  }, [runState.status, runState.query]);

  const matches = useMemo<RankedQaProject[]>(() => {
    if (runState.status !== "ready") return [];
    return rankQaProjects(projects, runState.query).slice(0, 3);
  }, [projects, runState]);

  const hasMatches = matches.length > 0;
  const displayQuery =
    runState.status === "ready" ? runState.query : "작업 기록 찾아줘";
  const isThinking = runState.status === "ready" && answerPhase === "thinking";
  const showAnswer = runState.status === "ready" && answerPhase === "answered";

  return (
    <section className="fixed inset-0 z-[120] min-h-screen overflow-hidden bg-white text-[#202428]">
      <div className="mx-auto flex h-full max-w-[960px] flex-col px-6 pb-7 pt-7 md:px-10">
        <header className="shrink-0 text-center font-mono text-[13px] uppercase tracking-[0.18em] text-[#4d555e]">
          DABIN AGENT
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pt-12 md:pt-16">
          {runState.status === "ready" ? (
            <div className="mb-11 flex justify-end pr-2 md:pr-10">
              <div className="flex min-h-12 max-w-[340px] items-center justify-center rounded-full bg-[#edf1f7] px-5 text-[16px] leading-6 text-[#202428]">
                <span className="truncate">{displayQuery}</span>
              </div>
            </div>
          ) : null}

          <section className="grid grid-cols-[32px_1fr] gap-x-6 gap-y-5 md:grid-cols-[40px_1fr]">
            <div className="flex h-8 items-center justify-center pt-0.5 text-[28px] leading-none text-[#4285ff]">
              *
            </div>
            <article className="max-w-[760px] space-y-7 text-[16px] leading-8 text-[#25292d]">
              <AnimatePresence mode="wait">
                {runState.status === "loading" ? (
                  <motion.p
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-[#56616d]"
                  >
                    이전 실행 기록을 불러오고 있어요.
                  </motion.p>
                ) : null}

                {runState.status === "missing" ? (
                  <motion.div
                    key="missing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <MissingRun />
                  </motion.div>
                ) : null}

                {isThinking ? <ThinkingMessage key="thinking" /> : null}

                {showAnswer ? (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="space-y-7"
                  >
                    {hasMatches ? (
                      <MatchedProjects query={displayQuery} projects={matches} />
                    ) : (
                      <NoMatches query={displayQuery} />
                    )}

                    <FollowUpPrompt message={followUpMessage ?? "메인 화면으로 갈까요?"} />
                    <FeedbackActions />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          </section>
        </main>

        <div className="shrink-0 pb-1 pt-5">
          <QaResultSearch
            initialQuery=""
            onNegativeIntent={() => setFollowUpMessage("무엇을 찾아드릴까요?")}
          />
        </div>
      </div>
    </section>
  );
}

function ThinkingMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -8] }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.48, times: [0, 0.28, 0.74, 1], ease: "easeOut" }}
      className="flex h-8 items-center gap-1.5"
      aria-label="답변 준비 중"
    >
      <span className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
            transition={{
              duration: 0.42,
              repeat: Infinity,
              delay: dot * 0.08,
              ease: "easeInOut"
            }}
            className="h-1.5 w-1.5 rounded-full bg-[#4285ff]"
          />
        ))}
      </span>
    </motion.div>
  );
}

function FollowUpPrompt({ message }: { message: string }) {
  return (
    <motion.p
      key={message}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-[20px] bg-[#f4f7fb] px-5 py-4 text-[16px] font-medium text-[#25292d]"
    >
      {message}
    </motion.p>
  );
}

function MatchedProjects({
  query,
  projects
}: {
  query: string;
  projects: RankedQaProject[];
}) {
  return (
    <>
      <div className="space-y-3">
        <p>
          질문을 확인했어요. 공개된 작업 기록에서{" "}
          <strong className="font-semibold text-[#111827]">{query}</strong>
          와 관련성이 높은 프로젝트를 찾아 정리했습니다.
        </p>
        <p className="text-[#56616d]">
          아래 작업들은 제목, 요약, 기술 스택, 태그 기준으로 매칭된 결과예요.
        </p>
      </div>

      <div className="grid gap-3">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/work/${project.slug}`}
            className="block rounded-[22px] border border-[#e5eaf0] bg-[#fbfcfe] px-5 py-4 transition hover:-translate-y-0.5 hover:border-[#cfd8e3] hover:bg-white hover:shadow-[0_10px_24px_rgba(31,42,55,0.08)]"
          >
            <div className="flex gap-4">
              <span className="mt-0.5 font-mono text-[13px] text-[#7a838d]">
                {index + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[16px] font-semibold leading-6 text-[#202428]">
                      {project.title}
                    </h2>
                    <p className="mt-1 text-[12px] text-[#7a838d]">
                      {project.year} · {project.role || "Work"}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[12px] uppercase text-[#4a5562]">
                    프로젝트 보기 →
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#5d6670]">
                  {plainText(project.summary)}
                </p>
                {project.stack.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.stack.slice(0, 4).map((stack) => (
                      <span
                        key={stack}
                        className="rounded-full bg-[#eef3f8] px-2.5 py-1 text-[11px] text-[#56616d]"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function NoMatches({ query }: { query: string }) {
  return (
    <div className="rounded-[22px] border border-[#e5eaf0] bg-[#fbfcfe] px-5 py-5">
      <p>
        지금 공개된 작업 기록에서는{" "}
        <strong className="font-semibold text-[#111827]">{query}</strong>
        와 바로 연결되는 프로젝트를 찾지 못했어요.
      </p>
      <p className="mt-2 text-[#56616d]">
        관련 작업을 찾지 못했지만 Work 전체에서 확인할 수 있어요.
      </p>
      <Link
        href="/work"
        className="mt-4 inline-flex rounded-full bg-[#202428] px-4 py-2 text-[13px] font-medium text-white"
      >
        Work 전체에서 확인하기 →
      </Link>
    </div>
  );
}

function MissingRun() {
  return (
    <div className="rounded-[22px] border border-[#e5eaf0] bg-[#fbfcfe] px-5 py-5">
      <p>이 대화 기록을 찾을 수 없어요. 다시 질문해 주세요.</p>
      <Link
        href="/qa"
        className="mt-4 inline-flex rounded-full bg-[#202428] px-4 py-2 text-[13px] font-medium text-white"
      >
        다시 질문하기 →
      </Link>
    </div>
  );
}

function FeedbackActions() {
  return (
    <div className="flex items-center gap-5 pt-1 text-[18px] text-[#3f464d]">
      <button type="button" aria-label="좋아요" className="hover:text-[#202428]">
        ♡
      </button>
      <button type="button" aria-label="싫어요" className="hover:text-[#202428]">
        ♧
      </button>
      <button type="button" aria-label="다시 생성" className="hover:text-[#202428]">
        ↻
      </button>
      <button type="button" aria-label="복사" className="hover:text-[#202428]">
        □
      </button>
      <button type="button" aria-label="더 보기" className="hover:text-[#202428]">
        ⋮
      </button>
    </div>
  );
}
