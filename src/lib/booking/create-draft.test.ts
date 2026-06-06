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
    assert.match(url, /subject=Booking%20for%20Max/);
    assert.match(url, /body=Please%20book%20a%20slot\./);
    assert.doesNotMatch(url, /\+/);
  });

  it("trims recipients and preserves multiline draft content", () => {
    const url = buildMailtoUrl(
      " bookings@example.sg ",
      "Line check",
      "First line\nSecond line",
    );
    const parsed = new URL(url);

    assert.equal(parsed.protocol, "mailto:");
    assert.equal(parsed.pathname, "bookings%40example.sg");
    assert.equal(parsed.searchParams.get("subject"), "Line check");
    assert.equal(parsed.searchParams.get("body"), "First line\nSecond line");
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

  it("prefers the longest matching name", () => {
    const id = matchPlaceFromMessage("Please book with Happy Paws Vet Clinic", [
      { id: "short", name: "Happy Paws" },
      { id: "long", name: "Happy Paws Vet Clinic" },
    ]);

    assert.equal(id, "long");
  });

  it("falls back to significant token overlap", () => {
    const id = matchPlaceFromMessage("Can you book Heartland for Friday?", [
      { id: "abc", name: "Heartland Paws Grooming" },
      { id: "def", name: "Pet Lovers Centre" },
    ]);

    assert.equal(id, "abc");
  });

  it("returns null when there are no candidates or no confident multi-candidate match", () => {
    assert.equal(matchPlaceFromMessage("Book a visit", []), null);
    assert.equal(
      matchPlaceFromMessage("Book a visit", [
        { id: "abc", name: "Heartland Paws Grooming" },
        { id: "def", name: "Pet Lovers Centre" },
      ]),
      null,
    );
  });
});
