"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bone,
  Bot,
  CalendarDays,
  Camera,
  Check,
  CircleUserRound,
  ClipboardCheck,
  Cross,
  Filter,
  Heart,
  HelpCircle,
  Info,
  LayoutDashboard,
  Map as MapIcon,
  MapPin,
  Menu,
  Mic,
  PawPrint,
  Scissors,
  Search,
  SendHorizontal,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const petPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5Bw9pyLW7L7GdkWQZioIUXJaW4jweQZOeH11m-8TXbxwv3Vhbv6fw50Aj_V7cwu0oWDmCr4DaKFE5U5U1vNo_v6ty2AJ90ORQFdPEJHXUzPlC_aSeODoWlo2U0qemWtYaKFueZHPBA0WabMXFpKDkRJCED-e9VA9wACWeMhcXVkTXuW7R94mc6HubYx2wmTYF8my7HRZG13bss2rO3GZQ7fi_1BKSdybcbm-gNaZerZKQUDqMRsC3sjGWG6X8KxmAACjpgOMkWhhX";
const mochiPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjyf1cAFJJy7tu7uEbnFYn-aJr0KkIlGrAbTDzJgFkZMV1C8rEnwJY_TLRiaNW-GreL4R-GtItkX6uQgi7k6z_-dwZetX2KWotALR4p9Y4COvbcu8sD4HqCthDyxd8RJs4WNVD_3l1MEt-UmaWcxaZAQXKXEdRsQq52A3OMtMu_EIkwoaRp47MHUag7ssY93pe3t5GmKKSm5xxIQvfEfev1-yVwZRfx_3JJTWpWkCW7nOpX0YIiWUga5x2lhJLMFKsyGPtNC3wWSh0";
const beaglePortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCv94TFws-tNGWP412mfGDKxzJ2Z4XByL8qakxZsbZ7ckBtXI3brbpNhp5Qu2BI3ADK4E8nhzFQG4G3AaFFpFxoCUfLmTNNETF2Jr-84LyG9d2O_9JwIM3yMg5lR6n5JAPXmpTNomZGI9a1EF0TdpACAflvKptgWs9JzLI04LY4q39Wb61r3GFrwmrzBQyRakJTmDB21y-yN-JL7tSLC3GIOTgANmiVgT-VVv04qrnxSnFrEs-rTDAoncMHvq1YY9rr3-f0g0loxibP";
const groomerInterior =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAlLKuZPIhuJM2C0jxueuLSLdneouU7Gor2PjNGg7b7Lh4fJk1AX3pPpY7vuWuq7nD75zK-0Fy5H2ihq-V6fBAfd1_W0E6p22O1LZiJWj9yh7kT6p0dUtzqhy94LYEAlVeO-w0wz2M0pQjcZP8aV2xb-u3FGxj9cFyaDnk6Vxw_Vd_fqIvR2Zdhwx08TEqev5O5Sxb1oYIX-rca5KIz8YF46RLMJ8OgQ63XsCfQ4aM6YjQRm8VOiVYG2c_mepLMwCA-Lv-Bp4xFMHU";
const uploadDog =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBDns6lVMF2hdG1OHEC4sXq75t76bgKwMKft85OPru7uDfoEIVcvDoS7Lily-SUAdRiZV0vDKpQ8qR2B5YLIUmvEbDXFM9kcQG0wFU3OeYnOwZJ0FA_XuL0FvOlK_mc92ElLXZy5FPFbxaMVLB03RT0yvI4zVUslho91BHnWzCceCD8xwELNwBGRj9I_JW2eFBDg3iW7tnhsYkh1shIt-fpzVuYQ9q8RbRj0SPz_SsroX3s9v6LTx0cWG_n3_84LBY3WNJ_2iJQyBSs";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "assistant", label: "AI Assistant", icon: Bot, href: "/assistant" },
  {
    id: "discovery",
    label: "Local Discovery",
    icon: MapIcon,
    href: "/discovery",
  },
  { id: "profiles", label: "Pet Profiles", icon: PawPrint, href: "/profiles" },
] as const;

export type Section = (typeof navItems)[number]["id"];

