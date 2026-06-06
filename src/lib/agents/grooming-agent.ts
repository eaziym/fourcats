import "server-only";

import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import type { ServicePlaceCard } from "@/lib/pet-data/format";
import {
  postalToLatLng,
  type ServicePlaceResult,
  searchGroomers,
} from "@/lib/pet-data/search";

export type { ServicePlaceCard };

export type GroomingAgentContext = {
  /** Seed location resolved by the route (browser geolocation or pet's home). */
  defaultLat?: number;
  defaultLng?: number;
  /** Collected by `search_groomers` so the route can render place cards. */
  foundPlaces: Map<string, ServicePlaceCard>;
};

function toCard(p: ServicePlaceResult): ServicePlaceCard {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    rating: p.rating,
    reviewCount: p.userRatingCount,
    distanceKm: Number(p.distanceKm.toFixed(1)),
    phone: p.phone,
    websiteUrl: p.websiteUrl,
    googleMapsUrl: p.googleMapsUrl,
    tags: [...p.serviceTags, ...p.suitabilityTags],
    lat: p.lat,
    lng: p.lng,
    kind: p.kind,
  };
}

const GROOMING_AGENT_MODEL = process.env.AI_AGENT_MODEL ?? "gpt-4o";

const searchGroomersTool = tool({
  name: "search_groomers",
  description:
    "Find real pet grooming stores near a location in Singapore, with rating, distance, contacts and top reviews. Call this before recommending any groomer — never invent shops, ratings, or contacts. By default it searches near the user's resolved location; pass a postal code to search elsewhere.",
  parameters: z.object({
    postalCode: z
      .string()
      .nullable()
      .describe(
        "Singapore postal code to search near. Null to use the user's resolved location (browser GPS or saved home).",
      ),
    radiusKm: z
      .number()
      .min(1)
      .max(25)
      .nullable()
      .describe("Search radius in km (default 8)."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(8)
      .nullable()
      .describe("Max results (default 5)."),
  }),
  execute: async (input, runContext) => {
    const ctx = runContext?.context as GroomingAgentContext | undefined;
    const coords = input.postalCode
      ? postalToLatLng(input.postalCode)
      : ctx?.defaultLat != null && ctx?.defaultLng != null
        ? { lat: ctx.defaultLat, lng: ctx.defaultLng }
        : null;

    if (!coords) {
      return JSON.stringify({
        ok: false,
        error:
          "No location available. Ask the user for a Singapore postal code, or have them share their location.",
      });
    }

    try {
      const places = await searchGroomers({
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: input.radiusKm ?? 8,
        limit: input.limit ?? 5,
        withReviews: true,
        reviewsPerPlace: 2,
      });

      if (ctx) {
        for (const p of places) ctx.foundPlaces.set(p.id, toCard(p));
      }

      const items = places.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        rating: p.rating,
        reviews: p.userRatingCount,
        distanceKm: Number(p.distanceKm.toFixed(1)),
        phone: p.phone,
        website: p.websiteUrl,
        tags: [...p.serviceTags, ...p.suitabilityTags],
        reviewSnippets: p.reviews
          .map((r) => r.text?.slice(0, 200))
          .filter(Boolean),
      }));
      return JSON.stringify({ ok: true, count: items.length, items });
    } catch (e) {
      const error = e instanceof Error ? e.message : "Groomer search failed";
      return JSON.stringify({ ok: false, error });
    }
  },
});

const BASE_INSTRUCTIONS = `You are the Grooming Finder for "Little Lovely Pets", a Singapore pet-care app. Your job: recommend the best grooming stores near the user for their specific pet.

How to work:
1. ALWAYS call the search_groomers tool before recommending anything. Recommend ONLY stores returned by the tool — never invent shops, ratings, distances, or contacts.
2. Match the pet profile below: species/breed grooming needs (e.g. long-haired or double-coated breeds need full grooms more often; rabbits and other small pets need exotic-friendly groomers), and any medical conditions (e.g. sensitive skin → gentle/hypoallergenic, anxious pets → calm/low-volume salons). Prefer stores whose tags/reviews fit these needs.
3. Rank by a sensible blend of closeness, rating and review quality. Recommend 2–4 stores. For each: name, distance, rating (with review count), one-line reason it fits this pet (cite a review detail or suitability tag when relevant), and that contact/booking details are available.
4. If no location is available, ask the user for their Singapore postal code (or to share their location) before searching.
5. Be warm and concise, use light Markdown (short intro, then a bullet per store). Do not paste raw JSON, IDs, or full URLs — the app shows clickable store cards with call/website/directions buttons.`;

/** Builds a per-request agent with the pet profile + location baked into instructions. */
export function buildGroomingAgent(
  petProfileText: string,
  locationNote: string,
): Agent<GroomingAgentContext> {
  return new Agent<GroomingAgentContext>({
    name: "Grooming Finder",
    model: GROOMING_AGENT_MODEL,
    instructions: `${BASE_INSTRUCTIONS}\n\n--- PET PROFILE ---\n${petProfileText}\n\n--- LOCATION ---\n${locationNote}`,
    tools: [searchGroomersTool],
  });
}
