"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { ProjectMediaItem } from "@/entities/project";

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
  const imageItems = mediaItems.filter((item) => item.type !== "video");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isLightboxOpen = lightboxIndex !== null;

  function openLightbox(item: ProjectMediaItem) {
    const nextIndex = imageItems.findIndex((image) => image === item);
    if (nextIndex >= 0) setLightboxIndex(nextIndex);
  }

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

  const lightbox = isLightboxOpen ? (
    <MediaLightbox
      items={imageItems}
      initialIndex={lightboxIndex}
      altFallback={altFallback}
      onClose={() => setLightboxIndex(null)}
    />
  ) : null;

  if (mediaItems.length === 1) {
    return (
      <>
        <MediaFrame
          item={mediaItems[0]}
          poster={poster}
          altFallback={altFallback}
          onOpen={openLightbox}
        />
        {lightbox}
      </>
    );
  }

  return (
    <>
      <div className="project-media-swiper min-w-0 max-w-full overflow-hidden">
        <Swiper
          modules={[Pagination, A11y]}
          pagination={{ clickable: true }}
          slidesPerView={1}
          spaceBetween={16}
          className="w-full min-w-0"
        >
          {mediaItems.map((item, index) => (
            <SwiperSlide key={`${item.url}:${index}`}>
              <MediaFrame
                item={item}
                poster={poster}
                altFallback={`${altFallback} ${index + 1}`}
                onOpen={openLightbox}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {lightbox}
    </>
  );
}

function MediaFrame({
  item,
  poster,
  altFallback,
  onOpen
}: {
  item: ProjectMediaItem;
  poster?: string;
  altFallback: string;
  onOpen: (item: ProjectMediaItem) => void;
}) {
  const altText = item.alt || altFallback;

  if (item.type !== "video") {
    return (
      <button
        type="button"
        aria-label={`${altText} 크게 보기`}
        onClick={() => onOpen(item)}
        className="group relative block w-full max-w-full cursor-zoom-in overflow-hidden border border-line bg-surface text-left"
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
    );
  }

  return (
    <div
      className="relative w-full max-w-full overflow-hidden border border-line bg-surface"
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

function MediaLightbox({
  items,
  initialIndex,
  altFallback,
  onClose
}: {
  items: ProjectMediaItem[];
  initialIndex: number;
  altFallback: string;
  onClose: () => void;
}) {
  const modalTitleId = useId();
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const hasMultipleItems = items.length > 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (items.length === 0) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgb(var(--ink)/0.68)] p-3 backdrop-blur-[2px] md:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-7xl flex-col border border-[rgb(var(--bg)/0.35)] bg-bg shadow-[0_28px_80px_rgb(0_0_0/0.35)]">
        <div className="flex items-center justify-between gap-4 border-b border-line px-3 py-2 md:px-4">
          <div className="min-w-0">
            <h2
              id={modalTitleId}
              className="font-mono text-[12px] uppercase text-muted"
            >
              크게 보기
            </h2>
            <p className="mt-1 font-mono text-[11px] uppercase text-inkMuted">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </p>
          </div>
          <button
            type="button"
            autoFocus
            aria-label="크게 보기 닫기"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-line bg-bg font-mono text-[16px] text-ink transition hover:border-ink hover:bg-surface"
          >
            X
          </button>
        </div>
        <div className="relative min-h-0 flex-1 px-2 py-3 md:px-12 md:py-4">
          <Swiper
            modules={[Pagination, Keyboard, A11y]}
            initialSlide={initialIndex}
            loop={hasMultipleItems}
            keyboard={{ enabled: true }}
            pagination={hasMultipleItems ? { clickable: true } : false}
            slidesPerView={1}
            spaceBetween={24}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setActiveIndex(swiper.realIndex);
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="project-media-lightbox-swiper h-full w-full"
          >
            {items.map((item, index) => {
              const altText = item.alt || `${altFallback} ${index + 1}`;

              return (
                <SwiperSlide key={`${item.url}:lightbox:${index}`}>
                  <div className="flex h-full min-h-[56vh] items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={altText}
                      draggable={false}
                      className="block max-h-[72vh] max-w-full select-none object-contain"
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {hasMultipleItems ? (
            <>
              <button
                type="button"
                aria-label="이전 이미지"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-line bg-bg/90 font-display text-3xl leading-none text-ink shadow-[0_12px_30px_rgb(0_0_0/0.16)] transition hover:border-ink hover:bg-surface md:left-4 md:h-12 md:w-12"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 이미지"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-line bg-bg/90 font-display text-3xl leading-none text-ink shadow-[0_12px_30px_rgb(0_0_0/0.16)] transition hover:border-ink hover:bg-surface md:right-4 md:h-12 md:w-12"
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
