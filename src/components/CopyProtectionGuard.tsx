"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable=''], [data-copy-allow]"
    )
  );
}

export default function CopyProtectionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const shouldProtect = !pathname.startsWith("/admin");
    if (!shouldProtect) return;

    const block = (event: Event) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    };

    document.body.classList.add("copy-protected");
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("selectstart", block);

    return () => {
      document.body.classList.remove("copy-protected");
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("selectstart", block);
    };
  }, [pathname]);

  return null;
}
