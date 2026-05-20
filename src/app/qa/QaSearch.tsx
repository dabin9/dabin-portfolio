"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import { createQaRun } from "@/lib/qaRun";
import { textMatchesQaQuery, type QaSearchProject } from "@/lib/qaSearch";

type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  href: string;
  external?: boolean;
};

export default function QaSearch({ projects }: { projects: QaSearchProject[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const items = useMemo<SearchItem[]>(() => {
    return [
      {
        id: "home",
        title: "홈",
        subtitle: "/",
        keywords: "home main index",
        href: "/"
      },
      {
        id: "work",
        title: "Work — 전체 프로젝트",
        subtitle: "/work",
        keywords: "work project archive 작업물 프로젝트 포트폴리오",
        href: "/work"
      },
      ...projects.map((project) => ({
        id: `work-${project.slug}`,
        title: project.title,
        subtitle: `${project.year} · ${project.role || "Work"}`,
        keywords: [
          project.slug,
          project.summary,
          project.stack.join(" "),
          (project.tags ?? []).join(" ")
        ].join(" "),
        href: `/work/${project.slug}`
      })),
      env.github
        ? {
            id: "github",
            title: "GitHub",
            subtitle: env.github,
            keywords: "github code repository",
            href: env.github,
            external: true
          }
        : null,
      env.notion
        ? {
            id: "notion",
            title: "Notion",
            subtitle: env.notion,
            keywords: "notion resume profile",
            href: env.notion,
            external: true
          }
        : null
    ].filter(Boolean) as SearchItem[];
  }, [projects]);

  const filtered = useMemo(() => {
    const value = query.trim();
    if (!value) return [];

    return items
      .filter((item) =>
        textMatchesQaQuery(
          [item.title, item.subtitle ?? "", item.keywords ?? ""].join(" "),
          value
        )
      )
      .slice(0, 6);
  }, [items, query]);

  const runItem = (item: SearchItem) => {
    if (item.external) {
      window.open(item.href, "_blank", "noreferrer");
      return;
    }
    router.push(item.href);
  };

  const runSearch = () => {
    const value = query.trim();
    if (!value) return;
    const runId = createQaRun(value);
    router.push(`/qa-result?run=${encodeURIComponent(runId)}`);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
    if (event.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="rounded-[28px] border border-[#dce2e8] bg-white px-6 py-6 shadow-[0_10px_26px_rgba(28,39,49,0.13)] md:rounded-[30px] md:px-7 md:py-7"
      >
        <label className="block min-h-[54px] text-[15px] font-medium text-[#6d747c] md:text-[17px]">
          <span className="sr-only">검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="박다빈의 작업 기록에서 찾아볼게요."
            autoComplete="off"
            autoFocus
            className="qa-search-input w-full bg-transparent text-[#2b2f33] outline-none placeholder:text-[#6d747c] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          />
        </label>
        <button type="submit" className="sr-only">
          검색 실행
        </button>
      </form>

      <div className="mt-7 flex justify-center">
        {query.trim() ? (
          <div className="w-full max-w-[620px] rounded-[22px] bg-white/75 p-2 text-left shadow-[0_8px_20px_rgba(28,39,49,0.06)]">
            {filtered.length > 0 ? (
              <ul className="divide-y divide-[#e6ebef]">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => runItem(item)}
                      className="block w-full rounded-[16px] px-4 py-3 text-left transition hover:bg-white"
                    >
                      <span className="block text-[14px] font-medium text-[#30363c]">
                        {item.title}
                      </span>
                      {item.subtitle ? (
                        <span className="mt-1 block truncate text-[12px] text-[#7c858e]">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-[13px] text-[#7c858e]">검색 결과가 없습니다.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/work"
              className="inline-flex h-14 items-center rounded-full bg-white px-6 text-[15px] font-medium text-[#59616a] shadow-[0_1px_0_rgba(28,39,49,0.02)] transition hover:-translate-y-0.5 hover:text-[#25292d] hover:shadow-[0_8px_18px_rgba(28,39,49,0.09)] md:h-[60px] md:px-7 md:text-[16px]"
            >
              내 work 메뉴 바로가기
            </Link>
            <Link
              href="/"
              className="inline-flex h-14 items-center rounded-full bg-[#2f3439] px-6 text-[15px] font-medium text-white shadow-[0_1px_0_rgba(28,39,49,0.04)] transition hover:-translate-y-0.5 hover:bg-[#25292d] hover:shadow-[0_8px_18px_rgba(28,39,49,0.13)] md:h-[60px] md:px-7 md:text-[16px]"
            >
              포트폴리오 메인 바로가기
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
