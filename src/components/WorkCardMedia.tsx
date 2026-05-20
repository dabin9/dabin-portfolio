import type { ReactNode } from "react";

type Props = {
  thumbnail?: string;
  /** Legacy field kept for callers that still pass it. Lists intentionally ignore it. */
  hoverImage?: string;
  altText?: string;
  ongoing?: boolean;
  /** 둘 다 없을 때 보여줄 컴포넌트 (예: Mock) */
  fallback?: ReactNode;
};

/**
 * WorkCardMedia — 작업 카드의 시각 영역.
 *
 * 우선순위:
 *   1. thumbnail 있음 → 목록/카드용 WebP 이미지 표시
 *   2. thumbnail 없고 altText 있음 → 카드 중앙에 큰 글자 (5~6자 가정)
 *   3. 둘 다 없음 → fallback (예: Mock)
 */
export default function WorkCardMedia({
  thumbnail,
  altText,
  ongoing,
  fallback
}: Props) {
  // 1) 썸네일 있음
  if (thumbnail) {
    return (
      <div
        className="relative overflow-hidden border border-line bg-surface"
        style={{ aspectRatio: "16/10" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {ongoing ? <OngoingTag /> : null}
      </div>
    );
  }

  // 2) altText 있음
  if (altText) {
    return (
      <div
        className="relative overflow-hidden border border-line bg-surface flex items-center justify-center"
        style={{ aspectRatio: "16/10" }}
      >
        <span className="relative font-display text-4xl md:text-5xl text-ink text-center px-4 leading-none">
          {altText}
        </span>
        {ongoing ? <OngoingTag /> : null}
      </div>
    );
  }

  // 3) fallback
  return (
    <div
      className="relative overflow-hidden border border-line bg-surface"
      style={{ aspectRatio: "16/10" }}
    >
      {fallback}
      {ongoing ? <OngoingTag /> : null}
    </div>
  );
}

function OngoingTag() {
  return (
    <span className="absolute top-3 right-3 text-[11px] font-mono px-2.5 py-1 bg-ink text-bg">
      Ongoing
    </span>
  );
}
