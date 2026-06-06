"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  breed: z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : s))
    .nullable(),
  ageYears: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().min(0).max(40).nullable(),
  ),
  weightKg: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().min(0.1).max(200).nullable(),
  ),
  locationPostalCode: z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : s))
    .nullable(),
  locationLabel: z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : s))
    .nullable(),
  notes: z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : s))
    .nullable(),
  medicalConditions: z.string().transform((s) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  ),
  dietaryRestrictions: z.string().transform((s) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  ),
});

export type UpdatePetState = { error?: string } | null;

export async function updatePrimaryPet(
  _prev: UpdatePetState,
  formData: FormData,
): Promise<UpdatePetState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const pet = await prisma.pet.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!pet) {
    return { error: "No pet profile found." };
  }

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    breed: formData.get("breed") ?? "",
    ageYears: formData.get("ageYears") ?? "",
    weightKg: formData.get("weightKg") ?? "",
    locationPostalCode: formData.get("locationPostalCode") ?? "",
    locationLabel: formData.get("locationLabel") ?? "",
    notes: formData.get("notes") ?? "",
    medicalConditions: formData.get("medicalConditions") ?? "",
    dietaryRestrictions: formData.get("dietaryRestrictions") ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  await prisma.pet.update({
    where: { id: pet.id },
    data: {
      name: parsed.data.name,
      breed: parsed.data.breed,
      ageYears: parsed.data.ageYears,
      weightKg: parsed.data.weightKg,
      locationPostalCode: parsed.data.locationPostalCode,
      locationLabel: parsed.data.locationLabel,
      notes: parsed.data.notes,
      medicalConditions: parsed.data.medicalConditions,
      dietaryRestrictions: parsed.data.dietaryRestrictions,
    },
  });

  revalidatePath("/");
  revalidatePath("/profiles");
  revalidatePath("/assistant");
  revalidatePath("/discovery");
  return null;
}
