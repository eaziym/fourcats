"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useResizableSidebar } from "@/hooks/use-resizable-sidebar";
import { cn } from "@/lib/utils";
import { AppSidebar, SidebarContent } from "./app-sidebar";
import { AppTopBar } from "./app-top-bar";

export function PetCareShell({
  active,
  children,
  lockViewport = false,
}: {
  active: string;
  children: React.ReactNode;
  /** Lock the shell to the viewport height so only inner panes scroll. */
  lockViewport?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { width: sidebarWidth, onGripMouseDown } = useResizableSidebar(248, {
    min: 212,
    max: 340,
  });

  return (
    <div
      className={cn(
        "bg-background text-foreground",
        lockViewport ? "h-dvh overflow-hidden" : "min-h-screen",
      )}
      style={
        {
          "--app-sidebar-width": `${sidebarWidth}px`,
        } as React.CSSProperties
      }
    >
      <AppSidebar
        active={active}
        sidebarWidth={sidebarWidth}
        onGripMouseDown={onGripMouseDown}
      />

      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 rounded-full border border-border/80 bg-card/80 shadow-sm backdrop-blur-md md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5 text-primary" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col border-sidebar-border bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {mobileOpen ? (
            <SidebarContent
              active={active}
              onNavigate={() => setMobileOpen(false)}
              variant="drawer"
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex flex-col pl-0 md:pl-[var(--app-sidebar-width)]",
          lockViewport ? "h-dvh overflow-hidden" : "min-h-screen",
        )}
      >
        <AppTopBar />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
