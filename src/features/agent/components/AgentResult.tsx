import Link from "next/link";
import type { AgentResolvedResult } from "@/features/agent/lib/agentSearch";
import ActionResultCard from "./ActionResultCard";
import EmptyResultCard from "./EmptyResultCard";
import InfoResultCard from "./InfoResultCard";
import ProjectResultCard from "./ProjectResultCard";

type AgentResultProps = {
  result: AgentResolvedResult;
  projectCount: number;
  onReset: () => void;
  onSelectKeyword: (keyword: string) => void;
};

export default function AgentResult({
  result,
  projectCount,
  onReset,
  onSelectKeyword
}: AgentResultProps) {
  const lead =
    result.kind === "empty"
      ? "질문을 확인했어요."
      : result.kind === "action"
        ? "요청 의도를 확인했어요."
        : result.message;

  return (
    <section className="mt-8" aria-live="polite">
      <div className="mb-4 border-l border-lineStrong pl-4">
        <p className="font-mono text-[11px] uppercase text-muted">DABIN AGENT</p>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-7 text-inkMuted md:text-[16px]">
          {lead}
        </p>
      </div>

      {result.kind === "info" ? (
        <InfoResultCard intent={result.intent} projectCount={projectCount} />
      ) : null}

      {result.kind === "project" ? (
        <ProjectResultCard projects={result.projects} />
      ) : null}

      {result.kind === "action" ? (
        <ActionResultCard result={result} onReset={onReset} />
      ) : null}

      {result.kind === "empty" ? (
        <EmptyResultCard
          message={result.message}
          suggestions={result.suggestions}
          onSelectKeyword={onSelectKeyword}
        />
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/work"
          data-cursor="link"
          className="inline-flex h-11 items-center rounded-full border border-line bg-bg px-5 font-mono text-[12px] uppercase text-ink transition hover:border-ink"
        >
          전체 Work 보기
        </Link>
        <button
          type="button"
          onClick={onReset}
          data-cursor="link"
          className="inline-flex h-11 items-center rounded-full border border-line bg-bg px-5 font-mono text-[12px] uppercase text-inkMuted transition hover:border-ink hover:text-ink"
        >
          다른 키워드 검색하기
        </button>
        <button
          type="button"
          onClick={onReset}
          data-cursor="link"
          className="inline-flex h-11 items-center rounded-full border border-line bg-bg px-5 font-mono text-[12px] uppercase text-inkMuted transition hover:border-ink hover:text-ink"
        >
          메인으로 돌아가기
        </button>
      </div>
    </section>
  );
}
