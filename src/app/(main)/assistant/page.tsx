import {
  Bot,
  Info,
  Map as MapIcon,
  Mic,
  SendHorizontal,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { groomerInterior } from "@/lib/pet-data";
import { Pill } from "@/components/pet-care/primitives";
import { PetCareShell } from "@/components/pet-care/shell";

function ChatArea() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-muted/20 [background-image:radial-gradient(color-mix(in_oklch,var(--border),transparent_40%)_1px,transparent_1px)] [background-size:30px_30px]">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-5 py-8 md:px-10">
        <div className="mx-auto rounded-full bg-muted px-5 py-2 text-sm text-muted-foreground">
          Today
        </div>

        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Bot className="size-5" />
          </div>
          <div className="max-w-2xl rounded-2xl border border-border/60 bg-card/95 p-6 text-lg leading-relaxed text-foreground shadow-sm backdrop-blur-sm">
            Hi there! How is Mochi doing today? I&apos;m ready to help with any
            grooming, health, or lifestyle questions you have for your Shih Tzu.
          </div>
        </div>

        <div className="ml-auto flex max-w-3xl items-center gap-4">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-accent/40 p-6 text-lg leading-relaxed text-foreground shadow-sm">
            Best groomer near Tampines for my Shih Tzu with sensitive skin?
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <UserRound className="size-5" />
          </div>
        </div>

        <GroomerRecommendation />
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent p-5 md:px-10">
        <div className="mx-auto flex max-w-4xl items-center gap-4 rounded-full border border-border bg-card px-5 py-3 shadow-md">
          <Mic className="size-5 text-muted-foreground" />
          <span className="flex-1 truncate text-muted-foreground">
            Ask about Mochi&apos;s health, diet, or local services…
          </span>
          <Button className="size-11 shrink-0 rounded-full" size="icon">
            <SendHorizontal className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function GroomerRecommendation() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
        <Bot className="size-5" />
      </div>
      <div className="max-w-2xl rounded-2xl border border-border/60 bg-card/95 p-7 text-lg leading-relaxed shadow-sm backdrop-blur-sm">
        <p>
          Based on Mochi&apos;s profile, sensitive skin requires special care.
          I&apos;ve found a highly-rated groomer in Tampines that specializes in
          dermatological needs.
        </p>
        <div className="my-5 flex gap-4 rounded-xl border border-border bg-muted/40 p-4 text-base leading-relaxed">
          <Avatar className="size-20 shrink-0 rounded-lg">
            <AvatarImage alt="Heartland Paws Tampines" src={groomerInterior} />
            <AvatarFallback>HP</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between gap-2">
              <h4 className="font-semibold">Heartland Paws Tampines</h4>
              <Pill className="border-0 bg-secondary text-secondary-foreground">
                <Star className="size-3 fill-current" />
                4.8
              </Pill>
            </div>
            <p className="text-muted-foreground">
              Specializes in medicated baths & hypoallergenic styling.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill className="border-0 bg-primary/15 text-primary">
                HDB-approved
              </Pill>
              <Pill className="bg-muted text-muted-foreground">1.2 km away</Pill>
            </div>
          </div>
        </div>
        <p>
          They use an oatmeal-based medicated shampoo which is perfect for Shih
          Tzus with sensitive skin. Would you like me to check their
          availability for this weekend?
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Yes, check Saturday", "Show other options", "Call them"].map(
            (action) => (
              <button
                className="rounded-full border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
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
  );
}

function ContextSidebar() {
  const sources = [
    {
      source: "Google Maps API",
      title: "Heartland Paws Reviews",
      detail:
        "\"Absolutely wonderful with my sensitive pup. They used a special medicated shampoo that didn't irritate her skin at all....\"",
      icon: MapIcon,
    },
    {
      source: "Pet Lovers Centre Data",
      title: "Oatmeal Medicated Shampoo",
      detail:
        "Recommended for Shih Tzus (Age 3+). Alleviates itching and environmental allergies common in humid Singaporean climates.",
      icon: ShoppingBag,
    },
  ];

  return (
    <aside className="hidden border-l border-border bg-card/50 px-8 py-8 lg:block">
      <h3 className="mb-8 flex items-center gap-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        <Info className="size-5" />
        AI context sources
      </h3>
      <div className="grid gap-4">
        {sources.map(({ source, title, detail, icon: Icon }) => (
          <div
            className="rounded-2xl border border-border bg-muted/30 p-4"
            key={title}
          >
            <p className="mb-4 flex items-center gap-2 text-sm">
              <span className="rounded-md bg-primary/15 p-2 text-primary">
                <Icon className="size-4" />
              </span>
              {source}
            </p>
            <h4 className="mb-2 text-lg font-semibold">{title}</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {detail}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function AssistantPage() {
  return (
    <PetCareShell active="assistant">
      <main className="grid min-h-screen bg-background md:ml-64 lg:grid-cols-[1fr_320px]">
        <ChatArea />
        <ContextSidebar />
      </main>
    </PetCareShell>
  );
}
