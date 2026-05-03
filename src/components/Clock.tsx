"use client";

import { useEffect, useState } from "react";

/**
 * Header 의 서울 시간 + 현재 날씨.
 * - 시간: 30초마다 ko-KR 포맷으로 갱신
 * - 날씨: Open-Meteo (키 불필요), 30분에 한 번 갱신
 *   weather_code 를 단순화해 emoji 한 글자만 표시 (해 / 구름 / 비 / 눈 / 번개 / 안개)
 */
export default function Clock() {
  const [now, setNow] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ icon: string; label: string; temp?: number } | null>(null);

  // 시계
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

  // 날씨
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=weather_code,temperature_2m&timezone=Asia%2FSeoul",
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = (await res.json()) as {
          current?: { weather_code?: number; temperature_2m?: number };
        };
        if (cancelled) return;
        const code = json.current?.weather_code ?? 0;
        const temp = json.current?.temperature_2m;
        setWeather({ ...iconForCode(code), temp });
      } catch {
        /* noop */
      }
    }
    load();
    const id = window.setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <span className="text-[12px] text-muted tabular-nums inline-flex items-center gap-1.5">
      {weather ? (
        <span title={weather.label} aria-label={weather.label}>
          {weather.icon}
          {typeof weather.temp === "number" ? (
            <span className="ml-0.5">{Math.round(weather.temp)}°</span>
          ) : null}
        </span>
      ) : null}
      <span>Seoul · {now ?? "--:--"}</span>
    </span>
  );
}

/**
 * Open-Meteo WMO weather code 를 단순화해 이모지로 매핑.
 * 사용자 요청대로 해 / 구름 / 비 (+눈/번개/안개) 정도만.
 */
function iconForCode(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "맑음" };
  if (code <= 2) return { icon: "🌤️", label: "구름 조금" };
  if (code === 3) return { icon: "☁️", label: "흐림" };
  if (code >= 45 && code <= 48) return { icon: "🌫️", label: "안개" };
  if (code >= 51 && code <= 67) return { icon: "🌧️", label: "비" };
  if (code >= 71 && code <= 77) return { icon: "🌨️", label: "눈" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", label: "소나기" };
  if (code >= 85 && code <= 86) return { icon: "🌨️", label: "소낙눈" };
  if (code >= 95) return { icon: "⛈️", label: "번개" };
  return { icon: "☁️", label: "흐림" };
}
