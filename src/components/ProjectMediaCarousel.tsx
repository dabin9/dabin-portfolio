"use client";

import { useEffect, useId, useState } from "react";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { ProjectMediaItem } from "@/data/projects";

type Props = {
  items: ProjectMediaItem[];
  placeholder?: string;
  poster?: string;
  altFallback: string;
};

export default function ProjectMediaCarousel({
  items,
  placeholder,
  poster,
  altFallback
}: Props) {
  const mediaItems = items.filter((item) => item.url);

  if (mediaItems.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-line bg-surface"
        style={{ aspectRatio: "16/10" }}
      >
        <span className="font-display text-4xl md:text-5xl text-ink">
          {placeholder || "MEDIA"}
        </span>
      </div>
    );
  }

  if (mediaItems.length === 1) {
    return (
      <MediaFrame
        item={mediaItems[0]}
        poster={poster}
        altFallback={altFallback}
      />
    );
  }

  return (
    <div className="project-media-swiper">
      <Swiper
        modules={[Pagination, A11y]}
        pagination={{ clickable: true }}
        slidesPerView={1}
        spaceBetween={16}
        className="w-full"
      >
        {mediaItems.map((item, index) => (
          <SwiperSlide key={`${item.url}:${index}`}>
            <MediaFrame
              item={item}
              poster={poster}
              altFallback={`${altFallback} ${index + 1}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function MediaFrame({
  item,
  poster,
  altFallback
}: {
  item: ProjectMediaItem;
  poster?: string;
  altFallback: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTitleId = useId();
  const altText = item.alt || altFallback;

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  if (item.type !== "video") {
    return (
      <>
        <button
          type="button"
          aria-label={`${altText} 크게 보기`}
          onClick={() => setIsModalOpen(true)}
          className="group relative block w-full cursor-zoom-in overflow-hidden border border-line bg-surface text-left"
          style={{ aspectRatio: "16/10" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={altText}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover transition duration-300 group-hover:scale-[1.025]"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-line bg-bg/90 px-3 py-1.5 font-mono text-[11px] uppercase text-ink opacity-0 shadow-[0_12px_30px_rgb(var(--ink)/0.12)] backdrop-blur transition duration-200 group-hover:opacity-100">
            크게 보기
          </span>
        </button>

        {isModalOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgb(var(--ink)/0.68)] p-4 backdrop-blur-[2px] md:p-8"
          >
            <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col border border-[rgb(var(--bg)/0.35)] bg-bg shadow-[0_28px_80px_rgb(0_0_0/0.35)]">
              <div className="flex items-center justify-between gap-4 border-b border-line px-3 py-2 md:px-4">
                <h2
                  id={modalTitleId}
                  className="font-mono text-[12px] uppercase text-muted"
                >
                  크게 보기
                </h2>
                <button
                  type="button"
                  autoFocus
                  aria-label="크게 보기 닫기"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center border border-line bg-bg font-mono text-[16px] text-ink transition hover:border-ink hover:bg-surface"
                >
                  X
                </button>
              </div>
              <div className="flex min-h-0 items-center justify-center p-2 md:p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={altText}
                  draggable={false}
                  className="block max-h-[78vh] max-w-full select-none object-contain"
                />
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden border border-line bg-surface"
      style={{ aspectRatio: "16/10" }}
    >
      <video
        src={item.url}
        poster={poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={altText}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
