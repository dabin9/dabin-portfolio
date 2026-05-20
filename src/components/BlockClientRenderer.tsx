"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";

/**
 * Fallback 본문 렌더러.
 * - bodyHtml 이 비어있는 옛 데이터를 위해 클라이언트에서 BlockNote 로 변환
 * - 변환 후 그 HTML 만 dangerouslySetInnerHTML 로 표시 → 에디터 UI 는 마운트하지 않음
 * - 다이내믹 import 로 감싸서 페이지 초기 번들에 BlockNote 가 들어가지 않게 함
 */
type Props = { blocks: unknown[] };

export default function BlockClientRenderer({ blocks }: Props) {
  const editor = useCreateBlockNote({
    initialContent: blocks.length > 0 ? (blocks as Block[]) : undefined
  });
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const next = await editor.blocksToFullHTML(editor.document);
        if (alive) setHtml(next);
      } catch {
        if (alive) setHtml("");
      }
    })();
    return () => {
      alive = false;
    };
  }, [editor]);

  if (!html) return null;
  return (
    <div
      className="rich-content blocknote-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
