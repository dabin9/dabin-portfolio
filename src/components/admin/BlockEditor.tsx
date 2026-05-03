"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./blocknote-overrides.css";

import { useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";
import { uploadImage } from "@/lib/clientUpload";

type Props = {
  initialBlocks?: unknown[];
  blocksFieldName?: string;
  htmlFieldName?: string;
};

/**
 * BlockEditor — 노션 스타일 블록 에디터.
 * - 이미지는 @vercel/blob/client 로 클라이언트 직접 업로드 (4.5MB 함수 한도 우회)
 * - 변경 시 hidden 인풋 두 개 갱신 (blocks JSON + 직렬화 HTML)
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
    uploadFile: uploadImage
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
