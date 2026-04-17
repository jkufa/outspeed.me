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
  {
    speed: 180,
    pokemon: [
      {
        combinationId: "pokemon:4|nature:neutral|evs:0|field:tailwind",
        id: 4,
        slug: "charizard",
        pokedexNo: 6,
        name: "Charizard",
        sprite: null,
        spread: { nature: "neutral", evs: 0, ivs: 31, level: 50, rawSpeed: 90 },
        effects: [
          {
            kind: "field",
            source: "tailwind",
            label: "Tailwind",
            multiplier: 2,
            condition: "tailwind",
          },
        ],
        finalSpeed: 180,
      },
    ],
  },
];

describe("filterSpeedTiers", () => {
  it("keeps matching setup rows and omits empty groups", () => {
    expect(filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, pokemon: [530] })).toStrictEqual([
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
      filterSpeedTiers(tiers, defaultSpeedTierFilters).map((tier) => tier.speed),
    ).toStrictEqual([308, 222, 180]);
  });

  it("hides item-boosted rows by default", () => {
    expect(
      filterSpeedTiers(tiers, defaultSpeedTierFilters).map((tier) => tier.speed),
    ).toStrictEqual([308, 222, 180]);
  });

  it("includes item-boosted rows when selected", () => {
    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, items: ["choice-scarf"] }).map(
        (tier) => tier.speed,
      ),
    ).toStrictEqual([308, 250, 222, 180]);
  });

  it("filters by field condition and spreads", () => {
    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        fieldConditions: ["sand"],
        spreads: ["positive-252"],
      }).map((tier) => tier.speed),
    ).toStrictEqual([308]);
  });

  it("filters field conditions with OR semantics", () => {
    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        fieldConditions: ["sand", "tailwind"],
      }).map((tier) => tier.speed),
    ).toStrictEqual([308, 222, 180]);
  });

  it("keeps rows without field-condition boosts when field conditions are selected", () => {
    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        fieldConditions: ["sand"],
      }).map((tier) => tier.speed),
    ).toStrictEqual([308, 222]);
  });

  it("filters to selected species by pokedex number", () => {
    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        pokemon: [25, 142],
      }).map((tier) => tier.speed),
    ).toStrictEqual([222]);
  });

  it("keeps non-item rows while matching selected item boosts", () => {
    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        items: ["choice-scarf"],
        pokemon: [25, 142],
      }).map((tier) => tier.speed),
    ).toStrictEqual([250, 222]);
  });
});
