"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Mascot, type MascotSpecies } from "@/components/pet-care/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type CreatePetState, createPet } from "./actions";

const SPECIES: { value: string; label: string; mascot: MascotSpecies }[] = [
  { value: "dog", label: "Dog", mascot: "dog" },
  { value: "cat", label: "Cat", mascot: "cat" },
  { value: "small_pet", label: "Small pet", mascot: "rabbit" },
];

export function AddPetForm({ onCreated }: { onCreated?: () => void }) {
  const [state, formAction, pending] = useActionState<CreatePetState, FormData>(
    createPet,
    null,
  );
  const [species, setSpecies] = useState<string>("dog");
  const createdRef = useRef(false);

  useEffect(() => {
    if (state?.ok && !createdRef.current) {
      createdRef.current = true;
      onCreated?.();
    }
  }, [state, onCreated]);

  return (
    <form action={formAction} className="grid gap-5">
      {state?.error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <input name="species" type="hidden" value={species} />
      <div className="grid gap-2">
        <Label className="font-semibold">Species</Label>
        <div className="grid grid-cols-3 gap-3">
          {SPECIES.map((s) => {
            const active = s.value === species;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSpecies(s.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40 hover:bg-muted",
                )}
              >
                <Mascot species={s.mascot} size={44} blink={false} />
                <span className="text-sm font-semibold">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-2">
        <Label className="font-semibold" htmlFor="add-name">
          Pet&apos;s name
        </Label>
        <Input
          required
          className="h-11 rounded-xl"
          id="add-name"
          name="name"
          placeholder="e.g. Mochi"
        />
      </div>
      <div className="grid gap-2">
        <Label className="font-semibold" htmlFor="add-breed">
          Breed (optional)
        </Label>
        <Input
          className="h-11 rounded-xl"
          id="add-breed"
          name="breed"
          placeholder="e.g. Shih Tzu, Holland Lop"
        />
      </div>
      <Button
        className="h-11 w-full"
        disabled={pending}
        size="lg"
        type="submit"
      >
        {pending ? "Adding…" : "Add pet"}
      </Button>
    </form>
  );
}
