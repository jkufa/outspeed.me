import { describe, expect, it } from "vitest";
import {
  applyAbilityModifier,
  buildSpeedTierCombinations,
  calculateSpeed,
  calculateSpeedTier,
  calculateUnmodifiedSpeed,
  getBaseSpeed,
  shouldIncludeCombination,
} from "../calculate";
import type { PokedexPokemon } from "../types";

describe("calculateUnmodifiedSpeed", () => {
  it("calculates level 50 speed for each nature", () => {
    expect(calculateUnmodifiedSpeed(100, 0, "neutral")).toBe(120);
    expect(calculateUnmodifiedSpeed(100, 252, "positive")).toBe(167);
    expect(calculateUnmodifiedSpeed(100, 252, "negative")).toBe(136);
  });
});

describe("calculateSpeedTier", () => {
  it("applies item and ability modifiers", () => {
    expect(calculateSpeedTier(100, null, "choice-scarf")).toBe(150);
    expect(calculateSpeedTier(100, "chlorophyll", null)).toBe(200);
    expect(calculateSpeedTier(101, "speed-boost", null)).toBe(151);
  });

  it("returns effect metadata and ordered calculation steps", () => {
    expect(calculateSpeed(145, "chlorophyll", "choice-scarf")).toEqual({
      rawSpeed: 145,
      finalSpeed: 435,
      effects: [
        {
          kind: "ability",
          source: "chlorophyll",
          label: "Chlorophyll",
          multiplier: 2,
          condition: "sun",
        },
        {
          kind: "item",
          source: "choice-scarf",
          label: "Choice Scarf",
          multiplier: 1.5,
        },
      ],
      steps: [
        { label: "base", speed: 145 },
        { label: "Chlorophyll", multiplier: 2, speed: 290 },
        { label: "Choice Scarf", multiplier: 1.5, speed: 435 },
      ],
    });
  });

  it("rejects unsupported abilities", () => {
    expect(() => applyAbilityModifier(100, "run-away")).toThrow(
      "Unsupported speed ability: run-away",
    );
  });
});

describe("getBaseSpeed", () => {
  it("rejects Pokemon without a speed stat", () => {
    expect(() =>
      getBaseSpeed({
        id: 1,
        slug: "slowpoke",
        pokedexNumber: 79,
        name: "Slowpoke",
        abilities: [],
        stats: {},
      }),
    ).toThrow("Missing speed stat for slowpoke");
  });
});

describe("shouldIncludeCombination", () => {
  it("excludes redundant negative-nature boosted combinations", () => {
    expect(
      shouldIncludeCombination({
        evs: 252,
        nature: "negative",
        ability: "chlorophyll",
        item: null,
      }),
    ).toBe(false);
  });

  it("excludes neutral nature scarf with no speed EVs", () => {
    expect(
      shouldIncludeCombination({
        evs: 0,
        nature: "neutral",
        ability: null,
        item: "choice-scarf",
      }),
    ).toBe(false);
  });
});

describe("buildSpeedTierCombinations", () => {
  it("builds combinations for normal and speed abilities", () => {
    const pokemon: PokedexPokemon = {
      id: 1,
      slug: "venusaur",
      pokedexNumber: 3,
      name: "Venusaur",
      abilities: [{ name: "overgrow" }, { name: "chlorophyll" }],
      stats: { speed: 80 },
    };

    const combinations = buildSpeedTierCombinations([pokemon]);

    expect(combinations).toContainEqual({
      id: 1,
      pokedex_no: 3,
      name: "Venusaur",
      EVs: 252,
      ability: "chlorophyll",
      nature: "positive",
      item: "choice-scarf",
      spread: {
        nature: "positive",
        evs: 252,
        ivs: 31,
        level: 50,
        rawSpeed: 145,
      },
      effects: [
        {
          kind: "ability",
          source: "chlorophyll",
          label: "Chlorophyll",
          multiplier: 2,
          condition: "sun",
        },
        {
          kind: "item",
          source: "choice-scarf",
          label: "Choice Scarf",
          multiplier: 1.5,
        },
      ],
      rawSpeed: 145,
      finalSpeed: 435,
      tier: 435,
    });
  });
});
