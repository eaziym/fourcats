"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Section } from "@/lib/pet-data";
import { AppSidebar, SidebarContent } from "./app-sidebar";

export function PetCareShell({
  active,
  children,
}: {
  active: Section;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar active={active} />

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
          <SidebarContent
            active={active}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {children}
    </div>
  );
}
