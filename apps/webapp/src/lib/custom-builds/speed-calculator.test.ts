import { describe, expect, it } from "vitest";
import { calculateCustomSpeed, getSupportedSpeedModifiers } from "./speed-calculator";

describe("custom build speed calculator", () => {
  it("calculates arbitrary Champions SP investments", () => {
    expect(
      calculateCustomSpeed({
        baseSpeed: 100,
        statPoints: 16,
        nature: "neutral",
        ability: null,
        item: null,
      }),
    ).toMatchObject({
      rawSpeed: 136,
      finalSpeed: 136,
      evs: 128,
      statPoints: 16,
      ivs: 31,
      level: 50,
    });
  });

  it("applies nature after the base stat floor", () => {
    expect(
      calculateCustomSpeed({
        baseSpeed: 100,
        statPoints: 16,
        nature: "positive",
        ability: null,
        item: null,
      }).rawSpeed,
    ).toBe(149);

    expect(
      calculateCustomSpeed({
        baseSpeed: 100,
        statPoints: 16,
        nature: "negative",
        ability: null,
        item: null,
      }).rawSpeed,
    ).toBe(122);
  });

  it("preserves existing max-speed parity for 32 SP", () => {
    expect(
      calculateCustomSpeed({
        baseSpeed: 100,
        statPoints: 32,
        nature: "positive",
        ability: null,
        item: null,
      }),
    ).toMatchObject({
      rawSpeed: 167,
      finalSpeed: 167,
      evs: 252,
    });
  });

  it("applies supported modifiers in ability then item order with per-step floors", () => {
    expect(
      calculateCustomSpeed({
        baseSpeed: 100,
        statPoints: 0,
        nature: "neutral",
        ability: { kind: "ability", source: "Speed Boost" },
        item: { kind: "item", source: "Choice Scarf" },
      }),
    ).toMatchObject({
      rawSpeed: 120,
      finalSpeed: 270,
      effects: [
        {
          kind: "stage",
          source: "speed-boost",
          label: "Speed Boost",
          multiplier: 1.5,
          stage: 1,
          condition: "after 1 turn",
        },
        {
          kind: "item",
          source: "choice-scarf",
          label: "Choice Scarf",
          multiplier: 1.5,
        },
      ],
      steps: [
        { label: "base", speed: 120 },
        { label: "Speed Boost", multiplier: 1.5, speed: 180 },
        { label: "Choice Scarf", multiplier: 1.5, speed: 270 },
      ],
    });
  });

  it("floors fractional modifier results", () => {
    expect(
      calculateCustomSpeed({
        baseSpeed: 100,
        statPoints: 1,
        nature: "neutral",
        ability: { kind: "ability", source: "speed-boost" },
        item: null,
      }),
    ).toMatchObject({
      rawSpeed: 121,
      finalSpeed: 181,
      evs: 8,
    });
  });

  it("exposes supported modifier metadata for modeled speed effects", () => {
    expect(getSupportedSpeedModifiers()).toStrictEqual([
      {
        kind: "ability",
        source: "chlorophyll",
        label: "Chlorophyll",
        effectKind: "ability",
        multiplier: 2,
        condition: "sun",
        supportedOrigins: ["manual", "showdown"],
      },
      {
        kind: "ability",
        source: "sand-rush",
        label: "Sand Rush",
        effectKind: "ability",
        multiplier: 2,
        condition: "sand",
        supportedOrigins: ["manual", "showdown"],
      },
      {
        kind: "ability",
        source: "slush-rush",
        label: "Slush Rush",
        effectKind: "ability",
        multiplier: 2,
        condition: "snow",
        supportedOrigins: ["manual", "showdown"],
      },
      {
        kind: "ability",
        source: "swift-swim",
        label: "Swift Swim",
        effectKind: "ability",
        multiplier: 2,
        condition: "rain",
        supportedOrigins: ["manual", "showdown"],
      },
      {
        kind: "ability",
        source: "speed-boost",
        label: "Speed Boost",
        effectKind: "stage",
        multiplier: 1.5,
        stage: 1,
        condition: "after 1 turn",
        supportedOrigins: ["manual", "showdown"],
      },
      {
        kind: "item",
        source: "choice-scarf",
        label: "Choice Scarf",
        effectKind: "item",
        multiplier: 1.5,
        supportedOrigins: ["manual", "showdown"],
      },
    ]);
  });
});
