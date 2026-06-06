import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseDailyCareLogFormData } from "./care-log-form-data";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("parseDailyCareLogFormData", () => {
  it("parses and trims a complete daily care log form payload", () => {
    const parsed = parseDailyCareLogFormData(
      makeFormData({
        petId: " pet_123 ",
        fed: "yes",
        mood: "happy",
        weightKg: "6.255",
        notes: " Finished breakfast. ",
      }),
    );

    assert.deepEqual(parsed, {
      petId: "pet_123",
      fed: true,
      mood: "happy",
      weightKg: 6.26,
      notes: "Finished breakfast.",
    });
  });

  it("normalizes optional weight and notes", () => {
    const parsed = parseDailyCareLogFormData(
      makeFormData({
        petId: "pet_123",
        fed: "no",
        mood: "off",
        weightKg: "",
        notes: "   ",
      }),
    );

    assert.equal(parsed.fed, false);
    assert.equal(parsed.weightKg, null);
    assert.equal(parsed.notes, null);
  });

  it("rejects missing pet ids and invalid choices", () => {
    assert.throws(
      () =>
        parseDailyCareLogFormData(
          makeFormData({
            petId: "",
            fed: "yes",
            mood: "happy",
            weightKg: "",
            notes: "",
          }),
        ),
      /No pet profile found/,
    );
    assert.throws(
      () =>
        parseDailyCareLogFormData(
          makeFormData({
            petId: "pet_123",
            fed: "maybe",
            mood: "happy",
            weightKg: "",
            notes: "",
          }),
        ),
      /Choose whether your pet was fed/,
    );
    assert.throws(
      () =>
        parseDailyCareLogFormData(
          makeFormData({
            petId: "pet_123",
            fed: "yes",
            mood: "zoomy",
            weightKg: "",
            notes: "",
          }),
        ),
      /Choose a mood/,
    );
  });

  it("rejects invalid weight values", () => {
    for (const weightKg of ["0", "-1", "201", "not-a-number"]) {
      assert.throws(
        () =>
          parseDailyCareLogFormData(
            makeFormData({
              petId: "pet_123",
              fed: "yes",
              mood: "ok",
              weightKg,
              notes: "",
            }),
          ),
        /Weight must be between 0.1 and 200 kg/,
      );
    }
  });
});
