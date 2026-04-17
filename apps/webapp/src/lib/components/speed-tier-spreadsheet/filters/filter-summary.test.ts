import { describe, expect, it } from "vitest";
import type { SpeedTierFilters } from "$lib/speed-tiers";
import { countSelectedSpeedTierFilters } from "./filter-summary";

describe("countSelectedSpeedTierFilters", () => {
  it("counts selected values across all speed tier filter groups", () => {
    const filters: SpeedTierFilters = {
      pokemon: [59, 547],
      fieldConditions: ["sun", "tailwind"],
      spreads: ["positive-252"],
      items: ["choice-scarf"],
    };

    expect(countSelectedSpeedTierFilters(filters)).toBe(6);
  });
});
