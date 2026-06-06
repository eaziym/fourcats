import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDailyCareLogFormData } from "./care-log-form-data.ts";

describe("parseDailyCareLogFormData", () => {
  it("parses a complete daily care log form payload", () => {
    const formData = new FormData();
    formData.set("petId", "pet_123");
    formData.set("fed", "yes");
    formData.set("mood", "happy");
    formData.set("weightKg", "6.25");
    formData.set("notes", "Finished breakfast.");

    const parsed = parseDailyCareLogFormData(formData);

    assert.deepEqual(parsed, {
      petId: "pet_123",
      fed: true,
      mood: "happy",
      weightKg: 6.25,
      notes: "Finished breakfast.",
    });
  });

  it("normalizes optional fields and rejects invalid choices", () => {
    const formData = new FormData();
    formData.set("petId", "pet_123");
    formData.set("fed", "no");
    formData.set("mood", "off");
    formData.set("weightKg", "");
    formData.set("notes", "   ");

    const parsed = parseDailyCareLogFormData(formData);

    assert.equal(parsed.fed, false);
    assert.equal(parsed.weightKg, null);
    assert.equal(parsed.notes, null);

    formData.set("mood", "zoomy");
    assert.throws(() => parseDailyCareLogFormData(formData), /Choose a mood/);
  });
});
