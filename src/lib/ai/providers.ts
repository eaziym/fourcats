import { gateway } from "ai";

/** Vercel AI gateway id (orchestrator routing, general agent, /api/chat). */
export const DEFAULT_CHAT_MODEL = "openai/gpt-5.5";

/** OpenAI Agents SDK id (food, grooming, vet, booking, meme agents). */
export const DEFAULT_AGENT_MODEL = "gpt-5.5";

export function getModel() {
  const modelId = process.env.AI_MODEL ?? DEFAULT_CHAT_MODEL;
  return gateway(modelId);
}

export function getAgentModel(): string {
  return process.env.AI_AGENT_MODEL ?? DEFAULT_AGENT_MODEL;
}

export const SYSTEM_PROMPT = `You are a friendly, knowledgeable AI pet care assistant for "Little Lovely Pets", a pet care service based in Singapore. You specialize in:
- Pet health, nutrition, and grooming advice
- Local Singapore pet services and recommendations
- HDB pet regulations and guidelines
- Breed-specific care tips

Keep responses concise but helpful. Use a warm, caring tone. When recommending services, mention their proximity if relevant.`;
