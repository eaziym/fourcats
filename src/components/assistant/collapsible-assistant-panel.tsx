"use client";

import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CollapsibleAssistantPanelProps = {
  side: "left" | "right";
  collapsed: boolean;
  onToggle: () => void;
  expandedWidthClass: string;
  expandedInnerWidthClass: string;
  collapsedLabel: string;
  expandTooltip: string;
  breakpointClass: string;
  className?: string;
  children: ReactNode;
};

export function CollapsibleAssistantPanel({
  side,
  collapsed,
  onToggle,
  expandedWidthClass,
  expandedInnerWidthClass,
  collapsedLabel,
  expandTooltip,
  breakpointClass,
  className,
  children,
}: CollapsibleAssistantPanelProps) {
  const [animReady, setAnimReady] = useState(false);
  const isLeft = side === "left";
  const OpenIcon = isLeft ? PanelLeftOpen : PanelRightOpen;
  const tooltipSide = isLeft ? "right" : "left";

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setAnimReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <aside
      className={cn(
        "relative hidden min-h-0 shrink-0 flex-col overflow-hidden",
        isLeft ? "border-r" : "border-l",
        breakpointClass,
        animReady &&
          "motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-in-out",
        collapsed ? "w-11" : expandedWidthClass,
        className,
      )}
    >
      <div
        aria-hidden={!collapsed}
        className={cn(
          "absolute inset-0 z-10 flex justify-center bg-inherit",
          animReady &&
            "motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-in-out",
          collapsed
            ? "pointer-events-auto opacity-100 motion-safe:delay-75"
            : "pointer-events-none opacity-0",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label={expandTooltip}
              className="flex h-full w-full flex-col items-center gap-3 px-1 py-4 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              onClick={onToggle}
              tabIndex={collapsed ? 0 : -1}
              type="button"
            >
              <OpenIcon className="size-4 shrink-0" />
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.12em] [writing-mode:vertical-rl]",
                  isLeft && "rotate-180",
                )}
              >
                {collapsedLabel}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>{expandTooltip}</TooltipContent>
        </Tooltip>
      </div>

      <div
        aria-hidden={collapsed}
        className={cn(
          "flex min-h-0 flex-1 flex-col bg-inherit",
          expandedInnerWidthClass,
          animReady &&
            "motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-in-out",
          collapsed
            ? cn(
                "pointer-events-none opacity-0",
                isLeft ? "-translate-x-3" : "translate-x-3",
              )
            : "translate-x-0 opacity-100 motion-safe:delay-75",
        )}
      >
        {children}
      </div>
    </aside>
  );
}
