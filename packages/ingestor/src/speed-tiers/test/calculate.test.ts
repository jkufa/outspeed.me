import { describe, expect, it } from "vitest";
import {
  applyAbilityModifier,
  buildSpeedTierCombinationId,
  buildSpeedTierCombinations,
  calculateSpeed,
  calculateSpeedTier,
  calculateUnmodifiedSpeed,
  getBaseSpeed,
  shouldIncludeCombination,
} from "../calculate";
import type { PokedexPokemon } from "../types";

function pokemon(overrides: Partial<PokedexPokemon> = {}): PokedexPokemon {
  return {
    id: 1,
    slug: "venusaur",
    pokedexNumber: 3,
    name: "Venusaur",
    abilities: [],
    stats: { speed: 80 },
    ...overrides,
  };
}

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
});

describe("applyAbilityModifier", () => {
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
        pokemon: pokemon(),
        evs: 252,
        nature: "negative",
        ability: "chlorophyll",
        item: null,
      }),
    ).toBe(false);
  });

  it("excludes any boosted setup with no speed EVs", () => {
    expect(
      shouldIncludeCombination({
        pokemon: pokemon(),
        evs: 0,
        nature: "positive",
        ability: "chlorophyll",
        item: null,
      }),
    ).toBe(false);
    expect(
      shouldIncludeCombination({
        pokemon: pokemon(),
        evs: 0,
        nature: "positive",
        ability: null,
        item: "choice-scarf",
      }),
    ).toBe(false);
  });

  it("excludes negative nature with full speed EVs", () => {
    expect(
      shouldIncludeCombination({
        pokemon: pokemon(),
        evs: 252,
        nature: "negative",
        ability: null,
        item: null,
      }),
    ).toBe(false);
  });

  it("excludes held items for mega Pokemon", () => {
    expect(
      shouldIncludeCombination({
        pokemon: pokemon({ slug: "venusaur-mega", name: "Mega Venusaur" }),
        evs: 252,
        nature: "positive",
        ability: null,
        item: "choice-scarf",
      }),
    ).toBe(false);
  });

  it("excludes choice scarf when paired with a speed ability", () => {
    expect(
      shouldIncludeCombination({
        pokemon: pokemon(),
        evs: 252,
        nature: "positive",
        ability: "chlorophyll",
        item: "choice-scarf",
      }),
    ).toBe(false);
  });
});

describe("buildSpeedTierCombinationId", () => {
  it("builds a stable key from the Pokemon setup", () => {
    expect(
      buildSpeedTierCombinationId({
        pokemon: pokemon({ id: 42 }),
        evs: 252,
        nature: "positive",
        ability: "chlorophyll",
        item: null,
      }),
    ).toBe("pokemon:42|nature:positive|evs:252|ability:chlorophyll|item:none");
  });
});

describe("buildSpeedTierCombinations", () => {
  it("builds combinations for normal and speed abilities", () => {
    const testPokemon = pokemon({
      abilities: [{ name: "overgrow" }, { name: "chlorophyll" }],
    });

    const combinations = buildSpeedTierCombinations([testPokemon]);

    expect(combinations).toContainEqual({
      combinationId: "pokemon:1|nature:positive|evs:252|ability:chlorophyll|item:none",
      id: 1,
      slug: "venusaur",
      pokedexNo: 3,
      name: "Venusaur",
      sprite: null,
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
      ],
      finalSpeed: 290,
      speed: 290,
    });
    expect(
      combinations.some(
        (combination) =>
          combination.spread.evs === 0 &&
          combination.effects.some((effect) => effect.kind === "ability" || effect.kind === "item"),
      ),
    ).toBe(false);
    expect(
      combinations.some(
        (combination) => combination.spread.nature === "negative" && combination.spread.evs === 252,
      ),
    ).toBe(false);
  });

  it("does not build held item combinations for mega Pokemon", () => {
    const combinations = buildSpeedTierCombinations([
      pokemon({ slug: "venusaur-mega", name: "Mega Venusaur" }),
    ]);

    expect(
      combinations.every((combination) =>
        combination.effects.every((effect) => effect.source !== "choice-scarf"),
      ),
    ).toBe(true);
  });
});
