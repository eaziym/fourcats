"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const iconClass = compact ? "size-4" : "size-5";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        aria-hidden
        className={className}
        disabled
        size={compact ? "icon-sm" : "icon"}
        variant="ghost"
      >
        <Sun className={cn(iconClass, "opacity-0")} />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size={compact ? "icon-sm" : "icon"}
      variant="ghost"
    >
      {isDark ? (
        <Sun className={cn(iconClass, "text-amber-400/90")} />
      ) : (
        <Moon className={cn(iconClass, "text-muted-foreground")} />
      )}
    </Button>
  );
}