const careLogItems = [
  {
    title: "Morning Feeding",
    subtitle: "1/2 cup hypoallergenic kibble",
    time: "08:00 AM",
    icon: Check,
    tone: "bg-[#d5e3ff] text-[#2c4366]",
    done: true,
  },
  {
    title: "Heartworm Medication",
    subtitle: "Monthly chewable",
    time: "",
    icon: ClipboardCheck,
    tone: "bg-[#ff8da1] text-[#782338]",
    done: false,
  },
  {
    title: "Evening Walk",
    subtitle: "East Coast Park",
    time: "06:30 PM",
    icon: UserRound,
    tone: "bg-[#f8f9fa] text-[#554244] border border-[#dac0c3]",
    done: false,
  },
];

const discoveryFilters = [
  { label: "Groomers", icon: Scissors, active: true },
  { label: "Vets", icon: Cross, active: false },
  { label: "Pet-Friendly Cafes", icon: Bone, active: false },
  { label: "Supplies", icon: ShoppingBag, active: false },
];

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {compact ? (
        <PawPrint className="size-7 fill-current text-[#9c3f53]" />
      ) : null}
      <span className="font-[family-name:var(--font-brand)] text-3xl font-bold leading-tight text-[#9c3f53] md:text-4xl">
        Little Lovely{compact ? <br /> : " "}Pets
      </span>
    </div>
  );
}

function Sidebar({ active }: { active: Section }) {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-[#dac0c3]/60 bg-[#f3f4f5] shadow-[0_4px_20px_rgba(29,53,87,0.08)] md:flex">
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
    </aside>
  );
}

function TopBar({ active }: { active: Section }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-[#f8f9fa]/95 px-5 shadow-sm backdrop-blur md:pl-80 md:pr-16">
      <div className="flex items-center gap-3">
        <button
          className="rounded-full p-2 text-[#9c3f53] md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <div
          className={cn(
            active === "assistant" ? "hidden md:flex" : "md:hidden",
          )}
        >
          <BrandWordmark />
        </div>
        {active === "assistant" ? (
          <div className="hidden items-center rounded-full border border-[#dac0c3]/70 bg-[#f3f4f5] px-3 py-1 md:flex">
            <Avatar className="mr-2 size-6">
              <AvatarImage alt="Mochi" src={mochiPortrait} />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <span className="text-sm text-[#554244]">
              Chatting for: <strong className="text-[#191c1d]">Mochi</strong> •
              Shih Tzu, 4yo • Sensitive Skin
            </span>
          </div>
        ) : null}
      </div>

      <div className="hidden items-center gap-8 md:flex">
        {active === "dashboard"
          ? navItems.map((item) => (
              <Link
                className={cn(
                  "h-16 border-b-2 text-lg transition-colors",
                  active === item.id
                    ? "border-[#9c3f53] font-semibold text-[#9c3f53]"
                    : "border-transparent text-[#554244]",
                )}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </Link>
            ))
          : null}
      </div>

      <div className="flex items-center gap-4 text-[#9c3f53]">
        {active === "dashboard" ? (
          <Search className="hidden size-5 md:block" />
        ) : null}
        <Bell className="size-5" />
        <CircleUserRound className="size-6" />
      </div>

      {open ? (
        <div className="absolute left-4 right-4 top-20 rounded-2xl border border-[#dac0c3]/60 bg-white p-2 shadow-xl md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold",
                  active === item.id
                    ? "bg-[#ff8da1] text-[#782338]"
                    : "text-[#554244]",
                )}
                href={item.href}
                key={item.id}
                onClick={() => {
                  setOpen(false);
                }}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-0 px-3 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

function FadeContent({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("rb-fade-content", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function AnimatedList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("rb-animated-list", className)}>{children}</div>;
}

function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rb-spotlight-card rounded-2xl border-[#dac0c3]/40 bg-white py-0 shadow-[0_4px_20px_rgba(29,53,87,0.05)]",
        className,
      )}
    >
      {children}
    </Card>
  );
}

function ShinyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("rb-shiny-text", className)}>{children}</span>;
}

