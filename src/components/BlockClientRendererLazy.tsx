"use client";

import dynamic from "next/dynamic";

/**
 * BlockClientRenderer 를 next/dynamic 으로 감싸 SSR 비활성 + 코드 스플릿.
 * 공개 페이지의 초기 JS 번들에 BlockNote 가 포함되지 않도록.
 */
const BlockClientRenderer = dynamic(() => import("./BlockClientRenderer"), {
  ssr: false,
  loading: () => null
});

export default BlockClientRenderer;
