import "server-only";

import { Agent, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";

/** Mutable run context: pet bytes from the route; tool may set `generatedMemeDataUrl` so the model never sees huge base64 in tool output. */
export type MemeAgentContext = {
  petImage: Buffer;
  petMediaType: string;
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

const generatePetMeme = tool({
  name: "generate_pet_meme",
  description:
    "Generate a single meme image from the user's uploaded pet photo. Call this once you understand the desired joke/caption and style. Uses the pet image from server context.",
  parameters: z.object({
    caption: z
      .string()
      .describe(
        "Short meme caption or punchline (may be drawn as text on the image).",
      ),
    meme_style: z
      .string()
      .optional()
      .describe(
        "Visual style, e.g. classic impact font top/bottom, wholesome, absurd, drake format, etc.",
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

    const style = input.meme_style?.trim() || "classic internet meme";
    const imagePrompt = [
      "Edit this pet photo into one polished, shareable meme image.",
      `Meme style: ${style}.`,
      `Caption / joke: ${input.caption.trim()}.`,
      "Keep the same animal recognizable (face, markings, breed cues).",
      "Add readable meme typography if it fits the style. Use tasteful humor; avoid hateful or graphic content.",
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

      return JSON.stringify({ ok: true });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Image generation failed";
      return JSON.stringify({ ok: false, error: message });
    }
  },
});

export const memeAgent = new Agent<MemeAgentContext>({
  name: "Meme agent",
  model: "gpt-4o",
  instructions: `You are the Meme agent for a pet-care app. Users upload a photo of their pet and describe what kind of meme they want (or you suggest something funny but kind).

You see a downscaled preview of their photo plus their text. The generate_pet_meme tool always uses the original full-resolution image from the server, so captions and style should match what you see in the preview.

Always use the generate_pet_meme tool to produce the image. Pick a concise caption and an appropriate meme_style before calling the tool.

After the tool returns, read the JSON: if ok is false, apologize briefly and quote the error. If ok is true, the image is already saved server-side — give a short cheerful message only (never paste base64, data URLs, or long strings from the tool).`,
  tools: [generatePetMeme],
});
