import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import {
  formatMemeBaselineCatalogForAgent,
  type MemeBaselineTemplate,
  resolveMemeStylePrompt,
} from "./meme-baseline-catalog";

async function loadManifestCatalog(): Promise<MemeBaselineTemplate[]> {
  const raw = await readFile(
    path.join(process.cwd(), "assets/meme-baselines/manifest.json"),
    "utf8",
  );
  const parsed = JSON.parse(raw) as { templates: MemeBaselineTemplate[] };
  return parsed.templates;
}

describe("meme baseline manifest", () => {
  it("lists the four uploaded baseline templates", async () => {
    const catalog = await loadManifestCatalog();
    assert.equal(catalog.length, 4);
    assert.deepEqual(
      catalog.map((t) => t.file),
      [
        "cat-standing.jpg",
        "chihuahua-meme.jpg",
        "hilarious-chihuahua-dog-meme.jpeg",
        "swag-cat-swagbilli-cutecat-cats-cat-swag-ok-yooo-yo.gif",
      ],
    );
  });
});

describe("resolveMemeStylePrompt", () => {
  it("returns the style prompt for a known template id", async () => {
    const catalog = await loadManifestCatalog();
    const prompt = resolveMemeStylePrompt(catalog, "dog-in-me");
    assert.match(prompt ?? "", /the dog:/i);
  });
});

describe("formatMemeBaselineCatalogForAgent", () => {
  it("includes template ids and descriptions for the agent prompt", async () => {
    const catalog = await loadManifestCatalog();
    const text = formatMemeBaselineCatalogForAgent(catalog);
    assert.match(text, /standing-cat/);
    assert.match(text, /thinking-dog/);
    assert.match(text, /dog-in-me/);
    assert.match(text, /swag-cat/);
  });
});
