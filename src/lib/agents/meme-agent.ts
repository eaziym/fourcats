import "server-only";

import { Agent, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import {
  formatMemeBaselineCatalogForAgent,
  type MemeBaselineTemplate,
  resolveMemeStylePrompt,
} from "@/lib/agents/meme-baseline-catalog";
import { getAgentModel } from "@/lib/ai/providers";

/** Mutable run context: pet bytes from the route; tool may set `generatedMemeDataUrl` so the model never sees huge base64 in tool output. */
export type MemeAgentContext = {
  petImage: Buffer;
  petMediaType: string;
  baselineCatalog: MemeBaselineTemplate[];
  /** Set by `generate_pet_meme` on success; read by the API route, not echoed to the model. */
  generatedMemeDataUrl?: string;
};

const MEME_IMAGE_MODEL = "gpt-image-1" as const;

function extForMediaType(mediaType: string): string {
  if (mediaType === "image/jpeg" || mediaType === "image/jpg") return "jpg";
  if (mediaType === "image/webp") return "webp";
  return "png";
}

function getImageClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: key });
}

function buildMemeAgentInstructions(catalog: MemeBaselineTemplate[]): string {
  const templateList = formatMemeBaselineCatalogForAgent(catalog);
  const templateIds = catalog.map((t) => t.id).join(", ");

  return `You are the Meme agent for a pet-care app. Users upload a photo of their pet and describe what kind of meme they want (or you suggest something funny but kind).

You see the user's pet preview plus reference meme templates. Each reference shows layout, typography, and vibe — always substitute the user's pet for the animal in the reference. The generate_pet_meme tool uses the original full-resolution pet photo from the server.

Available template_id values: ${templateIds}.
${templateList}

Pick the template that best matches the user's request (or the funniest fit for their pet's expression). Write a short caption that fits the template's format, then call generate_pet_meme once with that template_id and caption.

After the tool returns, read the JSON: if ok is false, apologize briefly and quote the error. If ok is true, the image is already saved server-side — give a short cheerful message only (never paste base64, data URLs, or long strings from the tool).`;
}

function createGeneratePetMemeTool(catalog: MemeBaselineTemplate[]) {
  const templateIds = catalog.map((t) => t.id);
  if (templateIds.length === 0) {
    throw new Error("Meme baseline catalog is empty");
  }

  const templateIdSchema =
    templateIds.length === 1
      ? z.literal(templateIds[0])
      : z.enum(templateIds as [string, string, ...string[]]);

  return tool({
    name: "generate_pet_meme",
    description:
      "Generate a single meme image from the user's uploaded pet photo using a baseline template layout. Call once you have a template_id and caption.",
    parameters: z.object({
      template_id: templateIdSchema.describe(
        "Baseline meme template to match (layout, typography, vibe).",
      ),
      caption: z
        .string()
        .describe(
          "Short meme caption or punchline (may be drawn as text on the image). Match the template's text format.",
        ),
    }),
    execute: async (input, runContext) => {
      const ctx = runContext?.context as MemeAgentContext | undefined;
      if (!ctx?.petImage?.length) {
        return JSON.stringify({
          ok: false,
          error: "Missing pet image. Upload a photo with your message.",
        });
      }

      const catalog = ctx.baselineCatalog;
      const template = catalog.find((t) => t.id === input.template_id);
      const stylePrompt =
        resolveMemeStylePrompt(catalog, input.template_id) ??
        template?.stylePrompt ??
        "classic internet meme";

      const imagePrompt = [
        "Edit this pet photo into one polished, shareable meme image.",
        `Match the "${input.template_id}" meme template layout and vibe: ${stylePrompt}`,
        `Caption / joke: ${input.caption.trim()}.`,
        "Keep the same animal recognizable (face, markings, breed cues).",
        "Add readable meme typography if the template uses text. Use tasteful humor; avoid hateful or graphic content.",
      ].join(" ");

      try {
        const client = getImageClient();
        const filename = `pet.${extForMediaType(ctx.petMediaType)}`;
        const bytes = new Uint8Array(ctx.petImage);
        const file = new File([bytes], filename, {
          type: ctx.petMediaType,
        });

        const res = await client.images.edit({
          model: MEME_IMAGE_MODEL,
          image: file,
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          stream: false,
          input_fidelity: "high",
        });

        const b64 = res.data?.[0]?.b64_json;
        if (!b64) {
          return JSON.stringify({
            ok: false,
            error: "Image API returned no image data.",
          });
        }

        const fmt = res.output_format ?? "png";
        const mime =
          fmt === "jpeg"
            ? "image/jpeg"
            : fmt === "webp"
              ? "image/webp"
              : "image/png";
        const memeImageDataUrl = `data:${mime};base64,${b64}`;
        ctx.generatedMemeDataUrl = memeImageDataUrl;

        return JSON.stringify({ ok: true, template_id: input.template_id });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Image generation failed";
        return JSON.stringify({ ok: false, error: message });
      }
    },
  });
}

export function createMemeAgent(catalog: MemeBaselineTemplate[]) {
  return new Agent<MemeAgentContext>({
    name: "Meme agent",
    model: getAgentModel(),
    instructions: buildMemeAgentInstructions(catalog),
    tools: [createGeneratePetMemeTool(catalog)],
  });
}
