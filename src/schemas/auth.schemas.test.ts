import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emailSchema,
  forgotPasswordSchema,
  passwordSchema,
  signInSchema,
  signUpSchema,
} from "./auth.schemas";

function issueMessages(result: {
  success: false;
  error: { issues: unknown[] };
}) {
  return result.error.issues.map((issue) => {
    const { message } = issue as { message: string };
    return message;
  });
}

describe("emailSchema", () => {
  it("accepts valid email addresses", () => {
    assert.equal(emailSchema.safeParse("person@example.com").success, true);
  });

  it("rejects empty and malformed email addresses", () => {
    assert.equal(emailSchema.safeParse("").success, false);
    assert.equal(emailSchema.safeParse("not-an-email").success, false);
  });
});

describe("passwordSchema", () => {
  it("requires at least eight characters", () => {
    assert.equal(passwordSchema.safeParse("12345678").success, true);
    assert.equal(passwordSchema.safeParse("1234567").success, false);
  });
});

describe("signInSchema", () => {
  it("accepts a valid sign-in payload", () => {
    assert.equal(
      signInSchema.safeParse({
        email: "person@example.com",
        password: "correct-horse",
      }).success,
      true,
    );
  });

  it("reports invalid email and password fields", () => {
    const result = signInSchema.safeParse({
      email: "bad",
      password: "short",
    });

    assert.equal(result.success, false);
    assert.deepEqual(issueMessages(result), [
      "Invalid email address",
      "Password must be at least 8 characters",
    ]);
  });
});

describe("signUpSchema", () => {
  const validPayload = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    password: "analytical-engine",
    confirmPassword: "analytical-engine",
    terms: true,
  };

  it("accepts a complete sign-up payload", () => {
    assert.equal(signUpSchema.safeParse(validPayload).success, true);
  });

  it("requires matching passwords", () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      confirmPassword: "different-password",
    });

    assert.equal(result.success, false);
    assert.deepEqual(result.error.issues[0]?.path, ["confirmPassword"]);
    assert.equal(result.error.issues[0]?.message, "Passwords do not match");
  });

  it("requires terms acceptance", () => {
    const result = signUpSchema.safeParse({ ...validPayload, terms: false });

    assert.equal(result.success, false);
    assert.equal(
      result.error.issues.some(
        (issue) => issue.message === "You must accept the terms and conditions",
      ),
      true,
    );
  });
});

describe("forgotPasswordSchema", () => {
  it("validates the reset email", () => {
    assert.equal(
      forgotPasswordSchema.safeParse({ email: "person@example.com" }).success,
      true,
    );
    assert.equal(
      forgotPasswordSchema.safeParse({ email: "bad" }).success,
      false,
    );
  });
});
