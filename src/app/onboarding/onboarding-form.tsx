"use client";

import { PawPrint } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpotlightCard } from "@/components/pet-care/primitives";
import { cn } from "@/lib/utils";
import { createFirstPet } from "./actions";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createFirstPet, null);

  return (
    <SpotlightCard className="mx-auto max-w-2xl">
      <CardContent className="p-8 md:p-10">
        <form action={formAction} className="grid gap-8">
          <div className="grid gap-2">
            <Label className="font-medium" htmlFor="name">
              Pet name
            </Label>
            <Input
              className="h-12 text-lg"
              id="name"
              name="name"
              placeholder="e.g. Mochi"
              required
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="font-medium">Species</legend>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  className="peer sr-only"
                  defaultChecked
                  name="species"
                  type="radio"
                  value="dog"
                />
                <div
                  className={cn(
                    "rounded-2xl border-2 border-transparent bg-muted/60 p-8 text-center font-medium transition-all peer-checked:border-primary peer-checked:bg-primary/10",
                  )}
                >
                  <PawPrint className="mx-auto mb-3 size-9 opacity-80" />
                  Dog
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  className="peer sr-only"
                  name="species"
                  type="radio"
                  value="cat"
                />
                <div
                  className={cn(
                    "rounded-2xl border-2 border-transparent bg-muted/60 p-8 text-center font-medium transition-all peer-checked:border-primary peer-checked:bg-primary/10",
                  )}
                >
                  <PawPrint className="mx-auto mb-3 size-9 opacity-80" />
                  Cat
                </div>
              </label>
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label className="font-medium" htmlFor="breed">
              Breed{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              className="h-11"
              id="breed"
              name="breed"
              placeholder="e.g. Singapore Special"
            />
          </div>

          {state?.error ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button className="h-12 w-full sm:w-auto" disabled={pending} size="lg" type="submit">
            {pending ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      </CardContent>
    </SpotlightCard>
  );
}
