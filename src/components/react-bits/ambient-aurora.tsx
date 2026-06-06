"use client";

import { cn } from "@/lib/utils";

/**
 * Soft layered gradient orbs (React Bits–style ambient).
 * Keep usage sparse (auth / marketing) so the app stays calm.
 */
export function AmbientAurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="rb-aurora-blob rb-aurora-blob--a bg-primary/20" />
      <div className="rb-aurora-blob rb-aurora-blob--b bg-chart-2/25 dark:bg-chart-2/15" />
      <div className="rb-aurora-blob rb-aurora-blob--c bg-accent/30 dark:bg-accent/10" />
      <div className="absolute inset-0 bg-background/75 dark:bg-background/80" />
    </div>
  );
}
