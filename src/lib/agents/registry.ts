/**
 * Agent catalog for the AI Assistant tab. Metadata only — safe to import from client components.
 * Server-side agent definitions live next to this file (e.g. `meme-agent.ts`).
 */
export const ASSISTANT_AGENTS = [
  {
    id: "general",
    label: "Pet assistant",
    description:
      "Plans your request and delegates to specialists — or answers simple care questions directly.",
    kind: "chat" as const,
  },
  {
    id: "food",
    label: "Food finder",
    description:
      "Grounded food picks for your pet — with prices and where to buy.",
    kind: "food" as const,
  },
  {
    id: "grooming",
    label: "Grooming finder",
    description: "Find grooming stores near you, matched to your pet.",
    kind: "grooming" as const,
  },
  {
    id: "vet",
    label: "Vet finder",
    description:
      "Describe symptoms or add a photo — get triage advice and nearby vets.",
    kind: "vet" as const,
  },
  {
    id: "meme",
    label: "Meme agent",
    description: "Upload a pet photo and get a generated meme image.",
    kind: "meme" as const,
  },
] as const;

export type AssistantAgentId = (typeof ASSISTANT_AGENTS)[number]["id"];
export type AssistantAgentKind = (typeof ASSISTANT_AGENTS)[number]["kind"];

export const GENERAL_ORCHESTRATOR_TOOLS = ["plan", "delegate"] as const;

/** Tools each agent may call — shown in the agents catalog. */
export const AGENT_TOOLS: Record<string, string[]> = {
  general: [...GENERAL_ORCHESTRATOR_TOOLS],
  food: ["search_food"],
  grooming: ["search_groomers"],
  vet: ["search_vets"],
  meme: ["generate_pet_meme"],
  booking: ["lookup_place", "create_booking_draft"],
};

/** Agents that run implicitly — not user-selectable. */
export const HIDDEN_AGENT_LABELS: Record<string, string> = {
  booking: "Booking assistant",
};

export function getAssistantAgent(id: string) {
  return ASSISTANT_AGENTS.find((a) => a.id === id);
}

/** Label for any agent id, including hidden ones (e.g. booking). */
export function getAgentLabel(id: string): string | undefined {
  return getAssistantAgent(id)?.label ?? HIDDEN_AGENT_LABELS[id];
}
