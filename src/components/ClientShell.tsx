"use client";

import { type ReactNode } from "react";
import CommandPalette, { type CommandPaletteProject } from "./CommandPalette";
import ScrollProgress from "./ScrollProgress";
import ConsoleSignature from "./ConsoleSignature";
import GsapScrollEffects from "./GsapScrollEffects";
import CopyProtectionGuard from "./CopyProtectionGuard";

export default function ClientShell({
  children,
  commandProjects
}: {
  children: ReactNode;
  commandProjects: CommandPaletteProject[];
}) {
  return (
    <>
      <CopyProtectionGuard />
      <ConsoleSignature />
      <ScrollProgress />
      <GsapScrollEffects />
      <CommandPalette projects={commandProjects} />

      <div className="flex flex-col min-h-screen">{children}</div>
    </>
  );
}
