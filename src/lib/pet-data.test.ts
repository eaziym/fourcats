import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  discoveryFilters,
  mochiPortrait,
  navItems,
  petAvatarSrc,
  petPlaceholderImage,
  petPortrait,
} from "./pet-data";

describe("petPlaceholderImage", () => {
  it("uses the cat portrait for cat profiles", () => {
    assert.equal(petPlaceholderImage("Cat"), petPortrait);
  });

  it("uses the default portrait for non-cat profiles", () => {
    assert.equal(petPlaceholderImage("dog"), mochiPortrait);
    assert.equal(petPlaceholderImage("rabbit"), mochiPortrait);
  });
});

describe("petAvatarSrc", () => {
  it("prefers the uploaded photo over species stock art", () => {
    assert.equal(
      petAvatarSrc({
        photoUrl: "https://cdn.example/pet.jpg",
        species: "Cat",
      }),
      "https://cdn.example/pet.jpg",
    );
  });

  it("falls back to species stock art when no photo is set", () => {
    assert.equal(
      petAvatarSrc({ photoUrl: null, species: "Cat" }),
      petPortrait,
    );
  });
});

describe("navItems", () => {
  it("keeps app navigation ids and hrefs stable", () => {
    assert.deepEqual(
      navItems.map((item) => [item.id, item.href]),
      [
        ["dashboard", "/"],
        ["assistant", "/assistant"],
        ["discovery", "/discovery"],
        ["profiles", "/profiles"],
      ],
    );
  });
});

describe("discoveryFilters", () => {
  it("starts on the groomers filter only", () => {
    assert.deepEqual(
      discoveryFilters.map((filter) => [filter.label, filter.active]),
      [
        ["Groomers", true],
        ["Vets", false],
        ["Pet-Friendly Cafes", false],
        ["Supplies", false],
      ],
    );
  });
});
