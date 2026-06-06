"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { buildCreatePetData, parseCreatePetFormData } from "./pet-form";

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

  const parsed = parseCreatePetFormData(formData);

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  await prisma.pet.create({
    data: buildCreatePetData(user.id, parsed.data),
  });

  revalidatePath("/");
  revalidatePath("/onboarding");
  redirect("/");
}
