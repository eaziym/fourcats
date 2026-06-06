import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  centsToBudgetInput,
  GENDER_OPTIONS,
  updateUserSettingsSchema,
} from "./user-settings.schemas";

describe("GENDER_OPTIONS", () => {
  it("keeps the blank option first for optional settings forms", () => {
    assert.deepEqual(GENDER_OPTIONS[0], {
      value: "",
      label: "Prefer not to say",
    });
  });
});

describe("updateUserSettingsSchema", () => {
  it("trims display names, normalizes blank gender, and stores budgets as cents", () => {
    const parsed = updateUserSettingsSchema.parse({
      displayName: "  Ada  ",
      gender: "",
      monthlyFoodBudget: "125.49",
      monthlyGroomingBudget: "0",
      monthlyVetBudget: "",
      monthlySuppliesBudget: null,
    });

    assert.deepEqual(parsed, {
      displayName: "Ada",
      gender: null,
      monthlyFoodBudget: 12549,
      monthlyGroomingBudget: 0,
      monthlyVetBudget: null,
      monthlySuppliesBudget: null,
    });
  });

  it("accepts explicit gender choices", () => {
    const parsed = updateUserSettingsSchema.parse({
      displayName: "",
      gender: "non_binary",
      monthlyFoodBudget: "",
      monthlyGroomingBudget: "",
      monthlyVetBudget: "",
      monthlySuppliesBudget: "",
    });

    assert.equal(parsed.displayName, null);
    assert.equal(parsed.gender, "non_binary");
  });

  it("rejects negative budgets, excessive budgets, and unknown genders", () => {
    assert.equal(
      updateUserSettingsSchema.safeParse({
        displayName: "",
        gender: "unknown",
        monthlyFoodBudget: "50",
        monthlyGroomingBudget: "",
        monthlyVetBudget: "",
        monthlySuppliesBudget: "",
      }).success,
      false,
    );
    assert.equal(
      updateUserSettingsSchema.safeParse({
        displayName: "",
        gender: "",
        monthlyFoodBudget: "-1",
        monthlyGroomingBudget: "",
        monthlyVetBudget: "",
        monthlySuppliesBudget: "",
      }).success,
      false,
    );
    assert.equal(
      updateUserSettingsSchema.safeParse({
        displayName: "",
        gender: "",
        monthlyFoodBudget: "100001",
        monthlyGroomingBudget: "",
        monthlyVetBudget: "",
        monthlySuppliesBudget: "",
      }).success,
      false,
    );
  });
});

describe("centsToBudgetInput", () => {
  it("formats nullable cent values for whole-dollar form inputs", () => {
    assert.equal(centsToBudgetInput(null), "");
    assert.equal(centsToBudgetInput(undefined), "");
    assert.equal(centsToBudgetInput(0), "0");
    assert.equal(centsToBudgetInput(1299), "13");
  });
});
