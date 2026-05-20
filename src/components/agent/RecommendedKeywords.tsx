type RecommendedKeywordsProps = {
  keywords: readonly string[];
  onSelect: (keyword: string) => void;
  align?: "left" | "center";
};

export default function RecommendedKeywords({
  keywords,
  onSelect,
  align = "center"
}: RecommendedKeywordsProps) {
  return (
    <div
      className={
        "flex flex-wrap gap-2 " +
        (align === "center" ? "justify-center" : "justify-start")
      }
    >
      {keywords.map((keyword) => (
        <button
          key={keyword}
          type="button"
          onClick={() => onSelect(keyword)}
          data-cursor="link"
          className="inline-flex h-10 items-center rounded-full border border-line bg-bg px-4 font-mono text-[12px] text-inkMuted transition hover:border-ink hover:text-ink"
        >
          {keyword}
        </button>
      ))}
    </div>
  );
}
