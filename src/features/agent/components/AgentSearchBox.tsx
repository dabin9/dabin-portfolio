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
      className="w-full min-w-0 rounded-[28px] border border-[#dce2e8] bg-white px-6 py-5 shadow-[0_10px_26px_rgba(28,39,49,0.13)] md:rounded-[30px] md:px-7 md:py-6"
    >
      <label className="block min-h-[48px] text-[15px] font-medium text-[#6d747c] md:min-h-[50px] md:text-[17px]">
        <span className="sr-only">DABIN AGENT 검색</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="React 할 줄 알아?, CMS 경험, 어드민 프로젝트, 경력, 연락처"
          autoComplete="off"
          className="qa-search-input w-full bg-transparent text-[#2b2f33] outline-none placeholder:text-[#6d747c] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        />
      </label>
      <button type="submit" className="sr-only">
        검색 실행
      </button>
    </form>
  );
}
