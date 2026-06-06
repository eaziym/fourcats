"use client";

import { useActionState } from "react";
import { SpotlightCard } from "@/components/pet-care/primitives";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PetDTO } from "@/lib/pet-queries";
import { type UpdatePetState, updatePrimaryPet } from "./actions";

function fieldProgress(pet: PetDTO) {
  let n = 0;
  const total = 6;
  if (pet.name.trim()) n++;
  if (pet.breed?.trim()) n++;
  if (pet.ageYears != null) n++;
  if (pet.weightKg != null) n++;
  if (pet.locationPostalCode?.trim() || pet.locationLabel?.trim()) n++;
  if (pet.medicalConditions.length > 0 || pet.notes?.trim()) n++;
  return Math.round((n / total) * 100);
}

export function ProfilesPetForm({ pet }: { pet: PetDTO }) {
  const [state, formAction, pending] = useActionState<UpdatePetState, FormData>(
    updatePrimaryPet,
    null,
  );
  const progress = fieldProgress(pet);

  return (
    <SpotlightCard>
      <CardContent className="p-6 md:p-12">
        {state?.error ? (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <form action={formAction} className="grid gap-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="font-semibold" htmlFor="name">
                Pet&apos;s name
              </Label>
              <Input
                required
                className="h-12 rounded-xl text-lg"
                defaultValue={pet.name}
                id="name"
                name="name"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Species</Label>
              <p className="flex h-12 items-center rounded-xl border border-border bg-muted/50 px-4 text-lg capitalize">
                {pet.species}
              </p>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="breed">
                Breed
              </Label>
              <Input
                className="h-12 rounded-xl"
                defaultValue={pet.breed ?? ""}
                id="breed"
                name="breed"
                placeholder="e.g. Shih Tzu, Singapore Special"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold" htmlFor="ageYears">
                Age (years)
              </Label>
              <Input
                className="h-12 rounded-xl"
                defaultValue={pet.ageYears ?? ""}
                id="ageYears"
                inputMode="decimal"
                name="ageYears"
                placeholder="e.g. 3"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold" htmlFor="weightKg">
                Weight (kg)
              </Label>
              <Input
                className="h-12 rounded-xl"
                defaultValue={pet.weightKg ?? ""}
                id="weightKg"
                inputMode="decimal"
                name="weightKg"
                placeholder="e.g. 6.2"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold" htmlFor="locationPostalCode">
                Postal code
              </Label>
              <Input
                className="h-12 rounded-xl"
                defaultValue={pet.locationPostalCode ?? ""}
                id="locationPostalCode"
                name="locationPostalCode"
                placeholder="e.g. 520123"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold" htmlFor="locationLabel">
                Area label
              </Label>
              <Input
                className="h-12 rounded-xl"
                defaultValue={pet.locationLabel ?? ""}
                id="locationLabel"
                name="locationLabel"
                placeholder="e.g. Tampines"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="medicalConditions">
                Medical conditions (comma-separated)
              </Label>
              <Input
                className="h-12 rounded-xl"
                defaultValue={pet.medicalConditions.join(", ")}
                id="medicalConditions"
                name="medicalConditions"
                placeholder="e.g. sensitive skin, allergies"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="dietaryRestrictions">
                Dietary restrictions (comma-separated)
              </Label>
              <Input
                className="h-12 rounded-xl"
                defaultValue={pet.dietaryRestrictions.join(", ")}
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                placeholder="e.g. grain-free, chicken-free"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="notes">
                Notes
              </Label>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                defaultValue={pet.notes ?? ""}
                id="notes"
                name="notes"
                placeholder="Anything else carers should know"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
            <p className="text-sm text-muted-foreground">
              Profile strength: {progress}%
            </p>
            <Button
              className="h-12 px-8 text-base"
              disabled={pending}
              size="lg"
              type="submit"
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </SpotlightCard>
  );
}
