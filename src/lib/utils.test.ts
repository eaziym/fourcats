import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cn, tryCatch } from "./utils";

describe("cn", () => {
  it("combines conditional classes and resolves Tailwind conflicts", () => {
    assert.equal(cn("px-2 py-1", false && "hidden", "px-4"), "py-1 px-4");
  });
});

describe("tryCatch", () => {
  it("wraps resolved promises in a success result", async () => {
    assert.deepEqual(await tryCatch(Promise.resolve("ok")), {
      data: "ok",
      error: null,
    });
  });

  it("wraps rejected promises in a failure result", async () => {
    const error = new Error("boom");

    assert.deepEqual(await tryCatch(Promise.reject(error)), {
      data: null,
      error,
    });
  });
});
