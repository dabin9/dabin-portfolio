import type { RefObject } from "react";

type AgentSearchBoxProps = {
  query: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
};

export default function AgentSearchBox({
  query,
  inputRef,
  onQueryChange,
  onSearch
}: AgentSearchBoxProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
      className="flex min-h-[64px] items-center gap-3 rounded-full border border-line bg-bg px-5 py-2 shadow-[0_18px_40px_rgb(var(--ink)/0.08)] transition focus-within:border-lineStrong md:min-h-[72px] md:px-6"
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">DABIN AGENT 검색</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="예: JavaScript 프로젝트, 기술 스택, CMS 경험, 대표 작업"
          autoComplete="off"
          className="qa-search-input w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted md:text-[17px]"
        />
      </label>
      <button
        type="submit"
        data-cursor="link"
        className="inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-5 font-mono text-[12px] uppercase text-bg transition hover:bg-brand hover:text-brandInk md:h-12 md:px-6"
      >
        Search
      </button>
    </form>
  );
}
