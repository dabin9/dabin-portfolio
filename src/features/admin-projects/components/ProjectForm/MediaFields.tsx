"use client";

import { useState } from "react";
import type { ProjectMediaItem } from "@/entities/project";
import type { MediaOption, MediaType } from "@/entities/project/model/media";
import { normalizeMediaType } from "./projectFormUtils";

export function MediaSelect(props: {
  label: string;
  value: string;
  options: MediaOption[];
  onChange: (value: string) => void;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = props.options.find((option) => option.url === props.value);
  const selectedLabel = selected
    ? `${selected.label} · ${selected.type} · ${selected.url}`
    : "선택 안 함";

  function choose(value: string) {
    props.onChange(value);
    setOpen(false);
  }

  return (
    <div
      className="block"
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span className="text-[12px] text-muted">{props.label}</span>
      <div className="relative mt-1.5">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 bg-surface border border-line rounded-md px-3 py-2 text-left text-[14px] focus:outline-none focus:border-ink"
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <span aria-hidden className="shrink-0 text-muted">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="listbox"
            aria-label={props.label}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-bg shadow-lg"
          >
            <button
              type="button"
              role="option"
              aria-selected={!props.value}
              onClick={() => choose("")}
              className={
                "block w-full px-3 py-2 text-left text-[13px] hover:bg-surface " +
                (!props.value ? "bg-surface text-ink" : "text-inkMuted")
              }
            >
              선택 안 함
            </button>
            {props.options.map((option) => {
              const isSelected = option.url === props.value;
              return (
                <button
                  key={`${option.type}:${option.url}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option.url)}
                  className={
                    "block w-full px-3 py-2 text-left hover:bg-surface " +
                    (isSelected ? "bg-surface" : "")
                  }
                >
                  <span className="block text-[13px] text-ink">{option.label}</span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
                    {option.type} · {option.url}
                  </span>
                </button>
              );
            })}
            {props.options.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-muted">
                public/media 폴더에 등록된 파일이 없습니다.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {props.description ? (
        <p className="mt-1.5 text-[11px] text-muted">{props.description}</p>
      ) : null}
    </div>
  );
}

export function MultiMediaSelect(props: {
  label: string;
  value: ProjectMediaItem[];
  options: MediaOption[];
  onChange: (value: ProjectMediaItem[]) => void;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedUrls = new Set(props.value.map((item) => item.url));
  const selectedLabel =
    props.value.length > 0 ? `${props.value.length}개 선택됨` : "선택 안 함";

  function toggle(option: MediaOption) {
    if (selectedUrls.has(option.url)) {
      props.onChange(props.value.filter((item) => item.url !== option.url));
      return;
    }

    props.onChange([
      ...props.value,
      {
        url: option.url,
        type: option.type,
        alt: option.alt
      }
    ]);
  }

  function remove(url: string) {
    props.onChange(props.value.filter((item) => item.url !== url));
  }

  return (
    <div
      className="block"
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span className="text-[12px] text-muted">{props.label}</span>
      <div className="relative mt-1.5">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 bg-surface border border-line rounded-md px-3 py-2 text-left text-[14px] focus:outline-none focus:border-ink"
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <span aria-hidden className="shrink-0 text-muted">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="listbox"
            aria-label={props.label}
            className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-line bg-bg shadow-lg"
          >
            {props.options.map((option) => {
              const isSelected = selectedUrls.has(option.url);
              return (
                <button
                  key={`${option.type}:${option.url}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option)}
                  className={
                    "grid w-full grid-cols-[auto_1fr] gap-2 px-3 py-2 text-left hover:bg-surface " +
                    (isSelected ? "bg-surface" : "")
                  }
                >
                  <span className="mt-0.5 font-mono text-[11px] text-ink">
                    {isSelected ? "ON" : "--"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] text-ink">{option.label}</span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
                      {option.type} · {option.url}
                    </span>
                  </span>
                </button>
              );
            })}
            {props.options.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-muted">
                public/media 폴더에 등록된 파일이 없습니다.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {props.description ? (
        <p className="mt-1.5 text-[11px] text-muted">{props.description}</p>
      ) : null}
      {props.value.length > 0 ? (
        <ol className="mt-3 space-y-1.5">
          {props.value.map((item, index) => {
            const option = props.options.find((entry) => entry.url === item.url);
            return (
              <li
                key={`${item.url}:${index}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-line bg-surface px-3 py-2"
              >
                <span className="font-mono text-[11px] text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-ink">
                    {option?.label || item.url}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-muted">
                    {item.type} · {item.url}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(item.url)}
                  className="text-[12px] text-red-600 hover:underline underline-offset-4"
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

export function MediaPreviewGrid({
  items,
  poster
}: {
  items: ProjectMediaItem[];
  poster?: string;
}) {
  if (items.length === 0) {
    return (
      <MediaPreview
        url=""
        type="image"
        alt="미디어 미리보기"
      />
    );
  }

  return (
    <div className={items.length > 1 ? "grid sm:grid-cols-2 gap-3" : ""}>
      {items.map((item, index) => (
        <div key={`${item.url}:${index}`} className="min-w-0">
          <MediaPreview
            url={item.url}
            type={normalizeMediaType(item.type)}
            alt={item.alt || "미디어 미리보기"}
            poster={poster}
          />
          {items.length > 1 ? (
            <p className="mt-1.5 truncate font-mono text-[11px] text-muted">
              {String(index + 1).padStart(2, "0")} · {item.type} · {item.url}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function MediaPreview(props: {
  url: string;
  type: MediaType;
  alt: string;
  poster?: string;
}) {
  if (!props.url) {
    return (
      <div
        className="flex items-center justify-center border border-line bg-surface rounded-md text-[12px] text-muted"
        style={{ aspectRatio: "16/10" }}
      >
        선택된 미디어가 없습니다.
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden border border-line bg-surface rounded-md"
      style={{ aspectRatio: "16/10" }}
    >
      {props.type === "video" ? (
        <video
          src={props.url}
          poster={props.poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={props.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.url}
          alt={props.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
