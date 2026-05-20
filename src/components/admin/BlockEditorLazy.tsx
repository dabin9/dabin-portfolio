"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { BlockEditorHandle } from "./BlockEditor";

/**
 * BlockNote 는 useCreateBlockNote 안에서 window 에 접근 → SSR 에서 실패.
 * dynamic 으로 ssr:false 마운트하되 ref 도 forward 한다.
 */
const Inner = dynamic(() => import("./BlockEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-line rounded-xl bg-white px-6 py-12 text-[13px] text-muted">
      에디터 로드 중…
    </div>
  )
});

type Props = {
  initialBlocks?: unknown[];
  initialHtml?: string;
  blocksFieldName?: string;
  htmlFieldName?: string;
  compact?: boolean;
  hideHelp?: boolean;
};

const BlockEditorLazy = forwardRef<BlockEditorHandle, Props>(function BlockEditorLazy(props, ref) {
  return <Inner {...props} ref={ref} />;
});

export default BlockEditorLazy;
