import { describe, expect, it } from "vitest";
import { mapSourceFilesToManifestEntries, sourceFilenameToSlug } from "../filename-to-slug";
import type { SpritePokemonIdentity, SpriteSourceFile } from "../types";

const pokemon: SpritePokemonIdentity[] = [
  { pokedexNumber: 128, slug: "tauros-paldea-combat-breed", name: "Tauros Paldea Combat Breed" },
  { pokedexNumber: 479, slug: "rotom", name: "Rotom" },
  { pokedexNumber: 479, slug: "rotom-heat", name: "Rotom Heat" },
  { pokedexNumber: 479, slug: "rotom-wash", name: "Rotom Wash" },
  { pokedexNumber: 670, slug: "floette-eternal", name: "Floette Eternal" },
  { pokedexNumber: 678, slug: "meowstic-male", name: "Meowstic" },
  { pokedexNumber: 678, slug: "meowstic-mega", name: "Mega Meowstic" },
  { pokedexNumber: 711, slug: "gourgeist-average", name: "Gourgeist Medium Variety" },
  { pokedexNumber: 711, slug: "gourgeist-small", name: "Gourgeist Small Variety" },
  { pokedexNumber: 711, slug: "gourgeist-large", name: "Gourgeist Large Variety" },
  { pokedexNumber: 711, slug: "gourgeist-super", name: "Gourgeist Jumbo Variety" },
  { pokedexNumber: 745, slug: "lycanroc-midday", name: "Lycanroc" },
  { pokedexNumber: 745, slug: "lycanroc-midnight", name: "Lycanroc" },
  { pokedexNumber: 745, slug: "lycanroc-dusk", name: "Lycanroc" },
  { pokedexNumber: 869, slug: "alcremie", name: "Alcremie" },
  { pokedexNumber: 902, slug: "basculegion-male", name: "Basculegion Male" },
  { pokedexNumber: 902, slug: "basculegion-female", name: "Basculegion Female" },
  { pokedexNumber: 925, slug: "maushold-family-of-four", name: "Maushold Family of Four" },
  { pokedexNumber: 925, slug: "maushold-family-of-three", name: "Maushold Family of Three" },
];

describe("sourceFilenameToSlug", () => {
  it("normalizes source filenames to internal Pokemon slugs", () => {
    expect(sourceFilenameToSlug("Menu_CP_0479.png", pokemon)).toBe("rotom");
    expect(sourceFilenameToSlug("Menu_CP_0479-Heat.png", pokemon)).toBe("rotom-heat");
    expect(sourceFilenameToSlug("Menu_CP_0479-Wash.png", pokemon)).toBe("rotom-wash");
    expect(sourceFilenameToSlug("Menu_CP_0128-Paldea_Combat.png", pokemon)).toBe(
      "tauros-paldea-combat-breed",
    );
    expect(sourceFilenameToSlug("Menu_CP_0678.png", pokemon)).toBe("meowstic-male");
    expect(sourceFilenameToSlug("Menu_CP_0711.png", pokemon)).toBe("gourgeist-average");
    expect(sourceFilenameToSlug("Menu_CP_0711-Jumbo.png", pokemon)).toBe("gourgeist-super");
    expect(sourceFilenameToSlug("Menu_CP_0745.png", pokemon)).toBe("lycanroc-midday");
    expect(sourceFilenameToSlug("Menu_CP_0745-Dusk.png", pokemon)).toBe("lycanroc-dusk");
    expect(sourceFilenameToSlug("Menu_CP_0902.png", pokemon)).toBe("basculegion-male");
    expect(sourceFilenameToSlug("Menu_CP_0902-Female.png", pokemon)).toBe("basculegion-female");
    expect(sourceFilenameToSlug("Menu_CP_0925.png", pokemon)).toBe("maushold-family-of-four");
    expect(sourceFilenameToSlug("Menu_CP_0925-Three.png", pokemon)).toBe(
      "maushold-family-of-three",
    );
  });

  it("skips cosmetic source files", () => {
    expect(sourceFilenameToSlug("Menu_CP_0869-Ruby_Cream.png", pokemon)).toBeNull();
  });
});

describe("mapSourceFilesToManifestEntries", () => {
  it("writes slug filenames and source trace metadata", () => {
    const sourceFiles: SpriteSourceFile[] = [
      sourceFile("File:Menu CP 0479-Heat.png", "Menu_CP_0479-Heat.png"),
      sourceFile("File:Menu CP 0479-Wash.png", "Menu_CP_0479-Wash.png"),
    ];

    expect(mapSourceFilesToManifestEntries(sourceFiles, pokemon).entries).toStrictEqual([
      {
        slug: "rotom-heat",
        filename: "rotom-heat.png",
        sourceFilename: "Menu_CP_0479-Heat.png",
        title: "File:Menu CP 0479-Heat.png",
        sourceUrl: "https://archives.example/Menu_CP_0479-Heat.png",
        size: 123,
      },
      {
        slug: "rotom-wash",
        filename: "rotom-wash.png",
        sourceFilename: "Menu_CP_0479-Wash.png",
        title: "File:Menu CP 0479-Wash.png",
        sourceUrl: "https://archives.example/Menu_CP_0479-Wash.png",
        size: 123,
      },
    ]);
  });
});

function sourceFile(title: string, sourceFilename: string): SpriteSourceFile {
  return {
    title,
    sourceFilename,
    sourceUrl: `https://archives.example/${sourceFilename}`,
    size: 123,
  };
}
