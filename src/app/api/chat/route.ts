import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { DEFAULT_MODEL, getModel, SYSTEM_PROMPT } from "@/lib/ai/providers";

export async function POST(req: Request) {
  const { messages, modelId } = await req.json();

  const result = streamText({
    model: getModel(modelId ?? DEFAULT_MODEL),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  });
}
