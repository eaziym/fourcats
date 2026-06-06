import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFallbackAgentTask,
  messageForSpecialist,
  normalizeAgentTasks,
} from "./agent-tasks";

describe("agent-tasks", () => {
  it("builds scoped fallback tasks", () => {
    const task = buildFallbackAgentTask(
      "food",
      "Find food and a groomer near me",
    );
    assert.match(task, /diet, nutrition, and pet food products/i);
    assert.match(task, /Do not answer topics about grooming/i);
  });

  it("uses routed tasks when provided", () => {
    const map = normalizeAgentTasks(
      ["food", "grooming"],
      [
        { agentId: "food", task: "Recommend kibble for a senior dog." },
        { agentId: "grooming", task: "Find groomers nearby." },
      ],
      "Recommend kibble and find groomers",
    );
    assert.equal(map.get("food"), "Recommend kibble for a senior dog.");
    assert.equal(map.get("grooming"), "Find groomers nearby.");
  });

  it("wraps multi-agent messages with scope guardrails", () => {
    const msg = messageForSpecialist(
      "food",
      "Find food and groomers",
      "Recommend food only",
      true,
    );
    assert.match(msg, /Answer ONLY about diet, nutrition/i);
    assert.match(msg, /Do NOT mention or answer grooming/i);
    assert.match(msg, /Recommend food only/);
  });

  it("passes single-agent tasks through without multi-agent wrapper", () => {
    assert.equal(
      messageForSpecialist("vet", "My dog is limping", "My dog is limping", false),
      "My dog is limping",
    );
  });
});
