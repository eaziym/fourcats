import "server-only";

import { prisma } from "@/lib/db";
import type { ServicePlaceCard } from "@/lib/pet-data/format";

function num(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Backfill lat/lng (and kind) from service_places when missing on cards. */
export async function enrichPlaceCards(
  places: ServicePlaceCard[],
): Promise<ServicePlaceCard[]> {
  if (places.length === 0) return places;

  const needIds = places
    .filter((p) => num(p.lat) == null || num(p.lng) == null)
    .map((p) => p.id);
  if (needIds.length === 0) {
    return places.map((p) => ({
      ...p,
      lat: num(p.lat),
      lng: num(p.lng),
    }));
  }

  const rows = await prisma.servicePlace.findMany({
    where: { id: { in: needIds } },
    select: { id: true, lat: true, lng: true, kind: true },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));

  return places.map((p) => {
    const row = byId.get(p.id);
    return {
      ...p,
      lat: num(p.lat) ?? num(row?.lat) ?? null,
      lng: num(p.lng) ?? num(row?.lng) ?? null,
      kind: p.kind ?? row?.kind ?? null,
    };
  });
}
