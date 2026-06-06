"use client";

import { CalendarDays, HelpCircle, Settings } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import {
  type Section,
  beaglePortrait,
  navItems,
  petPortrait,
} from "@/lib/pet-data";
import { BrandWordmark } from "./brand-wordmark";
import { SignOutButton } from "./sign-out-button";

function SidebarContent({
  active,
  onNavigate,
}: {
  active: Section;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center border-b border-sidebar-border px-6 py-7 text-center">
        {active === "assistant" ? (
          <div className="mb-2 self-start">
            <BrandWordmark compact />
          </div>
        ) : (
          <>
            <Avatar className="mb-4 size-20 border-2 border-primary/35 p-1">
              <AvatarImage
                alt="Pet profile"
                className="rounded-full object-cover"
                src={
                  active === "discovery" || active === "profiles"
                    ? beaglePortrait
                    : petPortrait
                }
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                FC
              </AvatarFallback>
            </Avatar>
            <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              FourCats
            </h1>
          </>
        )}
        <p className="mt-1 text-xs text-muted-foreground">Singapore · AI care</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              href={item.href}
              key={item.id}
              onClick={onNavigate}
            >
              <Icon className={cn("size-5", selected && "opacity-95")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-sidebar-border p-4">
        <Button
          className="h-10 w-full rounded-xl font-medium shadow-sm"
          size="sm"
          variant="default"
        >
          <CalendarDays className="size-4" />
          Book vet
        </Button>
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 px-2 py-1">
          <span className="px-2 text-xs font-medium text-muted-foreground">
            Theme
          </span>
          <ModeToggle />
        </div>
        <div className="grid gap-0.5">
          <button
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            type="button"
          >
            <Settings className="size-4" />
            Settings
          </button>
          <button
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            type="button"
          >
            <HelpCircle className="size-4" />
            Support
          </button>
          <SignOutButton onSignOut={onNavigate} />
        </div>
      </div>
    </>
  );
}

export function AppSidebar({ active }: { active: Section }) {
  return (
    <aside className="fixed top-0 left-0 z-30 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm md:flex">
      <SidebarContent active={active} />
    </aside>
  );
}

export { SidebarContent };
