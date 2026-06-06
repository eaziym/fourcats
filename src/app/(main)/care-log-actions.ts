"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import {
  type DailyCareLogInput,
  parseDailyCareLogFormData,
} from "./care-log-form-data";

export type CreateDailyCareLogState = { error?: string } | null;

export async function createDailyCareLog(
  _prev: CreateDailyCareLogState,
  formData: FormData,
): Promise<CreateDailyCareLogState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let input: DailyCareLogInput;
  try {
    input = parseDailyCareLogFormData(formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Invalid care log.",
    };
  }

  const pet = await prisma.pet.findFirst({
    where: { id: input.petId, userId: user.id },
    select: { id: true },
  });
  if (!pet) {
    return { error: "No pet profile found." };
  }

  await prisma.careLog.create({
    data: {
      petId: pet.id,
      fed: input.fed,
      mood: input.mood,
      weightKg: input.weightKg,
      notes: input.notes,
    },
  });

  revalidatePath("/");
  redirect("/");
}
