export const SPECIALIST_IDS = [
  "food",
  "grooming",
  "vet",
  "meme",
  "booking",
] as const;

export type SpecialistAgentId = (typeof SPECIALIST_IDS)[number];

const AGENT_SCOPE: Record<SpecialistAgentId, string> = {
  food: "diet, nutrition, and pet food products",
  grooming: "grooming salons, bathing, nail trims, and coat care",
  vet: "symptoms, triage, and veterinary clinics",
  meme: "generating a funny meme from the uploaded pet photo",
  booking: "making an appointment or reservation at a groomer or vet",
};

const AGENT_IGNORE: Record<SpecialistAgentId, string> = {
  food: "grooming, vets, memes, booking, and general care tips",
  grooming: "food, vets, memes, booking, and general care tips",
  vet: "food, grooming, memes, booking, and general care tips",
  meme: "food, grooming, vets, booking, and general care tips",
  booking: "food, grooming, medical advice, memes, and general care tips",
};

/** Fallback when the router does not return a per-agent task. */
export function buildFallbackAgentTask(
  agentId: SpecialistAgentId,
  fullMessage: string,
): string {
  return `Handle only the part of the request about ${AGENT_SCOPE[agentId]}. Do not answer topics about ${AGENT_IGNORE[agentId]}.\n\nUser message:\n${fullMessage}`;
}

export function normalizeAgentTasks(
  agents: SpecialistAgentId[],
  tasks: { agentId: SpecialistAgentId; task: string }[] | undefined,
  fullMessage: string,
): Map<SpecialistAgentId, string> {
  const map = new Map<SpecialistAgentId, string>();
  for (const agentId of agents) {
    const routed = tasks
      ?.find((entry) => entry.agentId === agentId)
      ?.task?.trim();
    map.set(agentId, routed || buildFallbackAgentTask(agentId, fullMessage));
  }
  return map;
}

/** Message passed into a specialist handler for this turn. */
export function messageForSpecialist(
  agentId: SpecialistAgentId,
  fullMessage: string,
  task: string,
  multiAgent: boolean,
): string {
  if (!multiAgent) return task.trim() || fullMessage;

  return [
    "You are one of several specialists answering the same user message.",
    `Answer ONLY about ${AGENT_SCOPE[agentId]}.`,
    `Do NOT mention or answer ${AGENT_IGNORE[agentId]} — other agents handle those.`,
    "Do not repeat or summarize other specialists' work.",
    "",
    "Your assigned task:",
    task.trim() || fullMessage,
  ].join("\n");
}
