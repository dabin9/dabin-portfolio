import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  number?: string;
  label: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

/**
 * 섹션 상단 공통 블록.
 * 과한 3단 분할을 걷어내고, 한 줄 라벨 + 좌측 정렬 타이틀 + 보조 설명 으로 단순화했습니다.
 */
export default function SectionHeader({
  number,
  label,
  title,
  description,
  className
}: Props) {
  return (
    <header className={clsx("max-w-[900px]", className)}>
      <p className="text-[13px] text-muted flex items-center gap-3">
        {number ? <span className="tnum">{number}</span> : null}
        <span>{label}</span>
      </p>
      <h2
        className="mt-4 font-display font-semibold leading-[1.12] tracking-tightest"
        style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
      >
        {title}
      </h2>
      {description ? (
        <div className="mt-5 text-[15px] text-inkSoft leading-relaxed max-w-[54ch]">
          {description}
        </div>
      ) : null}
    </header>
  );
}
