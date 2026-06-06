"use client";

import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCENTS,
  applyTweaks,
  type DensityId,
  HEADLINE_FONTS,
  type HeadlineFont,
  TWEAK_DEFAULTS,
  TWEAKS_STORAGE_KEY,
  type Tweaks,
} from "@/lib/tweaks";
import { cn } from "@/lib/utils";

const DENSITY_OPTIONS: DensityId[] = ["airy", "cozy", "compact"];

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {value ? (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {value}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </div>
  );
}

export function TweaksPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [t, setT] = useState<Tweaks>(TWEAK_DEFAULTS);
  const firstApply = useRef(true);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(TWEAKS_STORAGE_KEY);
      if (raw) {
        setT({ ...TWEAK_DEFAULTS, ...(JSON.parse(raw) as Partial<Tweaks>) });
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTweaks(t);
    if (firstApply.current) {
      firstApply.current = false;
      return;
    }
    try {
      localStorage.setItem(TWEAKS_STORAGE_KEY, JSON.stringify(t));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [t, mounted]);

  const set = useCallback(
    <K extends keyof Tweaks>(key: K, value: Tweaks[K]) =>
      setT((prev) => ({ ...prev, [key]: value })),
    [],
  );

  if (!mounted) return null;

  return (
    <>
      {!open ? (
        <button
          type="button"
          aria-label="Open design tweaks"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-[60] flex size-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-[var(--llp-sh-2)] transition-transform hover:scale-105 active:scale-95"
        >
          <SlidersHorizontal className="size-5" />
        </button>
      ) : (
        <div className="fixed right-4 bottom-4 z-[60] flex max-h-[calc(100vh-32px)] w-[280px] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[var(--llp-sh-pop)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-llp-display text-sm font-bold text-foreground">
              Tweaks
            </span>
            <button
              type="button"
              aria-label="Close tweaks"
              onClick={() => setOpen(false)}
              className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto px-4 py-3.5">
            <SectionLabel>Brand colour</SectionLabel>
            <Row label="Accent">
              <div className="flex gap-2">
                {ACCENTS.map((a) => {
                  const active = a.id === t.accent;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      title={a.name}
                      aria-label={a.name}
                      aria-pressed={active}
                      onClick={() => set("accent", a.id)}
                      className={cn(
                        "relative h-10 flex-1 overflow-hidden rounded-lg transition-transform hover:-translate-y-0.5",
                        active
                          ? "ring-2 ring-foreground ring-offset-1 ring-offset-card"
                          : "ring-1 ring-border",
                      )}
                      style={{ background: a.primary }}
                    >
                      <span
                        className="absolute inset-x-0 bottom-0 h-1/3"
                        style={{ background: a.container }}
                      />
                      {active ? (
                        <Check className="absolute left-1 top-1 size-3.5 text-white drop-shadow" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </Row>

            <SectionLabel>Shape &amp; density</SectionLabel>
            <Row label="Roundness" value={`${t.roundness.toFixed(1)}×`}>
              <input
                type="range"
                min={0.4}
                max={1.7}
                step={0.1}
                value={t.roundness}
                onChange={(e) => set("roundness", Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </Row>
            <Row label="Density">
              <div className="flex gap-1 rounded-full bg-muted p-1">
                {DENSITY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("density", d)}
                    className={cn(
                      "flex-1 rounded-full px-2 py-1.5 text-xs font-semibold capitalize transition-colors",
                      t.density === d
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Row>

            <SectionLabel>Personality</SectionLabel>
            <Row label="Cuteness" value={`${t.cuteness}%`}>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={t.cuteness}
                onChange={(e) => set("cuteness", Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </Row>
            <Row label="Headline font">
              <select
                value={t.headlineFont}
                onChange={(e) =>
                  set("headlineFont", e.target.value as HeadlineFont)
                }
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:border-primary"
              >
                {HEADLINE_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Row>

            <button
              type="button"
              onClick={() => setT(TWEAK_DEFAULTS)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70"
            >
              <RotateCcw className="size-3.5" />
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </>
  );
}
