"use client";

import {
  CalendarDays,
  HelpCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type Section,
  beaglePortrait,
  navItems,
  petPortrait,
} from "@/lib/pet-data";
import { BrandWordmark } from "./brand-wordmark";

function SidebarContent({
  active,
  onNavigate,
}: {
  active: Section;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center border-b border-[#dac0c3]/40 px-6 py-7 text-center">
        {active === "assistant" ? (
          <div className="mb-2 self-start">
            <BrandWordmark compact />
          </div>
        ) : (
          <>
            <Avatar className="mb-4 size-20 border-2 border-[#ff8da1] p-1">
              <AvatarImage
                alt="Little Lovely Pets profile"
                className="rounded-full object-cover"
                src={
                  active === "discovery" || active === "profiles"
                    ? beaglePortrait
                    : petPortrait
                }
              />
              <AvatarFallback>LL</AvatarFallback>
            </Avatar>
            <h1 className="font-[family-name:var(--font-brand)] text-xl font-bold">
              Little Lovely Pets
            </h1>
          </>
        )}
        <p className="mt-1 text-sm text-[#554244]">Singapore AI Care</p>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <Link
              className={cn(
                "flex items-center gap-4 rounded-2xl px-4 py-3 text-left text-base font-semibold transition-all",
                selected
                  ? "translate-x-1 bg-[#ff8da1] text-[#782338] shadow-sm"
                  : "text-[#554244] hover:bg-[#e7e8e9]",
              )}
              href={item.href}
              key={item.id}
              onClick={onNavigate}
            >
              <Icon className={cn("size-6", selected && "fill-current")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#dac0c3]/40 p-4">
        <Button className="mb-5 h-11 w-full rounded-full bg-gradient-to-r from-[#9c3f53] to-[#ff8da1] text-base font-bold text-white shadow-md hover:opacity-95">
          <CalendarDays className="size-5" />
          Book Vet
        </Button>
        <div className="grid gap-2">
          <button
            className="flex items-center gap-4 rounded-2xl px-3 py-2 text-[#554244]"
            type="button"
          >
            <Settings className="size-5" />
            Settings
          </button>
          <button
            className="flex items-center gap-4 rounded-2xl px-3 py-2 text-[#554244]"
            type="button"
          >
            <HelpCircle className="size-5" />
            Support
          </button>
        </div>
      </div>
    </>
  );
}

export function AppSidebar({ active }: { active: Section }) {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-[#dac0c3]/60 bg-[#f3f4f5] shadow-[0_4px_20px_rgba(29,53,87,0.08)] md:flex">
      <SidebarContent active={active} />
    </aside>
  );
}

export { SidebarContent };
