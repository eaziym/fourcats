"use client";

import type { ReactNode } from "react";
import { AmbientAurora } from "@/components/react-bits/ambient-aurora";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export function AuthScreen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-screen", className)}>
      <AmbientAurora />
      <ModeToggle className="fixed top-4 right-4 z-50 rounded-full border border-border/70 bg-card/70 shadow-sm backdrop-blur-md" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
