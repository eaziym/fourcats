import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { enrichPlaceCards } from "@/lib/pet-data/enrich-places";
import type { ServicePlaceCard } from "@/lib/pet-data/format";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { places?: ServicePlaceCard[] } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const places = Array.isArray(body.places) ? body.places : [];
  if (places.length === 0) {
    return NextResponse.json({ places: [] });
  }

  const enriched = await enrichPlaceCards(places.slice(0, 12));
  return NextResponse.json({ places: enriched });
}
