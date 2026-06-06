import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCreatePetData, parseCreatePetFormData } from "./pet-form.ts";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("onboarding pet form", () => {
  it("maps a complete Mochi demo payload to Prisma create data", () => {
    const parsed = parseCreatePetFormData(
      makeFormData({
        name: " Mochi ",
        species: "dog",
        breed: " shih tzu ",
        ageYears: "2",
        weightKg: "5.8",
        medicalConditions: "sensitive skin",
        dietaryRestrictions: "chicken-free",
        locationPostalCode: "520201",
      }),
    );

    assert.equal(parsed.success, true);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    assert.deepEqual(buildCreatePetData("user_mochi", parsed.data), {
      userId: "user_mochi",
      name: "Mochi",
      species: "dog",
      breed: "shih tzu",
      ageYears: 2,
      weightKg: 5.8,
      medicalConditions: ["sensitive skin"],
      dietaryRestrictions: ["chicken-free"],
      locationPostalCode: "520201",
    });
  });

  it("allows the demo profile to omit weight while keeping arrays non-null", () => {
    const parsed = parseCreatePetFormData(
      makeFormData({
        name: "Mochi",
        species: "dog",
        breed: "shih tzu",
        ageYears: "2",
        weightKg: "",
        medicalConditions: "sensitive skin",
        dietaryRestrictions: "",
        locationPostalCode: "520201",
      }),
    );

    assert.equal(parsed.success, true);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    assert.deepEqual(buildCreatePetData("user_mochi", parsed.data), {
      userId: "user_mochi",
      name: "Mochi",
      species: "dog",
      breed: "shih tzu",
      ageYears: 2,
      weightKg: null,
      medicalConditions: ["sensitive skin"],
      dietaryRestrictions: [],
      locationPostalCode: "520201",
    });
  });

  it("rejects missing required fields and invalid postal codes", () => {
    const parsed = parseCreatePetFormData(
      makeFormData({
        name: "  ",
        species: "dog",
        breed: "",
        ageYears: "",
        weightKg: "",
        medicalConditions: "",
        dietaryRestrictions: "",
        locationPostalCode: "123",
      }),
    );

    assert.equal(parsed.success, false);
    if (parsed.success) {
      throw new Error("Expected form parsing to fail");
    }

    assert.equal(
      parsed.error.issues.some((issue) => issue.message === "Name is required"),
      true,
    );
    assert.equal(
      parsed.error.issues.some(
        (issue) => issue.message === "Enter a 6-digit Singapore postal code",
      ),
      true,
    );
  });

  it("rejects unsupported species and out-of-range numbers", () => {
    const parsed = parseCreatePetFormData(
      makeFormData({
        name: "Mochi",
        species: "rabbit",
        breed: "",
        ageYears: "41",
        weightKg: "0",
        medicalConditions: "",
        dietaryRestrictions: "",
        locationPostalCode: "520201",
      }),
    );

    assert.equal(parsed.success, false);
    if (parsed.success) {
      throw new Error("Expected form parsing to fail");
    }

    assert.equal(
      parsed.error.issues.some((issue) => issue.message === "Age is too high"),
      true,
    );
    assert.equal(
      parsed.error.issues.some(
        (issue) => issue.message === "Weight is too low",
      ),
      true,
    );
  });
});
