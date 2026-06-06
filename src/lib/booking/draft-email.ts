import type { PetDTO } from "@/lib/pet-queries";

type PlaceInfo = {
  name: string;
  kind: string;
  address: string | null;
};

function defaultService(kind: string): string {
  if (kind === "vet") return "Vet consultation";
  if (kind === "groomer") return "Grooming appointment";
  return "Appointment";
}

function petSummary(pet: PetDTO | null): string[] {
  if (!pet)
    return [
      "Pet details: not on file — please ask me for species, age and any health notes.",
    ];
  const lines = [
    `Pet name: ${pet.name}`,
    `Species: ${pet.species}${pet.breed ? ` (${pet.breed})` : ""}`,
  ];
  if (pet.ageYears) lines.push(`Age: ${pet.ageYears} years`);
  if (pet.weightKg) lines.push(`Weight: ${pet.weightKg} kg`);
  if (pet.medicalConditions.length) {
    lines.push(`Medical conditions: ${pet.medicalConditions.join(", ")}`);
  }
  if (pet.dietaryRestrictions.length) {
    lines.push(`Dietary restrictions: ${pet.dietaryRestrictions.join(", ")}`);
  }
  if (pet.notes?.trim()) lines.push(`Notes: ${pet.notes.trim()}`);
  return lines;
}

/** Compose a professional booking enquiry email (SG English, warm but concise). */
export function buildBookingEmail(opts: {
  place: PlaceInfo;
  pet: PetDTO | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  requestedService?: string | null;
  requestedTimeWindow?: string | null;
  notes?: string | null;
}): { subject: string; body: string } {
  const {
    place,
    pet,
    customerName,
    customerEmail,
    customerPhone,
    requestedService,
    requestedTimeWindow,
    notes,
  } = opts;

  const service = requestedService?.trim() || defaultService(place.kind);
  const timeWindow =
    requestedTimeWindow?.trim() || "Flexible — please suggest available slots";
  const petName = pet?.name ?? "my pet";

  const subject = `Booking enquiry for ${petName} — ${service}`;

  const bodyLines = [
    `Dear ${place.name} team,`,
    "",
    `I would like to request an appointment through Little Lovely Pets.`,
    "",
    `Service: ${service}`,
    `Preferred time: ${timeWindow}`,
    ...(notes?.trim() ? [`Additional notes: ${notes.trim()}`, ""] : [""]),
    ...petSummary(pet),
    "",
    ...(place.address ? [`Your clinic/shop: ${place.address}`, ""] : []),
    "Please let me know your available slots. Thank you!",
    "",
    customerName,
    customerEmail,
    ...(customerPhone?.trim() ? [customerPhone.trim()] : []),
  ];

  return { subject, body: bodyLines.join("\n") };
}
