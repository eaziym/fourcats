/** Resolve a place id from a free-text message against known candidates. */
export function matchPlaceFromMessage(
  message: string,
  candidates: { id: string; name: string }[],
): string | null {
  const lower = message.toLowerCase();
  if (candidates.length === 0) return null;

  // Exact or substring name match (longest name first to avoid partial hits).
  const sorted = [...candidates].sort((a, b) => b.name.length - a.name.length);
  for (const c of sorted) {
    const name = c.name.toLowerCase();
    if (lower.includes(name)) return c.id;
  }

  // First significant token overlap (e.g. "heartland paws" in "book at Heartland").
  for (const c of sorted) {
    const tokens = c.name
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 3);
    if (tokens.some((t) => lower.includes(t))) return c.id;
  }

  // Single candidate in recent context — assume that's the target.
  if (candidates.length === 1) return candidates[0].id;

  return null;
}
