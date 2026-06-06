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
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <AppSidebar active={active} />

      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-40 rounded-full bg-white/80 shadow-md backdrop-blur md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5 text-[#9c3f53]" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col bg-[#f3f4f5] p-0"
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
