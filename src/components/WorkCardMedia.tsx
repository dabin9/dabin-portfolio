"use client";

import { useState, type ReactNode } from "react";

type Props = {
  thumbnail?: string;
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
 *   1. thumbnail 있음 → 이미지 표시 (호버 시 hoverImage 가 있으면 부드럽게 swap)
 *   2. thumbnail 없고 altText 있음 → 카드 중앙에 큰 글자 (5~6자 가정)
 *   3. 둘 다 없음 → fallback (예: Mock)
 *
 * 호버 swap 은 두 이미지를 모두 깔아두고 opacity 로 페이드.
 */
export default function WorkCardMedia({
  thumbnail,
  hoverImage,
  altText,
  ongoing,
  fallback
}: Props) {
  const [hover, setHover] = useState(false);

  // 1) 썸네일 있음
  if (thumbnail) {
    return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative overflow-hidden rounded-2xl border border-line bg-surface"
        style={{ aspectRatio: "16/10" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: hover && hoverImage ? 0 : 1 }}
          loading="lazy"
        />
        {hoverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hoverImage}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: hover ? 1 : 0 }}
            loading="lazy"
          />
        ) : null}
        {ongoing ? <OngoingTag /> : null}
      </div>
    );
  }

  // 2) altText 있음
  if (altText) {
    return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative overflow-hidden rounded-2xl border border-line bg-surface flex items-center justify-center"
        style={{ aspectRatio: "16/10" }}
      >
        {/* hoverImage 가 따로 있으면 호버 시 그걸 깔아준다 */}
        {hoverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hoverImage}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: hover ? 1 : 0 }}
            loading="lazy"
          />
        ) : null}
        <span
          className="relative font-display font-semibold tracking-tightest text-ink text-center px-4 leading-none transition-opacity duration-300"
          style={{
            fontSize: `clamp(2.6rem, ${10 - Math.min(altText.length, 6)}vw, 5.5rem)`,
            opacity: hover && hoverImage ? 0 : 1
          }}
        >
          {altText}
        </span>
        {ongoing ? <OngoingTag /> : null}
      </div>
    );
  }

  // 3) fallback
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
      {fallback}
      {ongoing ? <OngoingTag /> : null}
    </div>
  );
}

function OngoingTag() {
  return (
    <span className="absolute top-3 right-3 text-[11px] font-mono px-2.5 py-1 bg-ink text-bg rounded-full">
      Ongoing
    </span>
  );
}