export function Dashboard() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-5 pb-12 pt-24 md:ml-64 md:px-16">
      <section className="mx-auto max-w-6xl">
        <FadeContent className="mb-10">
          <h2 className="font-[family-name:var(--font-brand)] text-5xl font-bold leading-tight text-[#191c1d] md:text-6xl">
            <ShinyText>Good Morning, Sarah!</ShinyText>
          </h2>
          <p className="mt-2 text-xl text-[#554244]">
            Here's Mochi's care summary for today.
          </p>
        </FadeContent>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
          <SpotlightCard className="overflow-hidden border-0">
            <div className="flex items-center gap-5 bg-[#ffd9dd] p-8">
              <Avatar className="size-24 border-4 border-white">
                <AvatarImage
                  alt="Mochi profile"
                  className="object-cover"
                  src={mochiPortrait}
                />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-[family-name:var(--font-brand)] text-3xl font-bold">
                  Mochi
                </h3>
                <Pill className="mt-2 bg-[#ffdf9b] text-[#765900]">
                  <Sparkles className="size-3" />
                  HDB-Approved
                </Pill>
              </div>
            </div>
            <CardContent className="grid min-h-[430px] content-between p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#d9dadb] bg-[#f8f9fa] p-5">
                  <p className="text-xs font-semibold tracking-widest text-[#554244]">
                    WEIGHT
                  </p>
                  <p className="mt-4 text-xl">6.2 kg</p>
                </div>
                <div className="rounded-xl border border-[#d9dadb] bg-[#f8f9fa] p-5">
                  <p className="text-xs font-semibold tracking-widest text-[#554244]">
                    AGE
                  </p>
                  <p className="mt-4 text-xl">3 yrs</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#c8f8d8] text-emerald-700">
                  <Heart className="size-6" />
                </div>
                <div>
                  <p className="font-semibold">Health Status</p>
                  <p className="text-sm">All Good</p>
                  <p className="text-sm text-[#554244]">
                    Next checkup in 4 months
                  </p>
                </div>
              </div>
            </CardContent>
          </SpotlightCard>

          <div className="grid gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffd9dd] to-[#ff7f9b] p-8 shadow-[0_4px_20px_rgba(29,53,87,0.08)]">
              <div className="flex gap-6">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/40">
                  <Sun className="size-7" />
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="font-bold">AI Care Alert</h3>
                    <Pill className="bg-white/50 text-[#782338]">
                      High Priority
                    </Pill>
                  </div>
                  <p className="max-w-3xl text-lg leading-8 text-[#400013]">
                    Hot day in SG! Temperatures reaching 32°C. Ensure Mochi
                    stays hydrated during walks and avoid pavement between
                    12pm-4pm.
                  </p>
                </div>
              </div>
              <Bot className="absolute -right-4 top-2 size-28 text-[#9c3f53]/15" />
            </div>

            <SpotlightCard className="border-0">
              <CardContent className="p-8">
                <div className="mb-7 flex items-center justify-between">
                  <h3 className="font-[family-name:var(--font-brand)] text-3xl font-bold">
                    Daily Care Log
                  </h3>
                  <button
                    className="text-sm font-medium text-[#9c3f53]"
                    type="button"
                  >
                    View All
                  </button>
                </div>
                <AnimatedList className="grid gap-7">
                  {careLogItems.map(
                    ({ title, subtitle, time, icon: Icon, tone, done }) => (
                      <div className="flex items-center gap-5" key={title}>
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-full",
                            tone,
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "font-semibold",
                              done && "text-[#554244] line-through",
                            )}
                          >
                            {title}
                          </p>
                          <p className="text-[#554244]">{subtitle}</p>
                        </div>
                        {time ? (
                          <span className="text-sm text-[#554244]">{time}</span>
                        ) : (
                          <Button className="rounded-full bg-[#9c3f53]">
                            Mark Done
                          </Button>
                        )}
                      </div>
                    ),
                  )}
                </AnimatedList>
              </CardContent>
            </SpotlightCard>
          </div>

          <SpotlightCard className="border-[#b0c7f1]">
            <CardContent className="flex min-h-60 items-center gap-8 p-8">
              <div className="flex size-20 items-center justify-center rounded-xl bg-[#e1e3e4] text-[#485f84]">
                <ShoppingBag className="size-9" />
              </div>
              <div>
                <h3 className="font-bold">Low on Kibble?</h3>
                <p className="mt-2 max-w-md text-[#554244]">
                  Time for Mochi's hypo-allergenic food order from Kohepets.
                </p>
                <button
                  className="mt-3 font-semibold text-[#9c3f53]"
                  type="button"
                >
                  Order Now →
                </button>
              </div>
            </CardContent>
          </SpotlightCard>

          <SpotlightCard className="border-0">
            <CardContent className="p-8">
              <div className="mb-5 flex items-center gap-3 font-semibold">
                <MapPin className="size-6 text-[#485f84]" />
                Nearby in Tampines
              </div>
              <div className="flex h-32 items-center justify-center rounded-lg bg-[#e5dece] text-lg text-[#785a00]">
                Interactive Map Area
              </div>
              <div className="mt-5 flex justify-between text-[#191c1d]">
                <span>The Animal Clinic</span>
                <span>1.2km away</span>
              </div>
            </CardContent>
          </SpotlightCard>
        </div>
      </section>
    </main>
  );
}

