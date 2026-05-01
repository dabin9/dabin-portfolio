"use client";

import { useEffect, useState } from "react";

/** 헤더의 서울 시간 표시 (깜빡임 없이 조용히). */
export default function Clock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date());
    setNow(fmt());
    const id = window.setInterval(() => setNow(fmt()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="text-[12px] text-muted tabular-nums">
      Seoul · {now ?? "--:--"}
    </span>
  );
}
