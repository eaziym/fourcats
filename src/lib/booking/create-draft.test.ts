import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildMailtoUrl } from "@/lib/booking/mailto";
import { matchPlaceFromMessage } from "@/lib/booking/match-place";

describe("buildMailtoUrl", () => {
  it("encodes subject and body for mail clients", () => {
    const url = buildMailtoUrl(
      "hello@clinic.sg",
      "Booking for Max",
      "Please book a slot.",
    );
    assert.equal(url.startsWith("mailto:hello%40clinic.sg?"), true);
    assert.match(url, /subject=Booking/);
    assert.match(url, /body=Please/);
  });
});

describe("matchPlaceFromMessage", () => {
  it("matches a place name mentioned in the message", () => {
    const id = matchPlaceFromMessage("Book at Heartland Paws tomorrow", [
      { id: "abc", name: "Heartland Paws Grooming" },
      { id: "def", name: "Pet Lovers Centre" },
    ]);
    assert.equal(id, "abc");
  });

  it("uses the sole candidate when only one place is in context", () => {
    const id = matchPlaceFromMessage("Schedule an appointment please", [
      { id: "solo", name: "Bright Vet Clinic" },
    ]);
    assert.equal(id, "solo");
  });
});
