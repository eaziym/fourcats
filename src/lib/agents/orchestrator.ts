import "server-only";

import { generateObject } from "ai";
import { z } from "zod";
import {
  agentResultToMessageContent,
  runBookingAgent,
  runFoodAgent,
  runGeneralAgent,
  runGroomingAgent,
  runMemeAgent,
  runVetAgent,
} from "@/lib/agents/handlers";
import {
  GENERAL_ORCHESTRATOR_TOOLS,
  getAgentLabel,
} from "@/lib/agents/registry";
import { getModel } from "@/lib/ai/providers";
import type { ChatMessageData, DelegationStepDTO } from "@/lib/chat/types";
import { buildPetProfilePrompt } from "@/lib/pet-data/format";
import { getPetCareContext } from "@/lib/pet-queries";

const SPECIALIST_IDS = ["food", "grooming", "vet", "meme", "booking"] as const;

export type SpecialistAgentId = (typeof SPECIALIST_IDS)[number];

export type OrchestrationMessage = {
  agentId: string;
  content: string;
  data?: ChatMessageData | null;
};

export type OrchestrateResult = {
  steps: DelegationStepDTO[];
  messages: OrchestrationMessage[];
  error?: string;
};

const BOOKING_INTENT_RE =
  /\b(book(ing)?|appointment|reserve|reservation|schedule)\b/i;

