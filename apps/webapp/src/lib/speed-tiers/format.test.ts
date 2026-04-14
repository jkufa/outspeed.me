import { describe, expect, it } from "vitest";
import {
  effectToChips,
  effectsToChips,
  evsToStatPoints,
  formatMultiplier,
  formatSpread,
  statPointsToEvs,
} from "./format";

describe("speed tier formatting", () => {
  it("maps Pokemon Champions stat points from ingestor EV values", () => {
    expect(evsToStatPoints(252)).toBe(32);
    expect(evsToStatPoints(0)).toBe(0);
    expect(statPointsToEvs(32)).toBe(252);
    expect(statPointsToEvs(0)).toBe(0);
  });

  it("formats spreads with stat points", () => {
    expect(
      formatSpread({
        nature: "positive",
        evs: 252,
        ivs: 31,
        level: 50,
        rawSpeed: 154,
      }),
    ).toBe("+Spe 32 SP");

    expect(
      formatSpread({
        nature: "negative",
        evs: 0,
        ivs: 31,
        level: 50,
        rawSpeed: 90,
      }),
    ).toBe("-Spe 0 SP");
  });

  it("formats multipliers without unnecessary decimals", () => {
    expect(formatMultiplier(2)).toBe("2x");
    expect(formatMultiplier(1.5)).toBe("1.5x");
  });

  it("renders no chips for unboosted rows", () => {
    expect(effectsToChips([])).toStrictEqual([]);
  });

  it("combines multiplier effects into one provenance chip", () => {
    expect(
      effectToChips({
        kind: "ability",
        source: "speed-boost",
        label: "Speed Boost",
        multiplier: 1.5,
        condition: "after 1 turn",
        stage: 1,
      }),
    ).toStrictEqual([
      {
        key: "speed-boost-multiplier-1.5-Speed Boost",
        label: "1.5x Speed Boost",
        kind: "multiplier",
      },
    ]);
  });

  it("keeps stage and condition chips for non-multiplier effects", () => {
    expect(
      effectToChips({
        kind: "stage",
        source: "tailwind",
        label: "Tailwind",
        stage: 1,
        condition: "active",
      }),
    ).toStrictEqual([
      {
        key: "tailwind-label-Tailwind",
        label: "Tailwind",
        kind: "stage",
      },
      {
        key: "tailwind-stage-1",
        label: "+1",
        kind: "stage",
      },
      {
        key: "tailwind-condition-active",
        label: "active",
        kind: "condition",
      },
    ]);
  });
});
