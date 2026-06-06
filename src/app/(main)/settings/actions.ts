"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { updateUserSettingsSchema } from "@/schemas/user-settings.schemas";

export type UpdateUserSettingsState = { error?: string; ok?: boolean } | null;

function revalidateSettingsPaths() {
  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/assistant");
  revalidatePath("/discovery");
  revalidatePath("/profiles");
}

export async function updateUserSettings(
  _prev: UpdateUserSettingsState,
  formData: FormData,
): Promise<UpdateUserSettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const parsed = updateUserSettingsSchema.safeParse({
    displayName: formData.get("displayName"),
    gender: formData.get("gender") ?? "",
    monthlyFoodBudget: formData.get("monthlyFoodBudget"),
    monthlyGroomingBudget: formData.get("monthlyGroomingBudget"),
    monthlyVetBudget: formData.get("monthlyVetBudget"),
    monthlySuppliesBudget: formData.get("monthlySuppliesBudget"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings." };
  }

  const data = parsed.data;

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      displayName: data.displayName,
      gender: data.gender,
      monthlyFoodBudgetCents: data.monthlyFoodBudget,
      monthlyGroomingBudgetCents: data.monthlyGroomingBudget,
      monthlyVetBudgetCents: data.monthlyVetBudget,
      monthlySuppliesBudgetCents: data.monthlySuppliesBudget,
    },
    update: {
      displayName: data.displayName,
      gender: data.gender,
      monthlyFoodBudgetCents: data.monthlyFoodBudget,
      monthlyGroomingBudgetCents: data.monthlyGroomingBudget,
      monthlyVetBudgetCents: data.monthlyVetBudget,
      monthlySuppliesBudgetCents: data.monthlySuppliesBudget,
    },
  });

  revalidateSettingsPaths();
  return { ok: true };
}
