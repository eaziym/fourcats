import { z } from "zod";

const csvList = z.string().transform((value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
);

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value ?? undefined;
}

const requiredDecimal = (fieldName: string, min: number, max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .min(min, `${fieldName} is too low`)
      .max(max, `${fieldName} is too high`),
  );

const optionalDecimal = (fieldName: string, min: number, max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .min(min, `${fieldName} is too low`)
      .max(max, `${fieldName} is too high`)
      .optional(),
  );

export const createPetSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  species: z.enum(["dog", "cat"]),
  breed: nullableText,
  ageYears: requiredDecimal("Age", 0, 40),
  weightKg: optionalDecimal("Weight", 0.1, 200),
  medicalConditions: csvList,
  dietaryRestrictions: csvList,
  locationPostalCode: z
    .string()
    .trim()
    .min(1, "Postal code is required")
    .regex(/^\d{6}$/, "Enter a 6-digit Singapore postal code"),
});

export type CreatePetFields = z.infer<typeof createPetSchema>;

export function parseCreatePetFormData(formData: FormData) {
  return createPetSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed") ?? "",
    ageYears: formData.get("ageYears") ?? "",
    weightKg: formData.get("weightKg") ?? "",
    medicalConditions: formData.get("medicalConditions") ?? "",
    dietaryRestrictions: formData.get("dietaryRestrictions") ?? "",
    locationPostalCode: formData.get("locationPostalCode") ?? "",
  });
}

export function buildCreatePetData(userId: string, fields: CreatePetFields) {
  return {
    userId,
    name: fields.name,
    species: fields.species,
    breed: fields.breed,
    ageYears: fields.ageYears,
    weightKg: fields.weightKg ?? null,
    medicalConditions: fields.medicalConditions,
    dietaryRestrictions: fields.dietaryRestrictions,
    locationPostalCode: fields.locationPostalCode,
  };
}
