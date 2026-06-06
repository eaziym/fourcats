"use client";

import { Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationsBell } from "@/components/pet-care/notifications-bell";
import { PetSwitcher } from "@/components/pet-care/pet-switcher";
import { cn } from "@/lib/utils";

const ROUTE_META: Record<string, { title: string; sub?: string }> = {
  "/": { title: "Dashboard", sub: "Care summary & reminders" },
  "/assistant": {
    title: "AI Assistant",
    sub: "Profile-aware · grounded in SG data",
  },
  "/discovery": { title: "Local Discovery", sub: "Services near you" },
  "/profiles": { title: "Pet Profiles", sub: "Your lovely pets" },
  "/settings": {
    title: "Settings",
    sub: "Profile & budget preferences",
  },
};

const TOPBAR_ICON =
  "grid size-10 shrink-0 place-items-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted";

export function AppTopBar() {
  const pathname = usePathname() ?? "/";
  const meta = ROUTE_META[pathname] ?? {
    title: "Little Lovely Pets",
    sub: "Singapore AI care",
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 hidden h-[66px] shrink-0 items-center gap-4 border-b border-border px-7 backdrop-blur-[10px] md:flex",
        "bg-background/80",
      )}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <h1 className="truncate font-llp-display text-lg font-bold leading-tight tracking-tight text-foreground">
          {meta.title}
        </h1>
        {meta.sub ? (
          <p className="truncate text-[12.5px] leading-snug text-muted-foreground">
            {meta.sub}
          </p>
        ) : null}
      </div>

      <div className="hidden shrink-0 items-center md:flex">
        <PetSwitcher variant="topbar" />
      </div>

      <div
        aria-hidden
        className="hidden h-8 w-px shrink-0 bg-border md:block"
      />

      <div className="flex shrink-0 items-center gap-2">
        <Link
          className={cn(TOPBAR_ICON, "hidden lg:grid")}
          href="/discovery"
          aria-label="Search"
        >
          <Search className="size-[21px]" />
        </Link>
        <NotificationsBell />
        <Link
          className={TOPBAR_ICON}
          href="/settings"
          aria-label="Account settings"
        >
          <UserRound className="size-5" />
        </Link>
      </div>
    </header>
  );
}
