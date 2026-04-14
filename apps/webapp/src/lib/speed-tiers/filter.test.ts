import { describe, expect, it } from "vitest";
import { defaultSpeedTierFilters, filterSpeedTiers } from "./filter";
import type { SpeedTier } from "./types";

const tiers: SpeedTier[] = [
  {
    speed: 308,
    pokemon: [
      {
        id: 1,
        pokedexNo: 530,
        name: "Excadrill",
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
    speed: 222,
    pokemon: [
      {
        id: 2,
        pokedexNo: 142,
        name: "Aerodactyl",
        spread: { nature: "neutral", evs: 0, ivs: 31, level: 50, rawSpeed: 222 },
        effects: [],
        finalSpeed: 222,
      },
    ],
  },
];

describe("filterSpeedTiers", () => {
  it("keeps matching setup rows and omits empty groups", () => {
    expect(filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, search: "drill" })).toStrictEqual([
      tiers[0],
    ]);
  });

  it("preserves group order from input", () => {
    expect(
      filterSpeedTiers(tiers, defaultSpeedTierFilters).map((tier) => tier.speed),
    ).toStrictEqual([308, 222]);
  });

  it("filters baseline and boosted modes", () => {
    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, mode: "baseline" }).map(
        (tier) => tier.speed,
      ),
    ).toStrictEqual([222]);

    expect(
      filterSpeedTiers(tiers, { ...defaultSpeedTierFilters, mode: "boosted" }).map(
        (tier) => tier.speed,
      ),
    ).toStrictEqual([308]);
  });

  it("filters by effect kind, weather, nature, and stat points", () => {
    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        abilityOnly: true,
        weather: "sand",
        nature: "positive",
        statPoints: 32,
      }).map((tier) => tier.speed),
    ).toStrictEqual([308]);

    expect(
      filterSpeedTiers(tiers, {
        ...defaultSpeedTierFilters,
        itemOnly: true,
      }),
    ).toStrictEqual([]);
  });
});
