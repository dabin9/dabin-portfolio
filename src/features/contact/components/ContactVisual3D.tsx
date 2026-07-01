"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ContactVisual3DClient = dynamic(
  () => import("./ContactVisual3DClient"),
  {
    ssr: false,
    loading: () => null
  }
);

export default function ContactVisual3D() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!rootRef.current || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "160px 0px",
        threshold: 0.15
      }
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="relative mx-auto h-[180px] w-full max-w-[320px] overflow-visible sm:h-[220px] md:h-[280px] lg:h-[300px]"
    >
      {isVisible ? <ContactVisual3DClient /> : null}
    </div>
  );
}
