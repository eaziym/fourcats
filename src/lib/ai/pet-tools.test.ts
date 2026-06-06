import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAssistantSystemPrompt, buildPetTools } from "./pet-tools";

type FoodToolInput = {
  query: string;
  petType:
    | "dog"
    | "cat"
    | "rabbit"
    | "bird"
    | "fish"
    | "reptile"
    | "small_pet"
    | null;
  brand: string | null;
};

type ParseableSchema<T> = {
  parse(input: unknown): T;
  safeParse(input: unknown): { success: boolean };
};

describe("buildAssistantSystemPrompt", () => {
  it("combines the base prompt, tool guidance, and pet profile", () => {
    const prompt = buildAssistantSystemPrompt(
      "Base assistant prompt.",
      "Name: Mochi\nSpecies: Cat",
    );

    assert.match(prompt, /^Base assistant prompt\./);
    assert.match(prompt, /search_food: real pet-food products/);
    assert.match(prompt, /search_groomers \/ search_vets/);
    assert.match(prompt, /--- PET PROFILE ---\nName: Mochi\nSpecies: Cat$/);
  });
});

describe("buildPetTools", () => {
  it("builds the expected tool catalog", () => {
    const tools = buildPetTools({
      defaultPetType: "cat",
      petLatLng: { lat: 1.3, lng: 103.8 },
    });

    assert.deepEqual(Object.keys(tools), [
      "search_food",
      "search_groomers",
      "search_vets",
    ]);
    assert.match(
      tools.search_food.description ?? "",
      /real Singapore pet-food/,
    );
    assert.match(tools.search_groomers.description ?? "", /groomers near/);
    assert.match(tools.search_vets.description ?? "", /vet clinics near/);
  });

  it("validates food tool input shape", () => {
    const tools = buildPetTools({ petLatLng: null });
    const foodInputSchema = tools.search_food
      .inputSchema as ParseableSchema<FoodToolInput>;

    assert.deepEqual(
      foodInputSchema.parse({
        query: "senior cat food",
        petType: "cat",
        brand: null,
      }),
      {
        query: "senior cat food",
        petType: "cat",
        brand: null,
      },
    );
    assert.equal(
      foodInputSchema.safeParse({
        query: "horse feed",
        petType: "horse",
        brand: null,
      }).success,
      false,
    );
  });

  it("returns a clear groomer error when no location is available", async () => {
    const tools = buildPetTools({ petLatLng: null });
    const execute = tools.search_groomers.execute;
    assert.ok(execute);
    type ExecuteOptions = Parameters<NonNullable<typeof execute>>[1];

    assert.deepEqual(
      await execute(
        {
          postalCode: null,
          radiusKm: null,
        },
        {} as ExecuteOptions,
      ),
      {
        error:
          "No location available. Ask the user for a Singapore postal code.",
      },
    );
  });

  it("returns a clear vet error for an invalid postal code", async () => {
    const tools = buildPetTools({ petLatLng: null });
    const execute = tools.search_vets.execute;
    assert.ok(execute);
    type ExecuteOptions = Parameters<NonNullable<typeof execute>>[1];

    assert.deepEqual(
      await execute(
        {
          postalCode: "990000",
          radiusKm: 5,
        },
        {} as ExecuteOptions,
      ),
      {
        error:
          "No location available. Ask the user for a Singapore postal code.",
      },
    );
  });
});
