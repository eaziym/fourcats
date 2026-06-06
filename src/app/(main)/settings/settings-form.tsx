"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserSettingsDTO } from "@/lib/pet-queries";
import { cn } from "@/lib/utils";
import {
  centsToBudgetInput,
  GENDER_OPTIONS,
} from "@/schemas/user-settings.schemas";
import { type UpdateUserSettingsState, updateUserSettings } from "./actions";

export function SettingsForm({
  settings,
  fallbackDisplayName,
}: {
  settings: UserSettingsDTO | null;
  fallbackDisplayName: string;
}) {
  const [state, formAction, pending] = useActionState<
    UpdateUserSettingsState,
    FormData
  >(updateUserSettings, null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (state?.ok && !savedRef.current) {
      savedRef.current = true;
    }
  }, [state]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      {state?.error ? (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
          Settings saved. AI recommendations will use your updated preferences.
        </p>
      ) : null}

      <form action={formAction} className="grid gap-10">
        <section className="grid gap-5">
          <div>
            <h2 className="font-llp-display text-lg font-bold text-foreground">
              Your profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Used to personalize greetings and AI suggestions.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="displayName">
                Display name
              </Label>
              <Input
                className="h-11 rounded-xl"
                defaultValue={settings?.displayName ?? fallbackDisplayName}
                id="displayName"
                name="displayName"
                placeholder="How should we address you?"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="gender">
                Gender
              </Label>
              <select
                className={cn(
                  "flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-xs outline-none",
                  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                )}
                defaultValue={settings?.gender ?? ""}
                id="gender"
                name="gender"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value || "unset"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="grid gap-5">
          <div>
            <h2 className="font-llp-display text-lg font-bold text-foreground">
              Monthly pet budgets
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Approximate SGD amounts per month. Agents use these to stay within
              your budget when recommending food, grooming, vet care, and
              supplies.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <BudgetField
              defaultValue={centsToBudgetInput(
                settings?.monthlyFoodBudgetCents,
              )}
              id="monthlyFoodBudget"
              label="Food"
              name="monthlyFoodBudget"
            />
            <BudgetField
              defaultValue={centsToBudgetInput(
                settings?.monthlyGroomingBudgetCents,
              )}
              id="monthlyGroomingBudget"
              label="Grooming"
              name="monthlyGroomingBudget"
            />
            <BudgetField
              defaultValue={centsToBudgetInput(settings?.monthlyVetBudgetCents)}
              id="monthlyVetBudget"
              label="Vet care"
              name="monthlyVetBudget"
            />
            <BudgetField
              defaultValue={centsToBudgetInput(
                settings?.monthlySuppliesBudgetCents,
              )}
              id="monthlySuppliesBudget"
              label="Supplies & treats"
              name="monthlySuppliesBudget"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button className="rounded-xl px-6" disabled={pending} type="submit">
            {pending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function BudgetField({
  id,
  name,
  label,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="font-semibold" htmlFor={id}>
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
          S$
        </span>
        <Input
          className="h-11 rounded-xl pl-9"
          defaultValue={defaultValue}
          id={id}
          inputMode="decimal"
          min={0}
          name={name}
          placeholder="e.g. 80"
          step="1"
          type="number"
        />
      </div>
    </div>
  );
}
