import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const originalEnv = new Map(
  ENV_KEYS.map((key) => [key, process.env[key]] as const),
);

function setEnv(
  values: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>,
) {
  for (const key of ENV_KEYS) {
    const value = values[key];
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("Supabase env helpers", () => {
  afterEach(() => {
    for (const [key, value] of originalEnv) {
      if (value == null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("returns the configured Supabase URL", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" });

    assert.equal(getSupabaseUrl(), "https://example.supabase.co");
  });

  it("throws when the Supabase URL is missing", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: undefined });

    assert.throws(() => getSupabaseUrl(), /Missing NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("prefers the publishable key over the legacy anon key", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });

    assert.equal(getSupabasePublishableKey(), "publishable-key");
  });

  it("falls back to the legacy anon key", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });

    assert.equal(getSupabasePublishableKey(), "anon-key");
  });

  it("throws when no client key is configured", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    });

    assert.throws(
      () => getSupabasePublishableKey(),
      /Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });
});
