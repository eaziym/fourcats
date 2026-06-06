"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpotlightCard } from "@/components/pet-care/primitives";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PawPrint } from "lucide-react";
import { createFirstPet, type CreatePetState } from "./actions";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createFirstPet, null);

  return (
    <SpotlightCard className="mx-auto max-w-2xl border-[#dac0c3]/60">
      <CardContent className="p-8 md:p-10">
        <form action={formAction} className="grid gap-8">
          <div className="grid gap-2">
            <Label className="font-semibold" htmlFor="name">
              Pet name
            </Label>
            <Input
              className="h-14 rounded-xl border-[#dac0c3]/70 bg-[#f8f9fa] text-lg"
              id="name"
              name="name"
              placeholder="e.g. Mochi"
              required
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="font-semibold">Species</legend>
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
                    "rounded-2xl border-2 border-transparent bg-[#f3f4f5] p-8 text-center font-bold transition-all peer-checked:border-[#9c3f53] peer-checked:bg-[#ffd9dd]/70",
                  )}
                >
                  <PawPrint className="mx-auto mb-3 size-9" />
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
                    "rounded-2xl border-2 border-transparent bg-[#f3f4f5] p-8 text-center font-bold transition-all peer-checked:border-[#9c3f53] peer-checked:bg-[#ffd9dd]/70",
                  )}
                >
                  <PawPrint className="mx-auto mb-3 size-9" />
                  Cat
                </div>
              </label>
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label className="font-semibold" htmlFor="breed">
              Breed{" "}
              <span className="font-normal text-[#554244]">(optional)</span>
            </Label>
            <Input
              className="h-12 rounded-xl border-[#dac0c3]/70"
              id="breed"
              name="breed"
              placeholder="e.g. Singapore Special"
            />
          </div>

          {state?.error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button
            className="h-14 rounded-full bg-gradient-to-r from-[#ff8da1] to-[#9c3f53] text-lg font-bold shadow-md"
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      </CardContent>
    </SpotlightCard>
  );
}
