import { describe, expect, it } from "vitest";
import { groupBySpeedTier, speedTiersToCsv } from "../output";
import type { SpeedTierPokemon } from "../types";

function speedTierPokemon(overrides: Partial<SpeedTierPokemon> = {}): SpeedTierPokemon {
  const nature = overrides.nature ?? "neutral";
  const evs = overrides.EVs ?? 0;
  const rawSpeed = overrides.rawSpeed ?? 100;

  return {
    id: 1,
    pokedex_no: 25,
    name: "Pikachu",
    EVs: evs,
    ability: null,
    nature,
    item: null,
    spread: {
      nature,
      evs,
      ivs: 31,
      level: 50,
      rawSpeed,
    },
    effects: [],
    rawSpeed,
    finalSpeed: overrides.finalSpeed ?? rawSpeed,
    ...overrides,
  };
}

describe("groupBySpeedTier", () => {
  it("sorts tiers descending and Pokemon by pokedex number, id, then name", () => {
    expect(
      groupBySpeedTier([
        {
          tier: 100,
          ...speedTierPokemon({ id: 2, name: "Pikachu" }),
        },
        {
          tier: 200,
          ...speedTierPokemon({
            id: 3,
            pokedex_no: 6,
            name: "Charizard",
            EVs: 252,
            nature: "positive",
            rawSpeed: 167,
            finalSpeed: 167,
          }),
        },
        {
          tier: 100,
          ...speedTierPokemon({ id: 1, name: "Pikachu-A" }),
        },
      ]),
    ).toEqual([
      {
        tier: 200,
        pokemon: [
          speedTierPokemon({
            id: 3,
            pokedex_no: 6,
            name: "Charizard",
            EVs: 252,
            nature: "positive",
            rawSpeed: 167,
            finalSpeed: 167,
          }),
        ],
      },
      {
        tier: 100,
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
          tier: 100,
          pokemon: [
            speedTierPokemon({
              id: 1,
              pokedex_no: 122,
              name: "Mr. Mime, Jr.",
              ability: "filter",
            }),
          ],
        },
      ]),
    ).toBe(
      'tier,id,pokedex_no,name,EVs,ability,nature,item\n100,1,122,"Mr. Mime, Jr.",0,filter,neutral,\n',
    );
  });
});
