import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type PetCareLogDTO = {
  id: string;
  fed: boolean | null;
  mood: string | null;
  weightKg: string | null;
  symptoms: string[];
  notes: string | null;
  loggedAt: string;
};

export type PetDTO = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  ageYears: string | null;
  weightKg: string | null;
  medicalConditions: string[];
  dietaryRestrictions: string[];
  locationPostalCode: string | null;
  locationLabel: string | null;
  notes: string | null;
  careLogs: PetCareLogDTO[];
};

export type PetCareContext = {
  userDisplayName: string;
  pet: PetDTO | null;
};

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata?.full_name;
  if (typeof meta === "string" && meta.trim()) {
    return meta.trim();
  }
  const email = user.email;
  if (email) {
    return email.split("@")[0] ?? "there";
  }
  return "there";
}

/** One fetch per request for layout + pages (React cache). */
export const getPetCareContext = cache(async (): Promise<PetCareContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { userDisplayName: "there", pet: null };
  }

  const userDisplayName = displayNameFromUser(user);

  const row = await prisma.pet.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      careLogs: {
        orderBy: { loggedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!row) {
    return { userDisplayName, pet: null };
  }

  const pet: PetDTO = {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    ageYears: row.ageYears != null ? row.ageYears.toString() : null,
    weightKg: row.weightKg != null ? row.weightKg.toString() : null,
    medicalConditions: row.medicalConditions,
    dietaryRestrictions: row.dietaryRestrictions,
    locationPostalCode: row.locationPostalCode,
    locationLabel: row.locationLabel,
    notes: row.notes,
    careLogs: row.careLogs.map((log) => ({
      id: log.id,
      fed: log.fed,
      mood: log.mood,
      weightKg: log.weightKg != null ? log.weightKg.toString() : null,
      symptoms: log.symptoms,
      notes: log.notes,
      loggedAt: log.loggedAt.toISOString(),
    })),
  };

  return { userDisplayName, pet };
});
