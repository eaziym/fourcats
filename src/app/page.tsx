import {
  Bot,
  Heart,
  MapPin,
  ShoppingBag,
  Sparkles,
  Sun,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { careLogItems, mochiPortrait } from "@/lib/pet-data";
import {
  AnimatedList,
  FadeContent,
  Pill,
  ShinyText,
  SpotlightCard,
} from "@/components/pet-care/primitives";
import { PetCareShell } from "@/components/pet-care/shell";

function Dashboard() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-5 pb-12 pt-8 md:ml-64 md:px-16">
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
          <PetCard />
          <div className="grid gap-6">
            <AiCareAlert />
            <DailyCareLog />
          </div>
          <KibbleReminder />
          <NearbyCard />
        </div>
      </section>
    </main>
  );
}

function PetCard() {
  return (
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
  );
}

function AiCareAlert() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffd9dd] to-[#ff7f9b] p-8 shadow-[0_4px_20px_rgba(29,53,87,0.08)]">
      <div className="flex gap-6">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/40">
          <Sun className="size-7" />
        </div>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="font-bold">AI Care Alert</h3>
            <Pill className="bg-white/50 text-[#782338]">High Priority</Pill>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-[#400013]">
            Hot day in SG! Temperatures reaching 32°C. Ensure Mochi stays
            hydrated during walks and avoid pavement between 12pm-4pm.
          </p>
        </div>
      </div>
      <Bot className="absolute -right-4 top-2 size-28 text-[#9c3f53]/15" />
    </div>
  );
}

function DailyCareLog() {
  return (
    <SpotlightCard className="border-0">
      <CardContent className="p-8">
        <div className="mb-7 flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-brand)] text-3xl font-bold">
            Daily Care Log
          </h3>
          <button className="text-sm font-medium text-[#9c3f53]" type="button">
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
  );
}

function KibbleReminder() {
  return (
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
          <button className="mt-3 font-semibold text-[#9c3f53]" type="button">
            Order Now →
          </button>
        </div>
      </CardContent>
    </SpotlightCard>
  );
}

function NearbyCard() {
  return (
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
  );
}

export default function Home() {
  return (
    <PetCareShell active="dashboard">
      <Dashboard />
    </PetCareShell>
  );
}
