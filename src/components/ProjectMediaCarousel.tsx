"use client";

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
  return (
    <div
      className="relative w-full overflow-hidden border border-line bg-surface"
      style={{ aspectRatio: "16/10" }}
    >
      {item.type === "video" ? (
        <video
          src={item.url}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={item.alt || altFallback}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.alt || altFallback}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
