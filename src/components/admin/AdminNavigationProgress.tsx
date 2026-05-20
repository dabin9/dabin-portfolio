"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SHOW_DELAY_MS = 300;
const ESTIMATED_MS = 5200;

type PendingNavigation = {
  href: string;
  startedAt: number;
  visible: boolean;
  completing: boolean;
};

export default function AdminNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams]
  );
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const [progress, setProgress] = useState(0);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const routeKeyRef = useRef(routeKey);
  const showTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current == null) return;
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    };

    const clearFinishTimer = () => {
      if (finishTimerRef.current == null) return;
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    };

    const begin = (href: string) => {
      clearShowTimer();
      clearFinishTimer();
      setProgress(7);
      setPending({
        href,
        startedAt: Date.now(),
        visible: false,
        completing: false
      });
      showTimerRef.current = window.setTimeout(() => {
        setPending((current) =>
          current && current.href === href ? { ...current, visible: true } : current
        );
      }, SHOW_DELAY_MS);
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.startsWith("/admin")) return;

      const current = window.location.pathname + window.location.search;
      const next = url.pathname + url.search;
      if (current === next) return;

      begin(url.href);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearShowTimer();
      clearFinishTimer();
    };
  }, []);

  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;
    routeKeyRef.current = routeKey;

    const current = pendingRef.current;
    if (!current) return;

    if (showTimerRef.current != null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (!current.visible) {
      setPending(null);
      setProgress(0);
      return;
    }

    setPending({ ...current, completing: true });
    setProgress(100);
    finishTimerRef.current = window.setTimeout(() => {
      setPending(null);
      setProgress(0);
      finishTimerRef.current = null;
    }, 260);
  }, [routeKey]);

  useEffect(() => {
    if (!pending || pending.completing) return;

    const id = window.setInterval(() => {
      const elapsed = Date.now() - pending.startedAt;
      const ratio = Math.min(elapsed / ESTIMATED_MS, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      const slowTail = elapsed > ESTIMATED_MS
        ? Math.min((elapsed - ESTIMATED_MS) / 16000, 1) * 4
        : 0;

      setProgress(Math.min(96, Math.round(7 + eased * 85 + slowTail)));
    }, 120);

    return () => window.clearInterval(id);
  }, [pending]);

  if (!pending?.visible) return null;

  const elapsed = Date.now() - pending.startedAt;
  const remainingMs = Math.max(0, ESTIMATED_MS - elapsed);
  const remainingLabel = pending.completing
    ? "완료 중"
    : progress >= 92
      ? "예상보다 조금 더 걸리는 중"
      : `예상 ${Math.max(1, Math.ceil(remainingMs / 1000))}초 남음`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[90] w-[min(360px,calc(100vw-2rem))] border border-line bg-bg/95 px-4 py-3 shadow-xl backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-ink"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">페이지 이동 중</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {remainingLabel} · 예상 진행률 {progress}%
          </p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
