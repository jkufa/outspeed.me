import { describe, expect, it } from "vitest";
import { groupSpeedTierRows } from "./display";
import type { SpeedTier, SpeedTierPokemon } from "./types";

function pokemon(overrides: Partial<SpeedTierPokemon> = {}): SpeedTierPokemon {
  return {
    combinationId: "pokemon:1|nature:neutral|evs:0|ability:none|item:none",
    id: 1,
    slug: "rotom",
    pokedexNo: 479,
    name: "Rotom",
    sprite: null,
    spread: { nature: "neutral", evs: 0, ivs: 31, level: 50, rawSpeed: 120 },
    effects: [],
    finalSpeed: 120,
    ...overrides,
  };
}

describe("groupSpeedTierRows", () => {
  it("groups same-dex same-speed forms and preserves each sprite/name", () => {
    const tiers: SpeedTier[] = [
      {
        speed: 120,
        pokemon: [
          pokemon({
            id: 1,
            slug: "rotom-wash",
            name: "Rotom Wash",
            sprite: {
              filename: "rotom-wash.png",
              path: "https://example.com/rotom-wash.png",
              sourceUrl: "https://archives.example/rotom-wash.png",
            },
          }),
          pokemon({
            id: 2,
            slug: "rotom-heat",
            name: "Rotom Heat",
            sprite: {
              filename: "rotom-heat.png",
              path: "https://example.com/rotom-heat.png",
              sourceUrl: "https://archives.example/rotom-heat.png",
            },
          }),
        ],
      },
    ];

    expect(groupSpeedTierRows(tiers)[0].pokemon).toStrictEqual([
      {
        ...tiers[0].pokemon[0],
        name: "Rotom Wash, Rotom Heat",
        members: [
          {
            id: 1,
            slug: "rotom-wash",
            pokedexNo: 479,
            name: "Rotom Wash",
            sprite: tiers[0].pokemon[0].sprite,
          },
          {
            id: 2,
            slug: "rotom-heat",
            pokedexNo: 479,
            name: "Rotom Heat",
            sprite: tiers[0].pokemon[1].sprite,
          },
        ],
        effects: [],
        sourceEffects: [],
      },
    ]);
  });

  it("merges same-multiplier speed abilities into one slash chip", () => {
    const tiers: SpeedTier[] = [
      {
        speed: 200,
        pokemon: [
          pokemon({
            effects: [
              {
                kind: "ability",
                source: "slush-rush",
                label: "Slush Rush",
                multiplier: 2,
                condition: "snow",
              },
            ],
            finalSpeed: 200,
          }),
          pokemon({
            combinationId: "pokemon:1|nature:neutral|evs:0|ability:swift-swim|item:none",
            effects: [
              {
                kind: "ability",
                source: "swift-swim",
                label: "Swift Swim",
                multiplier: 2,
                condition: "rain",
              },
            ],
            finalSpeed: 200,
          }),
        ],
      },
    ];

    expect(groupSpeedTierRows(tiers)[0].pokemon[0].effects).toStrictEqual([
      {
        kind: "ability",
        source: "slush-rush/swift-swim",
        label: "Slush Rush/Swift Swim",
        multiplier: 2,
      },
    ]);
    expect(groupSpeedTierRows(tiers)[0].pokemon[0].sourceEffects).toHaveLength(2);
  });

  it("does not group custom builds into matching built-in rows", () => {
    const builtIn = pokemon();
    const custom = pokemon({
      combinationId: "custom:build-1|species:1|nature:neutral|sp:0|ability:none|item:none",
      source: {
        kind: "custom-build",
        buildId: "build-1",
        origin: "manual",
        storageSchemaVersion: 1,
        label: "My Rotom",
      },
    });

    const grouped = groupSpeedTierRows([{ speed: 120, pokemon: [builtIn, custom] }]);

    expect(grouped[0].pokemon).toHaveLength(2);
    expect(grouped[0].pokemon.map((row) => row.source?.kind ?? "built-in")).toStrictEqual([
      "built-in",
      "custom-build",
    ]);
  });
});
