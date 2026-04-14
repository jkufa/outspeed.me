import { describe, expect, it } from "vitest";
import { defaultSpeedTierQuery, querySpeedTiers } from "./query";
import type { SpeedTier } from "./types";

function tier(speed: number, pokemonCount: number): SpeedTier {
  return {
    speed,
    pokemon: Array.from({ length: pokemonCount }, (_, index) => ({
      combinationId: `pokemon:${speed}-${index}|nature:neutral|evs:0|ability:none|item:none`,
      id: index,
      pokedexNo: index,
      name: `Pokemon ${speed}-${index}`,
      spread: { nature: "neutral", evs: 0, ivs: 31, level: 50, rawSpeed: speed },
      effects: [],
      finalSpeed: speed,
    })),
  };
}

describe("querySpeedTiers", () => {
  it("filters with the default query and caps rows across speed groups", () => {
    expect(querySpeedTiers([tier(200, 2), tier(100, 2)], defaultSpeedTierQuery(3))).toStrictEqual({
      tiers: [
        tier(200, 2),
        {
          speed: 100,
          pokemon: tier(100, 2).pokemon.slice(0, 1),
        },
      ],
      totalRows: 4,
      returnedRows: 3,
    });
  });
});
