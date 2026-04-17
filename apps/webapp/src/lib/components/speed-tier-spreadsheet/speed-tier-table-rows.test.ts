import { describe, expect, it } from "vitest";
import type { SpeedTierDisplayTier } from "$lib/speed-tiers";
import { buildSpeedTierTableRows, rowMatchesPokemonFind } from "./speed-tier-table-rows";

const tiers: SpeedTierDisplayTier[] = [
  {
    speed: 222,
    pokemon: [
      {
        combinationId: "pokemon:1|nature:neutral|evs:0",
        id: 1,
        slug: "froslass",
        pokedexNo: 478,
        name: "Froslass",
        sprite: null,
        spread: { nature: "neutral", evs: 0, ivs: 31, level: 50, rawSpeed: 111 },
        effects: [],
        sourceEffects: [],
        finalSpeed: 222,
        members: [
          {
            id: 1,
            slug: "froslass",
            pokedexNo: 478,
            name: "Froslass",
            sprite: null,
          },
          {
            id: 2,
            slug: "abomasnow",
            pokedexNo: 460,
            name: "Abomasnow",
            sprite: null,
          },
        ],
      },
    ],
  },
];

describe("speedTierTableRows", () => {
  it("matches visible Pokemon names in grouped rows", () => {
    const [row] = buildSpeedTierTableRows(tiers);

    expect(rowMatchesPokemonFind(row, "fros")).toBe(true);
    expect(rowMatchesPokemonFind(row, "aboma")).toBe(true);
  });

  it("does not match blank queries", () => {
    const [row] = buildSpeedTierTableRows(tiers);

    expect(rowMatchesPokemonFind(row, "")).toBe(false);
    expect(rowMatchesPokemonFind(row, "   ")).toBe(false);
  });
});
