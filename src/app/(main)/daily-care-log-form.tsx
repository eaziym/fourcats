"use client";

import { LoaderCircle, PlusCircle } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type CreateDailyCareLogState,
  createDailyCareLog,
} from "./care-log-actions";

const fedOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const moodOptions = [
  { label: "Happy", value: "happy" },
  { label: "OK", value: "ok" },
  { label: "Off", value: "off" },
];

function RadioPill({
  defaultChecked,
  label,
  name,
  value,
}: {
  defaultChecked?: boolean;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="block">
      <input
        required
        className="peer sr-only"
        defaultChecked={defaultChecked}
        name={name}
        type="radio"
        value={value}
      />
      <span
        className={cn(
          "flex h-10 min-w-20 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors",
          "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
          "peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50",
        )}
      >
        {label}
      </span>
    </label>
  );
}

export function DailyCareLogForm({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const [state, formAction, pending] = useActionState<
    CreateDailyCareLogState,
    FormData
  >(createDailyCareLog, null);

  return (
    <form action={formAction} className="grid gap-5">
      <input name="petId" type="hidden" value={petId} />
      {state?.error ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-[0.9fr_1fr]">
        <fieldset className="grid gap-3">
          <legend className="text-sm font-semibold">Fed</legend>
          <div className="flex flex-wrap gap-2">
            {fedOptions.map((option) => (
              <RadioPill
                defaultChecked={option.value === "yes"}
                key={option.value}
                label={option.label}
                name="fed"
                value={option.value}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="text-sm font-semibold">Mood</legend>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <RadioPill
                defaultChecked={option.value === "ok"}
                key={option.value}
                label={option.label}
                name="mood"
                value={option.value}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <div className="grid gap-2">
          <Label className="font-semibold" htmlFor="careWeightKg">
            Weight (kg)
          </Label>
          <Input
            className="h-11 rounded-xl"
            id="careWeightKg"
            inputMode="decimal"
            max="200"
            min="0.1"
            name="weightKg"
            placeholder="e.g. 6.2"
            step="0.01"
            type="number"
          />
        </div>
        <div className="grid gap-2">
          <Label className="font-semibold" htmlFor="careNotes">
            Notes
          </Label>
          <Textarea
            className="min-h-11 rounded-xl"
            id="careNotes"
            name="notes"
            placeholder={`${petName}'s meals, walk, symptoms, or medication`}
            rows={1}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="h-11 px-5" disabled={pending} type="submit">
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <PlusCircle className="size-4" />
          )}
          {pending ? "Saving" : "Save check-in"}
        </Button>
      </div>
    </form>
  );
}
