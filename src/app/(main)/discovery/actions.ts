"use server";

import {
  getDiscoveryDataAtOrigin,
  type DiscoveryData,
} from "@/lib/discovery-queries";
import { getPetCareContext } from "@/lib/pet-queries";

function inSingaporeBounds(lat: number, lng: number): boolean {
  return lat >= 1.1 && lat <= 1.5 && lng >= 103.5 && lng <= 104.1;
}

/** Reload discovery listings using the user's live GPS coordinates. */
export async function loadDiscoveryAtCoords(
  lat: number,
  lng: number,
): Promise<DiscoveryData | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (!inSingaporeBounds(lat, lng)) return null;

  const { pet } = await getPetCareContext();
  if (!pet) return null;

  return getDiscoveryDataAtOrigin(pet, {
    lat,
    lng,
    label: "Your location",
    source: "gps",
  });
}
