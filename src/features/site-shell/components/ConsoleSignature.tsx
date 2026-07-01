"use client";

import { useEffect } from "react";
import { env } from "@/shared/config/env";


export default function ConsoleSignature() {
  useEffect(() => {
    // @ts-expect-error global flag
    if (window.__sig_done) return;
    // @ts-expect-error global flag
    window.__sig_done = true;

    const title = `
  ██████╗  █████╗ ██████╗ ██╗███╗   ██╗
  ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
  ██║  ██║███████║██████╔╝██║██╔██╗ ██║
  ██║  ██║██╔══██║██╔══██╗██║██║╚██╗██║
  ██████╔╝██║  ██║██████╔╝██║██║ ╚████║
  ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝`;

    /* eslint-disable no-console */
    console.log(`%c${title}`, "color:#E24D1A; font-family: monospace; font-size:11px; line-height:1.1;");
    console.log(
      "%c박다빈 · Frontend Engineer",
      "font-weight:600; font-size:14px;"
    );
    console.log(
      "%c콘솔까지 열어보시다니 — 의심 많은 엔지니어의 표식입니다. 반갑습니다.",
      "color:#7A7266;"
    );
    console.log(
      "%c⌘K 를 눌러 사이트를 키보드로 탐색해 보세요. ↑/↓ 로 이동, Enter 로 확인.",
      "color:#7A7266;"
    );
    console.log(
      `%cGitHub · ${env.github}`,
      "color:#2438D8;"
    );
    /* eslint-enable no-console */
  }, []);

  return null;
}
