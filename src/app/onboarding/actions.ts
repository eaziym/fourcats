"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const petSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  species: z.enum(["dog", "cat"]),
  breed: z
    .string()
    .trim()
    .transform((s) => (s === "" ? undefined : s))
    .optional(),
});

export type CreatePetState = { error?: string } | null;

export async function createFirstPet(
  _prev: CreatePetState,
  formData: FormData,
): Promise<CreatePetState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const parsed = petSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed") || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  await prisma.pet.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      species: parsed.data.species,
      breed: parsed.data.breed ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/onboarding");
  redirect("/");
}
