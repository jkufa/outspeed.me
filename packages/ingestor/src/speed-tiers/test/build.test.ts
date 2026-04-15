import { describe, expect, it } from "vitest";
import { buildSpeedTierOutputs } from "../build";
import type { PokedexPokemon } from "../types";

function pokemon(overrides: Partial<PokedexPokemon> = {}): PokedexPokemon {
  return {
    id: 1,
    slug: "whimsicott",
    pokedexNumber: 547,
    name: "Whimsicott",
    abilities: [],
    stats: { speed: 116 },
    ...overrides,
  };
}

describe("buildSpeedTierOutputs", () => {
  it("uses uploaded sprite blob URLs when a blob manifest entry exists", () => {
    const outputs = buildSpeedTierOutputs([pokemon()], {
      spriteBlobManifest: [
        {
          slug: "whimsicott",
          filename: "whimsicott.png",
          sourceFilename: "Menu_CP_0547.png",
          title: "File:Menu CP 0547.png",
          sourceUrl: "https://archives.bulbagarden.net/media/upload/6/69/Menu_CP_0547.png",
          sha256: "abc123",
          blobUrl:
            "https://dgap4qvlmepfoz1h.public.blob.vercel-storage.com/champions-menu-sprites/v1/whimsicott.png",
          blobPath: "champions-menu-sprites/v1/whimsicott.png",
        },
      ],
    });

    const rows = outputs.tiers.flatMap((tier) => tier.pokemon);

    expect(rows.every((row) => row.sprite)).toBe(true);
    expect(rows[0]?.sprite).toStrictEqual({
      filename: "whimsicott.png",
      path: "https://dgap4qvlmepfoz1h.public.blob.vercel-storage.com/champions-menu-sprites/v1/whimsicott.png",
      sourceUrl: "https://archives.bulbagarden.net/media/upload/6/69/Menu_CP_0547.png",
    });
    expect(outputs.spriteMappingErrors).toStrictEqual([]);
  });

  it("reports missing blob URLs when only extracted source sprites exist", () => {
    const outputs = buildSpeedTierOutputs([pokemon()], {
      spriteSourceManifest: [
        {
          slug: "whimsicott",
          filename: "whimsicott.png",
          sourceFilename: "Menu_CP_0547.png",
          title: "File:Menu CP 0547.png",
          sourceUrl: "https://archives.bulbagarden.net/media/upload/6/69/Menu_CP_0547.png",
          sha256: "abc123",
        },
      ],
    });

    expect(outputs.tiers.flatMap((tier) => tier.pokemon).every((row) => row.sprite === null)).toBe(
      true,
    );
    expect(outputs.spriteMappingErrors).toStrictEqual([
      {
        pokedexNo: 547,
        slug: "whimsicott",
        name: "Whimsicott",
        expectedFilename: "whimsicott.png",
        reason: "missing_blob_url",
      },
    ]);
  });
});
