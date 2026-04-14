import { describe, expect, it } from "vitest";
import {
  formatEffect,
  formatNature,
  formatSpread,
  groupBySpeedTier,
  speedTiersToCsv,
} from "../output";
import type { SpeedTierPokemon } from "../types";

function speedTierPokemon(overrides: Partial<SpeedTierPokemon> = {}): SpeedTierPokemon {
  const spread = overrides.spread ?? {
    nature: "neutral",
    evs: 0,
    ivs: 31,
    level: 50,
    rawSpeed: 100,
  };

  return {
    combinationId: "pokemon:1|nature:neutral|evs:0|ability:none|item:none",
    id: 1,
    slug: "pikachu",
    pokedexNo: 25,
    name: "Pikachu",
    sprite: null,
    spread,
    effects: [],
    finalSpeed: overrides.finalSpeed ?? spread.rawSpeed,
    ...overrides,
  };
}

describe("groupBySpeedTier", () => {
  it("sorts tiers descending and Pokemon by pokedex number, id, then name", () => {
    expect(
      groupBySpeedTier([
        {
          speed: 100,
          ...speedTierPokemon({ id: 2, name: "Pikachu" }),
        },
        {
          speed: 200,
          ...speedTierPokemon({
            id: 3,
            pokedexNo: 6,
            name: "Charizard",
            spread: {
              nature: "positive",
              evs: 252,
              ivs: 31,
              level: 50,
              rawSpeed: 167,
            },
            finalSpeed: 167,
          }),
        },
        {
          speed: 100,
          ...speedTierPokemon({ id: 1, name: "Pikachu-A" }),
        },
      ]),
    ).toEqual([
      {
        speed: 200,
        pokemon: [
          speedTierPokemon({
            id: 3,
            pokedexNo: 6,
            name: "Charizard",
            spread: {
              nature: "positive",
              evs: 252,
              ivs: 31,
              level: 50,
              rawSpeed: 167,
            },
            finalSpeed: 167,
          }),
        ],
      },
      {
        speed: 100,
        pokemon: [
          speedTierPokemon({ id: 1, name: "Pikachu-A" }),
          speedTierPokemon({ id: 2, name: "Pikachu" }),
        ],
      },
    ]);
  });
});

describe("speedTiersToCsv", () => {
  it("writes headers and escapes values", () => {
    expect(
      speedTiersToCsv([
        {
          speed: 100,
          pokemon: [
            speedTierPokemon({
              id: 1,
              pokedexNo: 122,
              name: "Mr. Mime, Jr.",
              effects: [
                {
                  kind: "ability",
                  source: "chlorophyll",
                  label: "Chlorophyll",
                  multiplier: 2,
                  condition: "sun",
                },
              ],
            }),
          ],
        },
      ]),
    ).toBe(
      'speed,id,slug,pokedex_no,name,spread,effects\n100,1,pikachu,122,"Mr. Mime, Jr.",neutral 0 EVs,2x Chlorophyll (sun)\n',
    );
  });
});

describe("format helpers", () => {
  it("formats spreads, natures, and effects for CSV review", () => {
    expect(formatNature("positive")).toBe("+Spe");
    expect(formatNature("neutral")).toBe("neutral");
    expect(formatNature("negative")).toBe("-Spe");
    expect(
      formatSpread({
        nature: "positive",
        evs: 252,
        ivs: 31,
        level: 50,
        rawSpeed: 145,
      }),
    ).toBe("+Spe 252 EVs");
    expect(
      formatEffect({
        kind: "item",
        source: "choice-scarf",
        label: "Choice Scarf",
        multiplier: 1.5,
      }),
    ).toBe("1.5x Choice Scarf");
  });
});