export function Assistant() {
  return (
    <main className="grid min-h-screen bg-[#f8f9fa] pt-16 md:ml-64 lg:grid-cols-[1fr_320px]">
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[radial-gradient(#dac0c3_1px,transparent_1px)] [background-size:34px_34px]">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-5 py-8 md:px-10">
          <div className="mx-auto rounded-full bg-[#edeeef] px-5 py-2 text-sm text-[#554244]">
            Today
          </div>
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ff8da1] text-[#782338]">
              <Bot className="size-5" />
            </div>
            <div className="max-w-2xl rounded-2xl bg-white/90 p-6 text-xl leading-8 shadow-[0_4px_20px_rgba(29,53,87,0.05)] backdrop-blur">
              Hi there! How is Mochi doing today? I'm ready to help with any
              grooming, health, or lifestyle questions you have for your Shih
              Tzu.
            </div>
          </div>

          <div className="ml-auto flex max-w-3xl items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#ffd9dd] to-[#ff8da1] p-6 text-xl leading-8 text-[#782338] shadow-sm">
              Best groomer near Tampines for my Shih Tzu with sensitive skin?
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ffd167] text-[#765900]">
              <UserRound className="size-5" />
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ff8da1] text-[#782338]">
              <Bot className="size-5" />
            </div>
            <div className="max-w-2xl rounded-2xl bg-white/90 p-7 text-xl leading-8 shadow-[0_4px_20px_rgba(29,53,87,0.05)] backdrop-blur">
              <p>
                Based on Mochi's profile, sensitive skin requires special care.
                I've found a highly-rated groomer in Tampines that specializes
                in dermatological needs.
              </p>
              <div className="my-5 flex gap-4 rounded-xl border border-[#dac0c3]/60 bg-[#f8f9fa] p-4 text-base leading-6">
                <img
                  alt="Heartland Paws Tampines"
                  className="size-20 rounded-lg object-cover"
                  src={groomerInterior}
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-2">
                    <h4 className="font-bold">Heartland Paws Tampines</h4>
                    <Pill className="bg-[#ffdf9b] text-[#765900]">
                      <Star className="size-3 fill-current" />
                      4.8
                    </Pill>
                  </div>
                  <p className="text-[#554244]">
                    Specializes in medicated baths & hypoallergenic styling.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill className="bg-[#ffdf9b]/70 text-[#785a00]">
                      HDB-Approved
                    </Pill>
                    <Pill className="bg-[#edeeef] text-[#554244]">
                      1.2km away
                    </Pill>
                  </div>
                </div>
              </div>
              <p>
                They use an oatmeal-based medicated shampoo which is perfect for
                Shih Tzus with sensitive skin. Would you like me to check their
                availability for this weekend?
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Yes, check Saturday", "Show other options", "Call them"].map(
                  (action) => (
                    <button
                      className="rounded-full border border-[#dac0c3] bg-[#f3f4f5] px-4 py-2 text-sm font-medium text-[#9c3f53]"
                      key={action}
                      type="button"
                    >
                      {action}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa] p-5 md:px-10">
          <div className="mx-auto flex max-w-4xl items-center gap-4 rounded-full border border-[#dac0c3]/70 bg-white px-5 py-3 shadow-[0_12px_28px_rgba(29,53,87,0.14)]">
            <Mic className="size-5 text-[#887274]" />
            <span className="flex-1 truncate text-[#887274]">
              Ask about Mochi's health, diet, or local services...
            </span>
            <Button className="size-11 rounded-full bg-[#9c3f53]" size="icon">
              <SendHorizontal className="size-5" />
            </Button>
          </div>
        </div>
      </section>

      <aside className="hidden border-l border-[#dac0c3]/40 bg-white px-8 py-8 lg:block">
        <h3 className="mb-8 flex items-center gap-3 text-sm font-bold tracking-wide text-[#554244]">
          <Info className="size-5" />
          AI CONTEXT SOURCES
        </h3>
        <div className="grid gap-4">
          {[
            [
              "Google Maps API",
              "Heartland Paws Reviews",
              '"Absolutely wonderful with my sensitive pup. They used a special medicated shampoo that didn’t irritate her skin at all...."',
              MapIcon,
            ],
            [
              "Pet Lovers Centre Data",
              "Oatmeal Medicated Shampoo",
              "Recommended for Shih Tzus (Age 3+). Alleviates itching and environmental allergies common in humid Singaporean climates.",
              ShoppingBag,
            ],
          ].map(([source, title, detail, Icon]) => (
            <div
              className="rounded-2xl border border-[#dac0c3]/70 bg-[#f8f9fa] p-4"
              key={String(title)}
            >
              <p className="mb-4 flex items-center gap-2 text-sm">
                <span className="rounded-md bg-[#d5e3ff] p-2 text-[#2c4366]">
                  <Icon className="size-4" />
                </span>
                {source as string}
              </p>
              <h4 className="mb-2 text-xl">{title as string}</h4>
              <p className="text-sm leading-6 text-[#554244]">
                {detail as string}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}

export function Discovery() {
  return (
    <main className="flex min-h-screen flex-col bg-white pt-16 md:ml-64 md:flex-row md:pt-0">
      <section className="z-10 flex w-full flex-col border-r border-[#dac0c3]/30 bg-white shadow-[4px_0_24px_rgba(29,53,87,0.08)] md:h-screen md:w-[500px]">
        <div className="border-b border-[#dac0c3]/30 p-5 md:p-8">
          <h2 className="font-[family-name:var(--font-brand)] text-4xl font-bold md:text-5xl">
            Local Discovery
          </h2>
          <p className="mt-1 text-lg text-[#554244]">
            Find trusted services in Singapore.
          </p>
          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 size-6 -translate-y-1/2 text-[#887274]" />
            <Input
              className="h-14 rounded-xl border-[#dac0c3]/70 bg-[#f8f9fa] pl-12 pr-14 text-lg"
              placeholder="Find services near Tampines..."
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-[#edeeef] p-2 text-[#554244]"
              type="button"
            >
              <SlidersHorizontal className="size-5" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#ffd167] bg-gradient-to-r from-[#ffdf9b]/50 to-white p-2">
            <Avatar className="size-9">
              <AvatarImage alt="Mochi" src={mochiPortrait} />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-[#785a00]">
                Top picks for Mochi
              </p>
              <p className="text-xs text-[#554244]">
                Filtered for sensitive skin expertise
              </p>
            </div>
            <button
              className="ml-auto px-2 text-sm font-bold text-[#9c3f53]"
              type="button"
            >
              Edit
            </button>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {discoveryFilters.map(({ label, icon: Icon, active }) => (
              <button
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                  active
                    ? "border-[#9c3f53] bg-[#9c3f53] text-white"
                    : "border-[#dac0c3] bg-[#edeeef] text-[#191c1d]",
                )}
                key={label}
                type="button"
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 overflow-y-auto p-5 md:p-8">
          {[
            [
              "Fluffy Paws Spa",
              "Tampines Hub • 1.2km",
              "Sensitive Skin Expert",
              "4.9",
              true,
            ],
            [
              "Urban Tails Grooming",
              "Bedok Mall • 3.5km",
              "Organic Shampoos",
              "4.7",
              false,
            ],
          ].map(([name, location, tag, rating, selected]) => (
            <SpotlightCard
              className={cn(
                selected && "bg-gradient-to-r from-white to-[#ffdf9b]/20",
              )}
              key={String(name)}
            >
              <CardContent className="flex gap-5 p-4">
                <div className="relative">
                  <img
                    alt={String(name)}
                    className="size-28 rounded-lg object-cover"
                    src={groomerInterior}
                  />
                  <Pill className="absolute left-1 top-1 bg-white text-[#785a00] shadow">
                    <Star className="size-3 fill-current" />
                    {rating as string}
                  </Pill>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-4">
                    <h3 className="font-[family-name:var(--font-brand)] text-2xl font-bold">
                      {name as string}
                    </h3>
                    <Heart className="size-6 text-[#887274]" />
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-[#554244]">
                    <MapPin className="size-4" />
                    {location as string}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill className="rounded-md border border-[#ffd167] bg-[#ffdf9b]/70 text-[#d48700]">
                      {tag as string}
                    </Pill>
                    <Pill className="rounded-md bg-[#edeeef] text-[#554244]">
                      HDB-Approved
                    </Pill>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold text-[#9c3f53]">$$$</span>
                    <Button className="rounded-full bg-[#ffd9dd] text-[#9c3f53] hover:bg-[#ffb2bd]">
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </SpotlightCard>
          ))}
          <div className="relative overflow-hidden rounded-2xl bg-[#b0c7f1] p-6 text-[#18365f]">
            <Pill className="mb-4 rounded-md bg-[#1d3557] text-white">
              SPECIAL OFFER
            </Pill>
            <h3 className="text-2xl font-bold">First Grooming 20% Off</h3>
            <p className="mt-2">
              Available at selected partners near Tampines.
            </p>
            <Button className="mt-5 rounded-full bg-[#1d3557]">
              Claim Offer
            </Button>
            <Tag className="absolute -right-2 bottom-0 size-32 text-[#1d3557]/20" />
          </div>
        </div>
      </section>

      <section className="relative h-[520px] flex-1 overflow-hidden bg-[#8fc4bd] md:h-screen">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(35deg,transparent_49%,white_50%,transparent_51%),linear-gradient(118deg,transparent_49%,white_50%,transparent_51%),linear-gradient(90deg,transparent_49%,white_50%,transparent_51%)] [background-size:140px_110px,190px_160px,86px_86px]" />
        <Button className="absolute left-1/2 top-8 z-10 -translate-x-1/2 rounded-full bg-white text-[#9c3f53] shadow-lg hover:bg-white">
          <Search className="size-4" />
          Search this area
        </Button>
        <div className="absolute right-5 top-6 z-10 grid gap-3">
          <Button
            className="size-12 rounded-full bg-white text-black shadow-md hover:bg-white"
            size="icon"
          >
            <Cross className="size-6" />
          </Button>
          <div className="grid overflow-hidden rounded-full bg-white shadow-md">
            <button className="px-4 py-3 text-2xl" type="button">
              +
            </button>
            <button className="px-4 py-3 text-2xl" type="button">
              −
            </button>
          </div>
        </div>
        <div className="absolute left-[42%] top-[40%] z-10 flex items-center gap-3 rounded-xl bg-white/85 p-3 shadow-md backdrop-blur">
          <div className="flex size-12 items-center justify-center rounded-lg bg-[#20333c] text-cyan-300">
            <Sparkles className="size-5 fill-current" />
          </div>
          <div>
            <p className="font-semibold">Fluffy Paws Spa</p>
            <p className="text-sm font-semibold text-[#9c3f53]">☆ 4.9 (120)</p>
          </div>
        </div>
        <div className="absolute left-[45%] top-[50%] z-10 flex size-12 items-center justify-center rounded-full border-4 border-white bg-[#9c3f53] text-white shadow-md">
          <Scissors className="size-6" />
        </div>
        <div className="absolute left-[68%] top-[29%] z-10 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#785a00] text-white shadow-md">
          <Cross className="size-4" />
        </div>
        <div className="absolute left-[62%] top-[62%] z-10 flex size-10 items-center justify-center rounded-full border-2 border-white bg-[#f8f9fa] text-[#554244] shadow-md">
          <Scissors className="size-5" />
        </div>
      </section>
    </main>
  );
}

export function Profiles() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-16">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-[#f8f9fa] px-5 shadow-sm md:px-16">
        <div className="flex items-center gap-3">
          <Link aria-label="Back to dashboard" href="/">
            <ArrowLeft className="size-6 text-[#554244]" />
          </Link>
          <BrandWordmark />
        </div>
        <span className="text-lg text-[#554244]">Setup</span>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-brand)] text-4xl font-bold md:text-5xl">
            Let’s meet your furry friend
          </h2>
          <p className="mt-3 text-xl text-[#554244]">
            Tell us a bit about them so we can tailor the best care in
            Singapore.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <div className="mb-3 flex justify-between text-sm">
              <span className="font-bold text-[#9c3f53]">Basic Info</span>
              <span>Vitals</span>
              <span>Health</span>
              <span>Location</span>
            </div>
            <Progress
              className="h-2 bg-[#e1e3e4] [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#ff8da1] [&_[data-slot=progress-indicator]]:to-[#9c3f53]"
              value={25}
            />
          </div>
        </div>

        <SpotlightCard>
          <CardContent className="p-6 md:p-12">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="grid gap-7">
                <button
                  className="relative flex h-60 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#dac0c3] bg-[#f3f4f5]"
                  type="button"
                >
                  <img
                    alt="Upload pet"
                    className="absolute inset-0 size-full object-cover opacity-35"
                    src={uploadDog}
                  />
                  <div className="relative flex flex-col items-center">
                    <span className="mb-3 rounded-full bg-white p-4 text-[#9c3f53] shadow-sm">
                      <Camera className="size-7" />
                    </span>
                    <span className="font-semibold">Upload Photo</span>
                    <span className="text-sm text-[#554244]">
                      Show off that cute face
                    </span>
                  </div>
                </button>
                <div className="grid gap-2">
                  <Label className="font-semibold" htmlFor="pet-name">
                    Pet's Name
                  </Label>
                  <Input
                    id="pet-name"
                    className="h-16 rounded-xl border-[#dac0c3]/70 bg-[#f8f9fa] text-lg"
                    placeholder="e.g., Milo"
                  />
                </div>
              </div>

              <div className="grid content-start gap-7">
                <div>
                  <p className="mb-2 font-semibold">Species</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      className="rounded-2xl border-2 border-[#9c3f53] bg-[#ffd9dd]/70 p-8 text-center font-bold"
                      type="button"
                    >
                      <PawPrint className="mx-auto mb-3 size-9 fill-current" />
                      Dog
                    </button>
                    <button
                      className="rounded-2xl bg-[#f3f4f5] p-8 text-center font-bold"
                      type="button"
                    >
                      <PawPrint className="mx-auto mb-3 size-9" />
                      Cat
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 font-semibold">
                  <span>Breed</span>
                  <div className="flex h-16 items-center justify-between rounded-xl border border-[#dac0c3]/70 bg-[#f8f9fa] px-5 text-lg text-[#191c1d]">
                    Select breed...
                    <Filter className="size-5 text-[#554244]" />
                  </div>
                  <span className="text-sm font-normal text-[#554244]">
                    Selecting "Singapore Special" helps us tailor local HDB
                    guidelines.
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-end border-t border-[#dac0c3]/40 pt-8">
              <Button className="h-14 rounded-full bg-gradient-to-r from-[#ff8da1] to-[#9c3f53] px-10 text-xl font-bold shadow-md">
                Next: Vitals
                <ArrowRight className="size-6" />
              </Button>
            </div>
          </CardContent>
        </SpotlightCard>
      </section>
    </main>
  );
}

export function PetCareShell({
  active,
  children,
}: {
  active: Section;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <Sidebar active={active} />
      <TopBar active={active} />
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <PetCareShell active="dashboard">
      <Dashboard />
    </PetCareShell>
  );
}
