import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { PetDTO } from "@/lib/pet-queries";
import {
  buildCareAlerts,
  hasActiveCareAlerts,
  topCareAlert,
} from "./care-alerts";

const basePet: PetDTO = {
  id: "pet-1",
  name: "Mochi",
  species: "cat",
  breed: "Ragdoll",
  photoUrl: null,
  ageYears: "4",
  weightKg: "5.2",
  medicalConditions: [],
  dietaryRestrictions: [],
  locationPostalCode: "160001",
  locationLabel: "Tiong Bahru",
  notes: null,
  careLogs: [],
};

describe("buildCareAlerts", () => {
  it("orders urgent symptoms before mood, condition, and feeding reminders", () => {
    const alerts = buildCareAlerts({
      ...basePet,
      medicalConditions: ["sensitive stomach"],
      careLogs: [
        {
          id: "log-1",
          fed: false,
          mood: "Anxious",
          weightKg: null,
          symptoms: ["vomiting", "itching"],
          notes: null,
          loggedAt: "2026-06-06T00:00:00.000Z",
        },
        {
          id: "log-2",
          fed: true,
          mood: "sad",
          weightKg: null,
          symptoms: ["vomiting"],
          notes: null,
          loggedAt: "2026-06-05T00:00:00.000Z",
        },
      ],
    });

    assert.deepEqual(
      alerts.map((alert) => alert.id),
      ["symptoms", "mood", "conditions", "fed"],
    );
    assert.equal(alerts[0].level, "attention");
    assert.match(alerts[0].message, /vomiting, itching/);
  });

  it("returns an all-good alert when recent logs have no issues", () => {
    const alerts = buildCareAlerts({
      ...basePet,
      careLogs: [
        {
          id: "log-1",
          fed: true,
          mood: "happy",
          weightKg: "5.2",
          symptoms: [],
          notes: null,
          loggedAt: "2026-06-06T00:00:00.000Z",
        },
      ],
    });

    assert.deepEqual(alerts, [
      {
        id: "good",
        level: "good",
        label: "All good",
        message:
          "No concerns in Mochi's recent check-ins. Keep up the daily logs and regular vet visits.",
      },
    ]);
    assert.equal(hasActiveCareAlerts(alerts), false);
  });

  it("prompts the user to start logging when no care logs exist", () => {
    const alert = topCareAlert(basePet);

    assert.equal(alert.id, "good");
    assert.match(alert.message, /Start logging Mochi's meals/);
  });
});

describe("hasActiveCareAlerts", () => {
  it("detects non-good alerts", () => {
    assert.equal(
      hasActiveCareAlerts([
        {
          id: "fed",
          level: "watch",
          label: "Reminder",
          message: "Meal reminder",
        },
      ]),
      true,
    );
  });
});
