/** Extract tool names from a Vercel AI SDK generateText result. */
export function extractToolsFromGenerateText(result: {
  toolCalls?: { toolName?: string }[];
  steps?: { toolCalls?: { toolName?: string }[] }[];
}): string[] {
  const names = new Set<string>();
  for (const tc of result.toolCalls ?? []) {
    if (tc.toolName) names.add(tc.toolName);
  }
  for (const step of result.steps ?? []) {
    for (const tc of step.toolCalls ?? []) {
      if (tc.toolName) names.add(tc.toolName);
    }
  }
  return [...names];
}

/** Extract tool names from OpenAI Agents SDK run items. */
export function extractToolsFromAgentItems(
  newItems: { type: string; name?: string; rawItem?: unknown }[],
): string[] {
  const names = new Set<string>();
  for (const item of newItems) {
    if (!item.type.includes("tool_call") || item.type.includes("output")) {
      continue;
    }
    let name = item.name;
    if (!name && item.rawItem && typeof item.rawItem === "object") {
      const raw = item.rawItem as { name?: string };
      name = raw.name;
    }
    if (name) names.add(name);
  }
  return [...names];
}
