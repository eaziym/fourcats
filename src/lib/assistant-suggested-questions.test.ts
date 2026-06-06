import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { PetDTO } from "@/lib/pet-queries";
import { buildSuggestedQuestions } from "./assistant-suggested-questions";

const basePet: PetDTO = {
  id: "pet-1",
  name: "Mochi",
  species: "Cat",
  breed: null,
  photoUrl: null,
  ageYears: "4",
  weightKg: null,
  medicalConditions: [],
  dietaryRestrictions: [],
  locationPostalCode: null,
  locationLabel: null,
  notes: null,
  careLogs: [],
};

describe("buildSuggestedQuestions", () => {
  it("builds generic suggestions when no pet is selected", () => {
    assert.deepEqual(buildSuggestedQuestions(null).slice(0, 4), [
      "What food is best for my pet?",
      "Find groomers near me for my pet",
      "Which vet should I visit for my pet?",
      "What should I know about caring for a pet in Singapore?",
    ]);
  });

  it("personalizes suggestions using pet name and species", () => {
    const questions = buildSuggestedQuestions(basePet);

    assert.equal(questions[0], "What food is best for Mochi?");
    assert.equal(
      questions[3],
      "What should I know about caring for a cat in Singapore?",
    );
  });

  it("adds condition and dietary follow-ups", () => {
    const questions = buildSuggestedQuestions({
      ...basePet,
      medicalConditions: ["sensitive stomach", "allergies"],
      dietaryRestrictions: ["grain-free", "chicken-free"],
    });

    assert.equal(
      questions.at(-2),
      "Food options for Mochi with sensitive stomach",
    );
    assert.equal(
      questions.at(-1),
      "Find grain-free, chicken-free food for Mochi",
    );
  });
});
