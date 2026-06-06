import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { PetDTO } from "@/lib/pet-queries";
import { buildBookingEmail } from "./draft-email";

const pet: PetDTO = {
  id: "pet-1",
  name: "Mochi",
  species: "Cat",
  breed: "Ragdoll",
  photoUrl: null,
  ageYears: "4",
  weightKg: "5.2",
  medicalConditions: ["sensitive stomach"],
  dietaryRestrictions: ["grain-free"],
  locationPostalCode: "160001",
  locationLabel: "Tiong Bahru",
  notes: "Gets nervous around loud dryers.",
  careLogs: [],
};

describe("buildBookingEmail", () => {
  it("builds a detailed grooming enquiry for a known pet", () => {
    const email = buildBookingEmail({
      place: {
        name: "Heartland Paws",
        kind: "groomer",
        address: "123 Pet Street",
      },
      pet,
      customerName: "Ada Lovelace",
      customerEmail: "ada@example.com",
      customerPhone: "9123 4567",
      requestedService: "Full groom",
      requestedTimeWindow: "Saturday morning",
      notes: "Please use gentle shampoo.",
    });

    assert.equal(email.subject, "Booking enquiry for Mochi — Full groom");
    assert.match(email.body, /^Dear Heartland Paws team,/);
    assert.match(email.body, /Service: Full groom/);
    assert.match(email.body, /Preferred time: Saturday morning/);
    assert.match(email.body, /Additional notes: Please use gentle shampoo\./);
    assert.match(email.body, /Species: Cat \(Ragdoll\)/);
    assert.match(email.body, /Medical conditions: sensitive stomach/);
    assert.match(email.body, /Dietary restrictions: grain-free/);
    assert.match(email.body, /Notes: Gets nervous around loud dryers\./);
    assert.match(email.body, /Your clinic\/shop: 123 Pet Street/);
    assert.match(email.body, /9123 4567$/);
  });

  it("uses sensible defaults for vets and missing pet details", () => {
    const email = buildBookingEmail({
      place: {
        name: "Bright Vet Clinic",
        kind: "vet",
        address: null,
      },
      pet: null,
      customerName: "Pet Owner",
      customerEmail: "owner@example.com",
      requestedService: " ",
      requestedTimeWindow: "",
      notes: " ",
    });

    assert.equal(
      email.subject,
      "Booking enquiry for my pet — Vet consultation",
    );
    assert.match(email.body, /Service: Vet consultation/);
    assert.match(
      email.body,
      /Preferred time: Flexible . please suggest available slots/,
    );
    assert.match(email.body, /Pet details: not on file/);
    assert.doesNotMatch(email.body, /Additional notes:/);
    assert.doesNotMatch(email.body, /Your clinic\/shop:/);
  });
});
