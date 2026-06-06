export type MemeBaselineTemplate = {
  id: string;
  name: string;
  file: string;
  description: string;
  stylePrompt: string;
  captionHints?: string[];
};

export function resolveMemeStylePrompt(
  catalog: MemeBaselineTemplate[],
  templateId: string,
): string | undefined {
  return catalog.find((t) => t.id === templateId)?.stylePrompt;
}

export function formatMemeBaselineCatalogForAgent(
  catalog: MemeBaselineTemplate[],
): string {
  return catalog
    .map((t) => {
      const hints = t.captionHints?.length
        ? ` Caption ideas: ${t.captionHints.join("; ")}.`
        : "";
      return `- ${t.id} (${t.name}): ${t.description}${hints}`;
    })
    .join("\n");
}
