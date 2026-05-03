"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

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
 *
 * 변경이 일어날 때마다 두 hidden 인풋을 갱신:
 *   - blocks: 에디터로 다시 열 때 사용할 BlockNote JSON
 *   - html  : 공개 페이지에서 그대로 렌더할 HTML (서버에서 BlockNote 의존 없이 표시 가능)
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
        : undefined
  });

  const [blocksJson, setBlocksJson] = useState<string>(
    JSON.stringify(initialBlocks ?? [])
  );
  const [html, setHtml] = useState<string>("");

  return (
    <div>
      <div className="border border-line rounded-xl overflow-hidden bg-white">
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
      </div>
      <input type="hidden" name={blocksFieldName} value={blocksJson} />
      <input type="hidden" name={htmlFieldName} value={html} />
      <p className="mt-2 text-[11px] text-muted">
        ⌨︎ <code className="font-mono">/</code> 입력으로 블록 메뉴 · 드래그로 블록 이동
      </p>
    </div>
  );
}
