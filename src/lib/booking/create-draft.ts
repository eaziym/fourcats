import "server-only";

import { buildBookingEmail } from "@/lib/booking/draft-email";
import { buildMailtoUrl } from "@/lib/booking/mailto";
import type { BookingChannel, BookingDraft } from "@/lib/booking/types";
import { prisma } from "@/lib/db";
import type { PetDTO } from "@/lib/pet-queries";

export { matchPlaceFromMessage } from "@/lib/booking/match-place";

function resolveRecipientEmail(place: {
  primaryEmail: string | null;
  contacts: { method: string; value: string; isBookingCapable: boolean }[];
}): string | null {
  if (place.primaryEmail?.trim()) return place.primaryEmail.trim();
  const bookingEmails = place.contacts.filter(
    (c) => c.method === "email" && c.isBookingCapable && c.value.trim(),
  );
  if (bookingEmails.length > 0) return bookingEmails[0].value.trim();
  const anyEmail = place.contacts.find(
    (c) => c.method === "email" && c.value.trim(),
  );
  return anyEmail?.value.trim() ?? null;
}

function customerDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata ?? {};
  const first =
    typeof meta.first_name === "string" ? meta.first_name.trim() : "";
  const last = typeof meta.last_name === "string" ? meta.last_name.trim() : "";
  const full = [first, last].filter(Boolean).join(" ");
  if (full) return full;
  if (user.email) return user.email.split("@")[0] ?? "Pet owner";
  return "Pet owner";
}

/** Load a service place with booking-relevant contacts. */
export async function getServicePlaceForBooking(servicePlaceId: string) {
  return prisma.servicePlace.findUnique({
    where: { id: servicePlaceId },
    select: {
      id: true,
      name: true,
      kind: true,
      formattedAddress: true,
      primaryEmail: true,
      bookingUrl: true,
      nationalPhoneNumber: true,
      contacts: {
        where: { method: { in: ["email", "whatsapp", "calendly"] } },
        select: {
          method: true,
          value: true,
          isBookingCapable: true,
        },
      },
    },
  });
}

/** Create a persisted booking request and return a UI-ready draft. */
export async function createBookingDraft(opts: {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  pet: PetDTO | null;
  servicePlaceId: string;
  requestedService?: string | null;
  requestedTimeWindow?: string | null;
  notes?: string | null;
}): Promise<BookingDraft> {
  const place = await getServicePlaceForBooking(opts.servicePlaceId);
  if (!place) {
    throw new Error("That service provider was not found.");
  }

  const toEmail = resolveRecipientEmail(place);
  const customerName = customerDisplayName(opts.user);
  const customerEmail = opts.user.email?.trim() ?? "";
  const service =
    opts.requestedService?.trim() ||
    (place.kind === "vet"
      ? "Vet consultation"
      : place.kind === "groomer"
        ? "Grooming appointment"
        : "Appointment");
  const timeWindow =
    opts.requestedTimeWindow?.trim() ||
    "Flexible — please suggest available slots";

  let channel: BookingChannel = "manual";
  let status = "call_required";
  let subject: string | null = null;
  let body: string | null = null;
  let mailtoUrl: string | null = null;

  if (toEmail) {
    const email = buildBookingEmail({
      place: {
        name: place.name,
        kind: place.kind,
        address: place.formattedAddress,
      },
      pet: opts.pet,
      customerName,
      customerEmail,
      requestedService: service,
      requestedTimeWindow: timeWindow,
      notes: opts.notes,
    });
    subject = email.subject;
    body = email.body;
    mailtoUrl = buildMailtoUrl(toEmail, subject, body);
    channel = "email";
    status = "email_drafted";
  } else if (place.bookingUrl?.trim()) {
    channel = "calendly";
    status = "pending_user_confirmation";
  } else if (place.nationalPhoneNumber?.trim()) {
    channel = "phone";
    status = "call_required";
  }

  const petSnapshot = opts.pet
    ? {
        id: opts.pet.id,
        name: opts.pet.name,
        species: opts.pet.species,
        breed: opts.pet.breed,
        ageYears: opts.pet.ageYears,
        weightKg: opts.pet.weightKg,
        medicalConditions: opts.pet.medicalConditions,
        dietaryRestrictions: opts.pet.dietaryRestrictions,
      }
    : {};

  const row = await prisma.bookingRequest.create({
    data: {
      petId: opts.pet?.id,
      servicePlaceId: place.id,
      status,
      requestedService: service,
      requestedTimeWindow: timeWindow,
      customerName,
      customerEmail: customerEmail || null,
      petSnapshot,
      message: opts.notes?.trim() || null,
      outboundChannel:
        channel === "email"
          ? "email"
          : channel === "calendly"
            ? "calendly"
            : channel === "phone"
              ? "phone"
              : "manual",
      outboundTo: toEmail ?? place.bookingUrl ?? place.nationalPhoneNumber,
      outboundPayload:
        subject && body ? { subject, body, mailtoUrl } : ({} as object),
      externalEventUrl: place.bookingUrl,
    },
  });

  return {
    bookingRequestId: row.id,
    placeId: place.id,
    placeName: place.name,
    channel,
    status,
    requestedService: service,
    requestedTimeWindow: timeWindow,
    toEmail,
    subject,
    body,
    mailtoUrl,
    bookingUrl: place.bookingUrl,
    phone: place.nationalPhoneNumber,
  };
}
