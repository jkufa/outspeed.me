import { describe, expect, it } from "vitest";
import { defaultSpeedTierQuery, querySpeedTiers } from "./query";
import type { SpeedTier } from "./types";

function tier(speed: number, pokemonCount: number): SpeedTier {
  return {
    speed,
    pokemon: Array.from({ length: pokemonCount }, (_, index) => ({
      combinationId: `pokemon:${speed}-${index}|nature:neutral|evs:0|ability:none|item:none`,
      id: index,
      slug: `pokemon-${speed}-${index}`,
      pokedexNo: index,
      name: `Pokemon ${speed}-${index}`,
      sprite: null,
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
        {
          speed: 200,
          pokemon: tier(200, 2).pokemon.map((pokemon) => ({
            ...pokemon,
            members: [
              {
                id: pokemon.id,
                slug: pokemon.slug,
                pokedexNo: pokemon.pokedexNo,
                name: pokemon.name,
                sprite: null,
              },
            ],
            sourceEffects: pokemon.effects,
          })),
        },
        {
          speed: 100,
          pokemon: tier(100, 2)
            .pokemon.slice(0, 1)
            .map((pokemon) => ({
              ...pokemon,
              members: [
                {
                  id: pokemon.id,
                  slug: pokemon.slug,
                  pokedexNo: pokemon.pokedexNo,
                  name: pokemon.name,
                  sprite: null,
                },
              ],
              sourceEffects: pokemon.effects,
            })),
        },
      ],
      totalRows: 4,
      returnedRows: 3,
    });
  });
});
