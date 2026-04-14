import { describe, expect, it } from "vitest";
import { defaultSpeedTierFilters, filterSpeedTiers } from "./filter";
import type { SpeedTier } from "./types";

const tiers: SpeedTier[] = [
  {
    speed: 308,
    pokemon: [
      {
        combinationId: "pokemon:1|nature:positive|evs:252|ability:sand-rush|item:none",
        id: 1,
        slug: "excadrill",
        pokedexNo: 530,
        name: "Excadrill",
        sprite: null,
        spread: { nature: "positive", evs: 252, ivs: 31, level: 50, rawSpeed: 154 },
        effects: [
          {
            kind: "ability",
            source: "sand-rush",
            label: "Sand Rush",
            multiplier: 2,
            condition: "sand",
          },
        ],
        finalSpeed: 308,
      },
    ],
  },
  {
    speed: 250,
    pokemon: [
      {
        combinationId: "pokemon:3|nature:positive|evs:252|ability:none|item:choice-scarf",
        id: 3,
        slug: "pikachu",
        pokedexNo: 25,
        name: "Pikachu",
        sprite: null,
        spread: { nature: "positive", evs: 252, ivs: 31, level: 50, rawSpeed: 167 },
        effects: [
          {
            kind: "item",
            source: "choice-scarf",
            label: "Choice Scarf",
            multiplier: 1.5,
          },
        ],
        finalSpeed: 250,
      },
    ],
  },
  {
    speed: 222,
    pokemon: [
      {
        combinationId: "pokemon:2|nature:neutral|evs:0|ability:none|item:none",
        id: 2,
        slug: "aerodactyl",
        pokedexNo: 142,
        name: "Aerodactyl",
        sprite: null,
        spread: { nature: "neutral", evs: 0, ivs: 31, level: 50, rawSpeed: 222 },
        effects: [],
        finalSpeed: 222,
      },
    ],
  },
];

describe("filterSpeedTiers", () => {
  it("keeps matching setup rows and omits empty groups", () => {
    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, boosts: [], search: "drill" }),
    ).toStrictEqual([
      {
        speed: tiers[0].speed,
        pokemon: [
          {
            ...tiers[0].pokemon[0],
            effects: [
              {
                kind: "ability",
                source: "sand-rush",
                label: "Sand Rush",
                multiplier: 2,
              },
            ],
            members: [
              {
                id: 1,
                slug: "excadrill",
                pokedexNo: 530,
                name: "Excadrill",
                sprite: null,
              },
            ],
            sourceEffects: tiers[0].pokemon[0].effects,
          },
        ],
      },
    ]);
  });

  it("preserves group order from input", () => {
    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, boosts: [] }).map((tier) => tier.speed),
    ).toStrictEqual([308, 250, 222]);
  });

  it("shows unboosted rows by default", () => {
    expect(
      filterSpeedTiers(tiers, defaultSpeedTierFilters).map((tier) => tier.speed),
    ).toStrictEqual([222]);
  });

  it("filters unboosted rows with the none boost option", () => {
    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, boosts: ["none"] }).map(
        (tier) => tier.speed,
      ),
    ).toStrictEqual([222]);
  });

  it("filters ability and item boosts with OR semantics", () => {
    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, boosts: ["ability"] }).map(
        (tier) => tier.speed,
      ),
    ).toStrictEqual([308]);

    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, boosts: ["ability", "item"] }).map(
        (tier) => tier.speed,
      ),
    ).toStrictEqual([308, 250]);
  });

  it("filters by effect kind, weather, nature, and stat points", () => {
    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        boosts: ["ability"],
        weather: "sand",
        nature: "positive",
        statPoints: 32,
      }).map((tier) => tier.speed),
    ).toStrictEqual([308]);

    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        boosts: ["item"],
      }).map((tier) => tier.speed),
    ).toStrictEqual([250]);
  });

  it("matches search against slug", () => {
    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, boosts: [], search: "aero" }).map(
        (tier) => tier.speed,
      ),
    ).toStrictEqual([222]);
  });
});
