"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./blocknote-overrides.css";

import { useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";

type Props = {
  initialBlocks?: unknown[];
  blocksFieldName?: string;
  htmlFieldName?: string;
};

/**
 * BlockEditor — 노션 스타일 블록 에디터.
 * - 슬래시 커맨드 / 드래그 핸들 / 헤딩·리스트·코드·표·이미지 모두 기본 제공
 * - 이미지 블록은 uploadFile 핸들러를 통해 /api/admin/upload 로 업로드
 * - 변경 시 hidden 인풋 두 개 갱신:
 *     blocks      → BlockNote JSON (편집 시 다시 열기 위해)
 *     blocksHtml  → BlockNote 가 직렬화한 HTML (공개 페이지용)
 */
export default function BlockEditor({
  initialBlocks,
  blocksFieldName = "blocks",
  htmlFieldName = "blocksHtml"
}: Props) {
  const editor = useCreateBlockNote({
    initialContent:
      initialBlocks && initialBlocks.length > 0
        ? (initialBlocks as Block[])
        : undefined,
    uploadFile: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`업로드 실패: ${res.status} ${text}`);
      }
      const json = (await res.json()) as { url: string };
      return json.url;
    }
  });

  const [blocksJson, setBlocksJson] = useState<string>(
    JSON.stringify(initialBlocks ?? [])
  );
  const [html, setHtml] = useState<string>("");

  return (
    <div className="dabin-blocknote">
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={async () => {
          const doc = editor.document;
          setBlocksJson(JSON.stringify(doc));
          try {
            const next = await editor.blocksToFullHTML(doc);
            setHtml(next);
          } catch {
            setHtml("");
          }
        }}
      />
      <input type="hidden" name={blocksFieldName} value={blocksJson} />
      <input type="hidden" name={htmlFieldName} value={html} />
      <p className="mt-3 text-[12px] text-muted">
        ⌨︎ <code className="font-mono">/</code> 입력 → 블록 메뉴 (헤딩·리스트·이미지·코드·표) ·
        왼쪽 핸들 드래그로 블록 이동 · 이미지 블록은 파일 드롭으로 업로드
      </p>
    </div>
  );
}
