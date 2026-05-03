"use client";

import dynamic from "next/dynamic";

/**
 * BlockNote 는 useCreateBlockNote 안에서 window 에 접근하므로
 * SSR 을 끄고 클라이언트에서만 마운트한다.
 */
const BlockEditor = dynamic(() => import("./BlockEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-line rounded-xl bg-white px-6 py-12 text-[13px] text-muted">
      에디터 로드 중…
    </div>
  )
});

export default BlockEditor;
