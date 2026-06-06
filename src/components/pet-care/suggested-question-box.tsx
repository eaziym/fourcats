"use client";

import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  return (
    <Link
      className={cn(
        "group block rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/20 p-3.5 shadow-sm transition-all",
        "hover:border-primary/35 hover:shadow-md",
      )}
      href={`/assistant?q=${encodeURIComponent(question)}`}
      onClick={onNavigate}
    >
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
        <MessageCircleQuestion className="size-3.5" />
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
      <p className="mt-2 text-[11px] text-muted-foreground group-hover:text-foreground/80">
        Tap to open AI Assistant →
      </p>
    </Link>
  );
}
