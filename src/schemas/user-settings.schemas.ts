import { z } from "zod";

export const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
] as const;

const budgetField = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.coerce.number().min(0).max(100_000).nullable(),
);

export const updateUserSettingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : s))
    .nullable(),
  gender: z
    .enum(["", "female", "male", "non_binary", "other", "prefer_not_to_say"])
    .transform((s) => (s === "" ? null : s)),
  monthlyFoodBudget: budgetField.transform((v) =>
    v == null ? null : Math.round(v * 100),
  ),
  monthlyGroomingBudget: budgetField.transform((v) =>
    v == null ? null : Math.round(v * 100),
  ),
  monthlyVetBudget: budgetField.transform((v) =>
    v == null ? null : Math.round(v * 100),
  ),
  monthlySuppliesBudget: budgetField.transform((v) =>
    v == null ? null : Math.round(v * 100),
  ),
});

export function centsToBudgetInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return String(Math.round(cents / 100));
}
