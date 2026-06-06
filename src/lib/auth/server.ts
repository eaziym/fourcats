import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserOrRedirect() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/** Dashboard and main app: must be signed in and have at least one pet profile. */
export async function ensureAppAccess() {
  const user = await getUserOrRedirect();
  const count = await prisma.pet.count({ where: { userId: user.id } });
  if (count === 0) {
    redirect("/onboarding");
  }
  return user;
}

/** Onboarding: signed in only; send users who already have pets to home. */
export async function ensureOnboardingAccess() {
  const user = await getUserOrRedirect();
  const count = await prisma.pet.count({ where: { userId: user.id } });
  if (count > 0) {
    redirect("/");
  }
  return user;
}
