import RecommendedKeywords from "./RecommendedKeywords";

type EmptyResultCardProps = {
  message: string;
  suggestions: string[];
  onSelectKeyword: (keyword: string) => void;
};

export default function EmptyResultCard({
  message,
  suggestions,
  onSelectKeyword
}: EmptyResultCardProps) {
  return (
    <article className="rounded-lg border border-line bg-bg p-5 shadow-[0_10px_24px_rgb(var(--ink)/0.05)] md:p-6">
      <p className="font-mono text-[11px] uppercase text-muted">Empty Result</p>
      <h3 className="mt-2 text-2xl font-medium leading-tight text-ink md:text-3xl">
        확인 가능한 포트폴리오 데이터가 없어요
      </h3>
      <p className="mt-3 text-[14px] leading-7 text-inkMuted md:text-[15px]">
        {message}
      </p>
      <div className="mt-5 border-t border-line pt-5">
        <RecommendedKeywords
          keywords={suggestions}
          onSelect={onSelectKeyword}
          align="left"
        />
      </div>
    </article>
  );
}
