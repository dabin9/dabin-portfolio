"use client";

import { useState, type KeyboardEvent } from "react";

type Props = {
  name: string;
  defaultValue?: string[];
  /** 자동완성용 후보 (이미 존재하는 태그들) */
  suggestions?: string[];
  label?: string;
  placeholder?: string;
};

/**
 * TagInput — 칩 형태로 태그 추가/삭제.
 * - Enter / 콤마로 추가, 클릭으로 제거, Backspace 로 마지막 제거
 * - 자동완성 후보는 placeholder 아래에 클릭 추가용 칩으로 노출
 * - hidden input 에 콤마-조인된 문자열로 직렬화 → server action 의 parseList 가 풀어냄
 */
export default function TagInput({
  name,
  defaultValue = [],
  suggestions = [],
  label = "태그",
  placeholder = "Enter 또는 , 로 추가"
}: Props) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  function add(t: string) {
    const v = t.trim().replace(/,$/, "");
    if (!v) return;
    if (tags.includes(v)) return;
    setTags([...tags, v]);
  }

  function remove(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
      setDraft("");
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  const novelSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <label className="block">
      <span className="text-[12px] text-muted">{label}</span>
      <div className="mt-1.5 min-h-[42px] w-full bg-surface border border-line rounded-md px-2 py-1.5 flex flex-wrap gap-1.5 items-center focus-within:border-ink">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 bg-bg border border-line text-[12px] px-2 py-1 rounded-full"
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="text-inkMuted hover:text-red-600 -mr-0.5"
              aria-label={`태그 ${t} 제거`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => {
            if (draft.trim()) {
              add(draft);
              setDraft("");
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[140px] bg-transparent border-0 outline-none text-[14px] py-0.5"
        />
      </div>

      {novelSuggestions.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted mr-1 self-center">기존:</span>
          {novelSuggestions.slice(0, 16).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-[12px] px-2 py-0.5 border border-dashed border-line rounded-full text-inkMuted hover:border-ink hover:text-ink"
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}

      <input type="hidden" name={name} value={tags.join(", ")} />
    </label>
  );
}