function routeWithHeuristics(args: {
  message: string;
  hasImage: boolean;
  recentPlacesCount: number;
}): SpecialistAgentId[] {
  const text = args.message.toLowerCase();
  const agents = new Set<SpecialistAgentId>();

  if (
    args.hasImage &&
    /\b(meme|funny|joke|caption|hilarious|roast)\b/i.test(args.message)
  ) {
    agents.add("meme");
  }

  if (
    /\b(food|kibble|diet|nutrition|treat|feed|eating|hungry|brand|protein)\b/i.test(
      text,
    )
  ) {
    agents.add("food");
  }

  if (
    /\b(groom|grooming|bath|trim|nail|shampoo|salon|haircut|deshed)\b/i.test(
      text,
    )
  ) {
    agents.add("grooming");
  }

  if (
    /\b(vet|sick|symptom|vomit|limping|emergency|pain|fever|diarrhea|not eating|lethargic|injury|wound|itch|scratch)\b/i.test(
      text,
    ) ||
    (args.hasImage &&
      /\b(look|check|what('s| is) wrong|healthy|skin|rash)\b/i.test(text))
  ) {
    agents.add("vet");
  }

  if (
    BOOKING_INTENT_RE.test(args.message) &&
    (args.recentPlacesCount > 0 || /\b(at|with)\s+\w/i.test(args.message))
  ) {
    agents.add("booking");
  }

  return [...agents];
}

async function routeToSpecialists(args: {
  message: string;
  hasImage: boolean;
  recentPlacesCount: number;
  petSummary: string;
}): Promise<{ agents: SpecialistAgentId[]; reasoning: string }> {
  try {
    const { object } = await generateObject({
      model: getModel(),
      schema: z.object({
        agents: z.array(z.enum(SPECIALIST_IDS)),
        reasoning: z
          .string()
          .describe("One short sentence explaining the routing choice."),
      }),
      system: `You route user requests for a Singapore pet-care assistant. Pick zero or more specialist agents:
- food: diet, nutrition, product recommendations
- grooming: groomers, bathing, nail trims, coat care
- vet: symptoms, illness, triage, emergency guidance, vet search
- meme: ONLY when the user wants a funny meme/joke image AND a photo is attached
- booking: appointment/reservation when the user wants to book at a groomer or vet

Rules:
- Prefer zero specialists for simple general care tips — those stay with the general assistant only.
- Pick multiple specialists only when the request clearly spans domains.
- Never pick meme without an attached photo.
- Pick booking when booking intent is clear and there is place context or a named place.`,
      prompt: `User message: ${args.message}
Photo attached: ${args.hasImage}
Recent places in chat: ${args.recentPlacesCount}
Pet: ${args.petSummary}`,
    });

    let agents = object.agents;
    if (!args.hasImage) {
      agents = agents.filter((id) => id !== "meme");
    }

    return { agents, reasoning: object.reasoning };
  } catch {
    const agents = routeWithHeuristics(args);
    return {
      agents,
      reasoning:
        agents.length > 0
          ? "Matched your request to specialist agents."
          : "Handling this with general pet-care guidance.",
    };
  }
}

async function runSpecialist(
  agentId: SpecialistAgentId,
  args: {
    message: string;
    imageBlob?: Blob | null;
    lat?: number;
    lng?: number;
    sessionUser: { id: string; email?: string };
    recentPlaces: { id: string; name: string }[];
  },
) {
  switch (agentId) {
    case "food":
      return runFoodAgent({ message: args.message, imageBlob: args.imageBlob });
    case "grooming":
      return runGroomingAgent({
        message: args.message,
        lat: args.lat,
        lng: args.lng,
      });
    case "vet":
      return runVetAgent({
        message: args.message,
        imageBlob: args.imageBlob,
        lat: args.lat,
        lng: args.lng,
      });
    case "meme":
      if (!args.imageBlob) {
        return {
          error:
            "Attach a pet photo if you'd like a meme — I need an image to work with.",
        };
      }
      return runMemeAgent({
        message: args.message,
        imageBlob: args.imageBlob,
      });
    case "booking":
      return runBookingAgent({
        message: args.message,
        sessionUser: args.sessionUser,
        recentPlaces: args.recentPlaces,
      });
    default:
      return { error: "Unknown specialist agent." };
  }
}

export async function orchestrateAssistantRequest(args: {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  imageBlob?: Blob | null;
  lat?: number;
  lng?: number;
  recentPlaces?: { id: string; name: string }[];
  sessionUser: { id: string; email?: string };
}): Promise<OrchestrateResult> {
  const message = args.message.trim();
  if (!message && !args.imageBlob) {
    return { steps: [], messages: [], error: "Empty message." };
  }

  const { pet } = await getPetCareContext();
  const petSummary = buildPetProfilePrompt(pet);
  const recentPlaces = args.recentPlaces ?? [];
  const hasImage = Boolean(args.imageBlob);

  const { agents, reasoning } = await routeToSpecialists({
    message: message || "Help with my pet.",
    hasImage,
    recentPlacesCount: recentPlaces.length,
    petSummary,
  });

  const steps: DelegationStepDTO[] = [
    {
      agentId: "general",
      label: getAgentLabel("general") ?? "Pet assistant",
      status: "done",
      reasoning,
      tools: agents.length > 0 ? [...GENERAL_ORCHESTRATOR_TOOLS] : ["plan"],
    },
  ];

  const messages: OrchestrationMessage[] = [];

  if (agents.length === 0) {
    steps[0].status = "running";

    const result = await runGeneralAgent({
      message: message || "Share a helpful care tip for my pet today.",
      history: args.history,
    });

    steps[0].status = result.error ? "error" : "done";

    const { content, data } = agentResultToMessageContent("general", result);
    messages.push({
      agentId: "general",
      content,
      data: { ...data, delegationSteps: steps },
    });

    return { steps, messages };
  }

  for (const agentId of agents) {
    steps.push({
      agentId,
      label: getAgentLabel(agentId) ?? agentId,
      status: "running",
    });
  }

  const results = await Promise.all(
    agents.map(async (agentId, index) => {
      const result = await runSpecialist(agentId, {
        message,
        imageBlob: args.imageBlob,
        lat: args.lat,
        lng: args.lng,
        sessionUser: args.sessionUser,
        recentPlaces,
      });

      const stepIndex = index + 1;
      const step = steps[stepIndex];
      if (step) {
        step.status = result.error ? "error" : "done";
        step.tools = result.toolsUsed;
      }

      const { content, data } = agentResultToMessageContent(agentId, result);
      return { agentId, content, data };
    }),
  );

  for (const [i, msg] of results.entries()) {
    messages.push({
      agentId: msg.agentId,
      content: msg.content,
      data: i === 0 ? { ...msg.data, delegationSteps: steps } : msg.data,
    });
  }

  return { steps, messages };
}
