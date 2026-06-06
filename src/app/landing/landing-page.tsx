"use client";

import {
  ArrowRight,
  Bot,
  CalendarHeart,
  HeartHandshake,
  MapPinned,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Mascot, Paw } from "@/components/pet-care/mascot";
import { Reveal } from "@/components/pet-care/reveal";

const FEATURES = [
  {
    icon: Bot,
    title: "AI care assistant",
    body: "Profile-aware answers grounded in Singapore-specific pet data — grooming, diet, health and local rules.",
    tone: "var(--primary-container)",
    fg: "var(--on-primary-container)",
  },
  {
    icon: MapPinned,
    title: "Local discovery",
    body: "Find trusted groomers, vets and pet-friendly spots near you, filtered for your pet's needs.",
    tone: "var(--llp-tertiary-container)",
    fg: "var(--llp-on-tertiary-container)",
  },
  {
    icon: CalendarHeart,
    title: "Daily care log",
    body: "Track meals, walks, meds and mood. Gentle reminders keep every little routine on schedule.",
    tone: "var(--llp-secondary-container)",
    fg: "var(--llp-on-secondary-container)",
  },
  {
    icon: HeartHandshake,
    title: "Every pet welcome",
    body: "Dogs, cats and small pets like rabbits — multi-pet profiles tailored to each lovely companion.",
    tone: "var(--llp-success-container)",
    fg: "#13633f",
  },
] as const;

const STEPS = [
  {
    n: "1",
    title: "Create a profile",
    body: "Add your pet's breed, age, home type and any health notes in a minute.",
  },
  {
    n: "2",
    title: "Ask anything",
    body: "Chat with an assistant that actually knows your pet and your neighbourhood.",
  },
  {
    n: "3",
    title: "Care with confidence",
    body: "Discover local services and keep daily routines on track — stress-free.",
  },
] as const;

function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
        <Link className="flex items-center gap-2.5" href="/landing">
          <Paw size={30} />
          <span className="font-llp-display text-xl font-bold tracking-tight text-primary">
            Little Lovely Pets
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
          <a
            className="transition-colors hover:text-foreground"
            href="#features"
          >
            Features
          </a>
          <a className="transition-colors hover:text-foreground" href="#how">
            How it works
          </a>
          <a className="transition-colors hover:text-foreground" href="#pets">
            For every pet
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:inline-flex"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(120,35,56,0.2)] transition-transform hover:scale-[1.03] active:scale-95"
            href="/signup"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-[460px] rounded-full opacity-50 blur-3xl"
        style={{ background: "var(--primary-container)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 size-[420px] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--llp-tertiary-container)" }}
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold"
            style={{
              background: "var(--llp-secondary-container)",
              color: "var(--llp-on-secondary-container)",
            }}
          >
            <Sparkles className="size-3.5" />
            Singapore&apos;s lovingly-smart pet care
          </span>
          <h1 className="font-llp-display mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Lovely care,
            <br />
            <span className="text-primary">tailored to your pet.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Track daily care, discover trusted local spots, and get AI tips
            grounded in real Singapore pet data — for dogs, cats and the little
            ones too.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_10px_28px_rgba(120,35,56,0.24)] transition-transform hover:scale-[1.03] active:scale-95"
              href="/signup"
            >
              Start for free
              <ArrowRight className="size-5" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              href="/login"
            >
              I have an account
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[var(--llp-success)]" />
              HDB / condo / landed aware
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-current text-[var(--llp-secondary)]" />
              Loved by local pet parents
            </span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-[28px] border border-border bg-card p-7 shadow-[0_16px_44px_rgba(120,35,56,0.18)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mascot species="brand" size={56} float />
                  <div>
                    <p className="font-llp-display text-lg font-bold text-foreground">
                      Hello, lovely!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your pets, all in one place
                    </p>
                  </div>
                </div>
                <PawPrint className="size-6 text-primary/30" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {(["dog", "cat", "rabbit"] as const).map((sp) => (
                  <div
                    key={sp}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted/40 py-4"
                  >
                    <Mascot species={sp} size={46} blink={false} />
                    <span className="text-xs font-semibold capitalize text-muted-foreground">
                      {sp}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-foreground">
                  Today for Mochi
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hot day in SG — keep walks short and bring water. 🐾
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Sensitive-skin grooming",
    "Heartworm reminders",
    "Pet-friendly cafes",
    "HDB-approved breeds",
    "Hydration tips",
    "Vet check-ups",
  ];
  return (
    <div className="border-y border-border/70 bg-card/50 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2.5 px-5">
        {items.map((it) => (
          <span
            key={it}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="px-5 py-20 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-llp-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything your pet needs, gently organised
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            One warm, hassle-free home for care, discovery and lovely little
            reminders.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 80}>
                <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-[0_4px_20px_rgba(40,28,33,0.05)] transition-transform hover:-translate-y-1">
                  <div
                    className="flex size-12 items-center justify-center rounded-2xl"
                    style={{ background: f.tone, color: f.fg }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-llp-display mt-5 text-lg font-bold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pets() {
  return (
    <section id="pets" className="px-5 py-20 md:px-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_10px_34px_rgba(40,28,33,0.1)]">
        <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:p-14">
          <Reveal>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold"
              style={{
                background: "var(--primary-container)",
                color: "var(--on-primary-container)",
              }}
            >
              <PawPrint className="size-3.5" />
              Small pets get love too
            </span>
            <h2 className="font-llp-display mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Built for dogs, cats &amp; the little ones
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Keep a rabbit, a hamster, or a guinea pig? Little Lovely Pets
              tailors care notes, diets and reminders to every species — not
              just the big breeds.
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(120,35,56,0.2)] transition-transform hover:scale-[1.03] active:scale-95"
              href="/signup"
            >
              Add your pet
              <ArrowRight className="size-5" />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex items-end justify-center gap-6">
              <Mascot species="cat" size={92} />
              <Mascot species="dog" size={120} float />
              <Mascot species="rabbit" size={92} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="px-5 py-20 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-llp-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Lovely in three little steps
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 shadow-[0_4px_20px_rgba(40,28,33,0.05)]">
                <div className="font-llp-display flex size-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="font-llp-display mt-5 text-xl font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="px-5 pb-24 md:px-8">
      <Reveal className="mx-auto w-full max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[32px] px-8 py-14 text-center md:px-14"
          style={{
            background: "var(--primary)",
            color: "#fff",
          }}
        >
          <Paw
            size={180}
            color="rgba(255,255,255,0.12)"
            className="pointer-events-none absolute -right-6 -top-8"
          />
          <h2 className="font-llp-display relative text-3xl font-bold tracking-tight md:text-4xl">
            Give your pet the lovely care they deserve
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-base text-white/85">
            Join local pet parents using Little Lovely Pets every day. Free to
            start.
          </p>
          <Link
            className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-[var(--primary)] shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
            href="/signup"
          >
            Create your free account
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/70 px-5 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2.5">
          <Paw size={24} />
          <span className="font-llp-display font-bold text-foreground">
            Little Lovely Pets
          </span>
        </div>
        <p>Made with care in Singapore · © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <Pets />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
