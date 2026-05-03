"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./blocknote-overrides.css";

import {
  forwardRef,
  useImperativeHandle,
  useRef
} from "react";
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
 * 부모(폼)에서 호출할 수 있는 핸들.
 *  flushToInputs() — 현재 에디터 상태를 hidden 인풋에 즉시 동기화한다.
 *  submit 직전에 await 해서 race 를 없앰.
 */
export type BlockEditorHandle = {
  flushToInputs: () => Promise<void>;
};

/**
 * BlockEditor — 노션 스타일 블록 에디터.
 * - onChange 마다 hidden 인풋(JSON / HTML) 갱신
 * - submit 시점에는 부모가 ref.flushToInputs() 로 최신 HTML 보장
 * - 이미지는 @vercel/blob/client 로 클라이언트 직접 업로드
 */
const BlockEditor = forwardRef<BlockEditorHandle, Props>(function BlockEditor(
  {
    initialBlocks,
    blocksFieldName = "blocks",
    htmlFieldName = "blocksHtml"
  },
  ref
) {
  const editor = useCreateBlockNote({
    initialContent:
      initialBlocks && initialBlocks.length > 0
        ? (initialBlocks as Block[])
        : undefined,
    uploadFile: uploadImage
  });

  const blocksRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLInputElement>(null);

  const flush = async () => {
    const doc = editor.document;
    if (blocksRef.current) blocksRef.current.value = JSON.stringify(doc);
    try {
      const html = await editor.blocksToFullHTML(doc);
      if (htmlRef.current) htmlRef.current.value = html;
    } catch {
      if (htmlRef.current) htmlRef.current.value = "";
    }
  };

  useImperativeHandle(ref, () => ({ flushToInputs: flush }), [editor]);

  return (
    <div className="dabin-blocknote">
      <BlockNoteView editor={editor} theme="light" onChange={flush} />
      <input
        ref={blocksRef}
        type="hidden"
        name={blocksFieldName}
        defaultValue={JSON.stringify(initialBlocks ?? [])}
      />
      <input ref={htmlRef} type="hidden" name={htmlFieldName} defaultValue="" />
      <p className="mt-3 text-[12px] text-muted">
        ⌨︎ <code className="font-mono">/</code> 입력 → 블록 메뉴 (헤딩·리스트·이미지·코드·표) ·
        왼쪽 핸들 드래그로 블록 이동 · 이미지 블록은 파일 드롭으로 업로드
      </p>
    </div>
  );
});

export default BlockEditor;
