import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ASSISTANT_AGENTS,
  getAgentLabel,
  getAssistantAgent,
  HIDDEN_AGENT_LABELS,
} from "./registry";

describe("ASSISTANT_AGENTS", () => {
  it("has stable unique ids for every selectable assistant mode", () => {
    const ids = ASSISTANT_AGENTS.map((agent) => agent.id);

    assert.deepEqual(ids, ["general", "food", "grooming", "vet", "meme"]);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal("booking" in HIDDEN_AGENT_LABELS, true);
    assert.equal(ids.includes("booking" as (typeof ids)[number]), false);
  });

  it("keeps agent metadata usable by client selectors", () => {
    for (const agent of ASSISTANT_AGENTS) {
      assert.equal(typeof agent.label, "string");
      assert.equal(agent.label.length > 0, true);
      assert.equal(typeof agent.description, "string");
      assert.equal(agent.description.length > 0, true);
      assert.equal(
        ["chat", "food", "grooming", "vet", "meme"].includes(agent.kind),
        true,
      );
    }
  });
});

describe("getAssistantAgent", () => {
  it("returns the matching agent metadata", () => {
    assert.deepEqual(getAssistantAgent("grooming"), {
      id: "grooming",
      label: "Grooming finder",
      description: "Find grooming stores near you, matched to your pet.",
      kind: "grooming",
    });
  });

  it("returns undefined for unknown ids", () => {
    assert.equal(getAssistantAgent("unknown"), undefined);
  });
});

describe("getAgentLabel", () => {
  it("returns labels for selectable and hidden agents", () => {
    assert.equal(getAgentLabel("general"), "Pet assistant");
    assert.equal(getAgentLabel("booking"), "Booking assistant");
    assert.equal(getAgentLabel("unknown"), undefined);
  });
});
