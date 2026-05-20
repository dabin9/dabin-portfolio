"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTORS = [
  "[data-scroll-reveal]",
  "main > section > .wrap > *",
  "main > section > *:not(.wrap)",
  "main.wrap > *",
  "main ul > li"
];

export default function GsapScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let context: { revert: () => void } | undefined;
    let cancelled = false;

    async function setup() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger")
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const seen = new Set<Element>();
      const targets = REVEAL_SELECTORS
        .flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)))
        .filter((element) => {
          if (seen.has(element)) return false;
          seen.add(element);
          if (element.closest("[data-no-gsap]")) return false;
          if (element.offsetParent === null) return false;
          const rect = element.getBoundingClientRect();
          if (rect.height <= 0) return false;
          if (rect.top < window.innerHeight * 0.82) return false;
          return true;
        });

      if (targets.length === 0) return;

      context = gsap.context(() => {
        gsap.set(targets, {
          autoAlpha: 0,
          y: isMobile ? 18 : 30,
          filter: isMobile ? "none" : "blur(6px)",
          willChange: "opacity, transform"
        });

        ScrollTrigger.batch(targets, {
          start: isMobile ? "top 94%" : "top 88%",
          once: true,
          interval: 0.08,
          batchMax: isMobile ? 5 : 8,
          onEnter: (batch) => {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: isMobile ? 0.48 : 0.72,
              ease: "power3.out",
              stagger: isMobile ? 0.025 : 0.045,
              clearProps: "opacity,visibility,transform,filter,willChange"
            });
          }
        });

        ScrollTrigger.refresh();
      });
    }

    setup();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [pathname]);

  return null;
}
