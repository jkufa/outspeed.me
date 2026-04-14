import { describe, expect, it } from "vitest";
import {
  effectToChips,
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

  it("keeps multiplier, label, condition, and stage chip order", () => {
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
        key: "speed-boost-multiplier-1.5",
        label: "1.5x",
        kind: "multiplier",
      },
      {
        key: "speed-boost-label-Speed Boost",
        label: "Speed Boost",
        kind: "ability",
      },
      {
        key: "speed-boost-condition-after 1 turn",
        label: "after 1 turn",
        kind: "condition",
      },
      {
        key: "speed-boost-stage-1",
        label: "+1",
        kind: "stage",
      },
    ]);
  });
});
