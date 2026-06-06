import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { MemeBaselineTemplate } from "@/lib/agents/meme-baseline-catalog";
import { downscaleForVisionPreview } from "@/lib/image/downscale-for-vision";

export type { MemeBaselineTemplate } from "@/lib/agents/meme-baseline-catalog";
export {
  formatMemeBaselineCatalogForAgent,
  resolveMemeStylePrompt,
} from "@/lib/agents/meme-baseline-catalog";

const BASELINE_DIR = path.join(process.cwd(), "assets/meme-baselines");

export const loadMemeBaselineCatalog = cache(
  async (): Promise<MemeBaselineTemplate[]> => {
    const raw = await readFile(
      path.join(BASELINE_DIR, "manifest.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as { templates: MemeBaselineTemplate[] };
    return parsed.templates;
  },
);

export async function getMemeBaselinePreviewDataUrl(
  template: MemeBaselineTemplate,
): Promise<string> {
  const buf = await readFile(path.join(BASELINE_DIR, template.file));
  const preview = await downscaleForVisionPreview(buf);
  return `data:image/jpeg;base64,${preview.toString("base64")}`;
}

export async function buildMemeBaselineVisionParts(
  catalog: MemeBaselineTemplate[],
): Promise<
  Array<
    { type: "input_text"; text: string } | { type: "input_image"; image: string }
  >
> {
  const parts: (
    | { type: "input_text"; text: string }
    | { type: "input_image"; image: string }
  )[] = [
    {
      type: "input_text",
      text: "Reference meme templates (match layout and vibe; use the user's pet instead of the animals shown):",
    },
  ];

  for (const template of catalog) {
    parts.push({
      type: "input_text",
      text: `Template "${template.id}" (${template.name}):`,
    });
    parts.push({
      type: "input_image",
      image: await getMemeBaselinePreviewDataUrl(template),
    });
  }

  return parts;
}
