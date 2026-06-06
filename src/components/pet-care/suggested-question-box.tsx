"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandMascot } from "@/components/pet-care/mascot";
import { usePetCare } from "@/components/pet-care/pet-care-provider";
import { buildSuggestedQuestions } from "@/lib/assistant-suggested-questions";
import { cn } from "@/lib/utils";

const ROTATE_MS = 3000;

export function SuggestedQuestionBox({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { pet } = usePetCare();
  const pathname = usePathname();
  const router = useRouter();
  const questions = useMemo(() => buildSuggestedQuestions(pet), [pet]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
    const count = questions.length;
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % count);
        setVisible(true);
      }, 180);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [questions]);

  const question =
    questions[index] ?? questions[0] ?? "Ask about your pet's care";

  function handleAsk() {
    onNavigate?.();
    router.push(
      `/assistant?q=${encodeURIComponent(question)}&auto=1&t=${Date.now()}`,
    );
  }

  return (
    <Link
      className={cn(
        "llp-suggested-question group block rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card to-accent/25 p-3.5 shadow-[var(--llp-sh-1)] transition-all",
        "hover:border-primary/40 hover:shadow-[var(--llp-sh-2)] motion-safe:hover:scale-[1.02] active:scale-[0.99]",
      )}
      href={`/assistant?q=${encodeURIComponent(question)}&auto=1`}
      onClick={(e) => {
        e.preventDefault();
        handleAsk();
      }}
      scroll={pathname !== "/assistant"}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 ring-2 ring-primary/15 transition-all group-hover:ring-primary/35">
            <BrandMascot
              className="llp-suggested-question-mascot"
              float={false}
              size={46}
            />
          </div>
          <span
            aria-hidden
            className="llp-suggested-question-sparkle absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--llp-secondary-container)] ring-2 ring-card"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
            Try asking
          </div>
          <p
            className={cn(
              "text-sm font-medium leading-snug text-foreground transition-opacity duration-200",
              visible ? "opacity-100" : "opacity-0",
            )}
          >
            {question}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground transition-colors group-hover:text-foreground/80">
            Tap to ask →
          </p>
        </div>
      </div>
    </Link>
  );
}
