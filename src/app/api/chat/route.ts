import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { buildAssistantSystemPrompt, buildPetTools } from "@/lib/ai/pet-tools";
import { getModel, SYSTEM_PROMPT } from "@/lib/ai/providers";
import {
  buildPetProfilePrompt,
  buildUserSettingsPrompt,
  speciesToPetType,
} from "@/lib/pet-data/format";
import { postalToLatLng } from "@/lib/pet-data/search";
import { getPetCareContext } from "@/lib/pet-queries";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const { pet, settings } = await getPetCareContext();
  const system = buildAssistantSystemPrompt(
    SYSTEM_PROMPT,
    buildPetProfilePrompt(pet),
    buildUserSettingsPrompt(settings),
  );
  const petLatLng = pet?.locationPostalCode
    ? postalToLatLng(pet.locationPostalCode)
    : null;

  const result = streamText({
    model: getModel(),
    system,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: buildPetTools({
      defaultPetType: speciesToPetType(pet?.species),
      petLatLng,
    }),
  });

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  });
}
