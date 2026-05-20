"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createQaRun } from "@/lib/qaRun";

const POSITIVE_REPLIES = new Set([
  "ㅇ",
  "응",
  "ㅇㅇ",
  "네",
  "넵",
  "넹",
  "네넹",
  "예",
  "좋아",
  "웅",
  "ok",
  "yes"
]);
const NEGATIVE_REPLIES = new Set([
  "ㄴ",
  "ㄴㄴ",
  "아니",
  "아니요",
  "아뇨",
  "놉",
  "싫어",
  "괜찮아",
  "no"
]);

export default function QaResultSearch({
  initialQuery,
  onNegativeIntent
}: {
  initialQuery: string;
  onNegativeIntent?: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const runSearch = () => {
    const value = query.trim();
    if (!value) return;
    const intent = normalizeIntent(value);

    if (POSITIVE_REPLIES.has(intent)) {
      router.push("/");
      return;
    }

    if (NEGATIVE_REPLIES.has(intent)) {
      onNegativeIntent?.();
      setQuery("");
      return;
    }

    const runId = createQaRun(value);
    router.push(`/qa-result?run=${encodeURIComponent(runId)}`);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
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
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-[760px] items-center rounded-[28px] border border-[#e1e5ea] bg-white px-6 py-5 shadow-[0_8px_28px_rgba(28,39,49,0.10)]"
    >
      <label className="block min-w-0 flex-1">
        <span className="sr-only">검색</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="박다빈에게 물어보기"
          autoComplete="off"
          className="qa-search-input w-full bg-transparent text-[16px] font-medium text-[#2b2f33] outline-none placeholder:text-[#7d858d] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        />
      </label>
      <button type="submit" className="sr-only">
        검색 실행
      </button>
    </form>
  );
}

function normalizeIntent(value: string) {
  return value
    .toLowerCase()
    .replace(/[\s.,!?~。！？]+/g, "")
    .trim();
}
