type RecommendedKeywordsProps = {
  keywords: readonly string[];
  onSelect: (keyword: string) => void;
  align?: "left" | "center";
  tone?: "default" | "hero";
};

export default function RecommendedKeywords({
  keywords,
  onSelect,
  align = "center",
  tone = "default"
}: RecommendedKeywordsProps) {
  return (
    <div
      className={
        "flex flex-wrap gap-2 " +
        (tone === "hero" ? "mx-auto max-w-[680px] " : "") +
        (align === "center" ? "justify-center" : "justify-start")
      }
    >
      {keywords.map((keyword) => (
        <button
          key={keyword}
          type="button"
          onClick={() => onSelect(keyword)}
          data-cursor="link"
          className={
            tone === "hero"
              ? keyword === "대표 프로젝트"
                ? "inline-flex h-10 items-center rounded-full border border-[#b9c5d0] bg-[#eef3f8] px-4 font-mono text-[12px] font-semibold text-[#25292d] shadow-[0_5px_14px_rgba(28,39,49,0.08)] transition hover:-translate-y-0.5 hover:border-[#a9b6c2] hover:bg-white hover:shadow-[0_8px_18px_rgba(28,39,49,0.12)]"
                : "inline-flex h-10 items-center rounded-full border border-[#dce2e8] bg-white px-4 font-mono text-[12px] text-[#59616a] shadow-[0_1px_0_rgba(28,39,49,0.02)] transition hover:-translate-y-0.5 hover:border-[#cfd8e3] hover:text-[#25292d] hover:shadow-[0_8px_18px_rgba(28,39,49,0.09)]"
              : "inline-flex h-10 items-center rounded-full border border-line bg-bg px-4 font-mono text-[12px] text-inkMuted transition hover:border-ink hover:text-ink"
          }
        >
          {keyword}
        </button>
      ))}
    </div>
  );
}
