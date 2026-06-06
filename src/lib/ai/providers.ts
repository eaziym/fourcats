import { gateway } from "ai";

export interface ModelConfig {
  id: string;
  label: string;
}

export const models: ModelConfig[] = [
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

export const DEFAULT_MODEL = "openai/gpt-4o-mini";

export function getModel(modelId: string) {
  const config = models.find((m) => m.id === modelId);
  if (!config) {
    throw new Error(
      `Unknown model: ${modelId}. Available: ${models.map((m) => m.id).join(", ")}`,
    );
  }
  return gateway(modelId);
}

export const SYSTEM_PROMPT = `You are a friendly, knowledgeable AI pet care assistant for "Little Lovely Pets", a pet care service based in Singapore. You specialize in:
- Pet health, nutrition, and grooming advice
- Local Singapore pet services and recommendations
- HDB pet regulations and guidelines
- Breed-specific care tips

Keep responses concise but helpful. Use a warm, caring tone. When recommending services, mention their proximity if relevant.`;
