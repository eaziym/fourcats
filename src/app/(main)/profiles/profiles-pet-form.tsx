"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PetDTO } from "@/lib/pet-queries";
import { type UpdatePetState, updatePet } from "./actions";

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

export function ProfilesPetForm({
  pet,
  onSaved,
}: {
  pet: PetDTO;
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState<UpdatePetState, FormData>(
    updatePet,
    null,
  );
  const progress = fieldProgress(pet);
  const savedRef = useRef(false);

  useEffect(() => {
    if (state?.ok && !savedRef.current) {
      savedRef.current = true;
      onSaved?.();
    }
  }, [state, onSaved]);

  return (
    <div>
      {state?.error ? (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <form action={formAction} className="grid gap-7">
        <input name="petId" type="hidden" value={pet.id} />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label className="font-semibold" htmlFor="name">
              Pet&apos;s name
            </Label>
            <Input
              required
              className="h-11 rounded-xl"
              defaultValue={pet.name}
              id="name"
              name="name"
            />
          </div>
          <div className="grid gap-2">
            <Label className="font-semibold">Species</Label>
            <p className="flex h-11 items-center rounded-xl border border-border bg-muted/50 px-4 capitalize">
              {pet.species}
            </p>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label className="font-semibold" htmlFor="breed">
              Breed
            </Label>
            <Input
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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
              className="min-h-[100px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              defaultValue={pet.notes ?? ""}
              id="notes"
              name="notes"
              placeholder="Anything else carers should know"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Profile strength: {progress}%
          </p>
          <Button
            className="h-11 px-7"
            disabled={pending}
            size="lg"
            type="submit"
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
