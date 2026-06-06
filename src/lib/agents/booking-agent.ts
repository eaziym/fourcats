import "server-only";

import { Agent, tool } from "@openai/agents";
import { z } from "zod";
import {
  createBookingDraft,
  getServicePlaceForBooking,
  matchPlaceFromMessage,
} from "@/lib/booking/create-draft";
import { getAgentModel } from "@/lib/ai/providers";
import type { BookingDraft } from "@/lib/booking/types";
import type { PetDTO } from "@/lib/pet-queries";

export type BookingAgentContext = {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  pet: PetDTO | null;
  /** Places mentioned in recent chat (for name matching). */
  recentPlaces: { id: string; name: string }[];
  /** Set when a draft is created — returned to the route for the UI. */
  draft?: BookingDraft;
  /** Explicit place id from a "Book" button click. */
  presetPlaceId?: string;
};

const createBookingDraftTool = tool({
  name: "create_booking_draft",
  description:
    "Create a real booking draft for a specific service place. Call this once you know which place the user wants. Returns whether an email draft, online booking link, or phone call is available — never invent contact details.",
  parameters: z.object({
    servicePlaceId: z
      .string()
      .describe("UUID of the groomer/vet from lookup_place or recent context."),
    requestedService: z
      .string()
      .nullable()
      .describe(
        "Service type, e.g. 'Grooming appointment', 'Vet consultation', 'Nail trim'. Null for default.",
      ),
    requestedTimeWindow: z
      .string()
      .nullable()
      .describe(
        "Preferred date/time, e.g. 'Saturday morning', 'Tomorrow after 3pm'. Null if flexible.",
      ),
    notes: z
      .string()
      .nullable()
      .describe("Extra details from the user (symptoms, coat type, etc.)."),
  }),
  execute: async (input, runContext) => {
    const ctx = runContext?.context as BookingAgentContext | undefined;
    if (!ctx) {
      return JSON.stringify({ ok: false, error: "Missing run context." });
    }
    try {
      const draft = await createBookingDraft({
        user: ctx.user,
        pet: ctx.pet,
        servicePlaceId: input.servicePlaceId,
        requestedService: input.requestedService,
        requestedTimeWindow: input.requestedTimeWindow,
        notes: input.notes,
      });
      ctx.draft = draft;
      return JSON.stringify({
        ok: true,
        channel: draft.channel,
        placeName: draft.placeName,
        toEmail: draft.toEmail,
        hasMailto: Boolean(draft.mailtoUrl),
        bookingUrl: draft.bookingUrl,
        phone: draft.phone,
        status: draft.status,
      });
    } catch (e) {
      const error = e instanceof Error ? e.message : "Booking draft failed";
      return JSON.stringify({ ok: false, error });
    }
  },
});

const lookupPlaceTool = tool({
  name: "lookup_place",
  description:
    "Look up a service place by id to confirm it exists and see what booking channels are available (email, online booking URL, phone).",
  parameters: z.object({
    servicePlaceId: z.string().describe("UUID of the service place."),
  }),
  execute: async (input) => {
    const place = await getServicePlaceForBooking(input.servicePlaceId);
    if (!place) {
      return JSON.stringify({ ok: false, error: "Place not found." });
    }
    const email =
      place.primaryEmail ??
      place.contacts.find((c) => c.method === "email")?.value ??
      null;
    return JSON.stringify({
      ok: true,
      id: place.id,
      name: place.name,
      kind: place.kind,
      address: place.formattedAddress,
      email,
      bookingUrl: place.bookingUrl,
      phone: place.nationalPhoneNumber,
    });
  },
});

const BASE_INSTRUCTIONS = `You are the hidden Booking assistant for "Little Lovely Pets", a Singapore pet-care app. You help the user make a real reservation with a groomer or vet that was already recommended in the conversation.

How to work:
1. Identify WHICH place the user wants to book. Use the recent places list in context, or the preset place if provided. Match by name mentioned in the user's message. If unclear and multiple places exist, ask which one — do NOT guess wrongly.
2. Extract: service type (grooming / vet visit / etc.), preferred date/time window, and any notes (symptoms, special requests).
3. Call lookup_place to confirm the place, then create_booking_draft with the place id and extracted details.
4. After the draft is created, explain clearly what happens next:
   - If email channel: tell them their email draft is ready and they can tap "Open in email" to send it from their mail app. Mention the recipient address.
   - If online booking URL: tell them to use the booking link button.
   - If phone only: tell them to call the clinic/shop to book.
5. Be warm and concise. Use light Markdown. Never invent emails, phone numbers, or URLs — only use tool results.`;

export function buildBookingAgent(
  contextText: string,
  recentPlacesNote: string,
  presetNote: string,
): Agent<BookingAgentContext> {
  return new Agent<BookingAgentContext>({
    name: "Booking assistant",
    model: getAgentModel(),
    instructions: `${BASE_INSTRUCTIONS}\n\n${contextText}\n\n--- RECENT PLACES ---\n${recentPlacesNote}\n\n--- PRESET ---\n${presetNote}`,
    tools: [lookupPlaceTool, createBookingDraftTool],
  });
}

/** Fast path when place id is already known (Book button) — skips LLM. */
export async function createBookingDraftDirect(
  ctx: BookingAgentContext,
  opts: {
    servicePlaceId: string;
    requestedService?: string | null;
    requestedTimeWindow?: string | null;
    notes?: string | null;
  },
): Promise<BookingDraft> {
  const draft = await createBookingDraft({
    user: ctx.user,
    pet: ctx.pet,
    servicePlaceId: opts.servicePlaceId,
    requestedService: opts.requestedService,
    requestedTimeWindow: opts.requestedTimeWindow,
    notes: opts.notes,
  });
  ctx.draft = draft;
  return draft;
}

/** Try to resolve place id from message + recent places without LLM. */
export function resolvePlaceId(
  message: string,
  recentPlaces: { id: string; name: string }[],
  presetPlaceId?: string,
): string | null {
  if (presetPlaceId) return presetPlaceId;
  return matchPlaceFromMessage(message, recentPlaces);
}

export { matchPlaceFromMessage };
