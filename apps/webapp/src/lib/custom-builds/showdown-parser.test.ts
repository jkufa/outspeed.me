import { describe, expect, it } from "vitest";
import { parseShowdownSet } from "./showdown-parser";

describe("parseShowdownSet", () => {
  it("parses a supported single Showdown set", () => {
    const result = parseShowdownSet(`Sparky (Pikachu-Alola) @ Choice Scarf
Ability: Swift Swim
EVs: 4 HP / 252 Spe / 252 SpA
Timid Nature
- Thunderbolt`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.warnings).toStrictEqual([]);
    expect(result.build).toMatchObject({
      origin: "showdown",
      nickname: "Sparky",
      species: {
        raw: "Pikachu-Alola",
        name: "Pikachu",
        form: "Alola",
      },
      nature: "positive",
      speed: {
        evs: 252,
        statPoints: 32,
        rawText: "EVs: 4 HP / 252 Spe / 252 SpA",
      },
      ability: {
        kind: "ability",
        source: "swift-swim",
        label: "Swift Swim",
      },
      item: {
        kind: "item",
        source: "choice-scarf",
        label: "Choice Scarf",
      },
      unsupportedSpeedModifiers: [],
    });
  });

  it("recovers from malformed speed investment", () => {
    const result = parseShowdownSet(`Gengar
Ability: Cursed Body
EVs: fast Spe
Calm Nature
- Shadow Ball`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.build.species).toStrictEqual({
      raw: "Gengar",
      name: "Gengar",
    });
    expect(result.build.nature).toBe("neutral");
    expect(result.build.speed).toBeNull();
    expect(result.build.ability).toBeNull();
    expect(result.warnings).toStrictEqual([
      {
        code: "malformed-speed-investment",
        message: "Could not parse Speed investment from Showdown set",
        rawText: "EVs: fast Spe",
      },
    ]);
  });

  it("reports unsupported speed-affecting item and ability while stripping them", () => {
    const result = parseShowdownSet(`Iron Treads @ Booster Energy
Ability: Quark Drive
EVs: 124 Spe
Jolly Nature`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.build.item).toBeNull();
    expect(result.build.ability).toBeNull();
    expect(result.build.unsupportedSpeedModifiers).toStrictEqual([
      {
        kind: "item",
        source: "booster-energy",
        label: "Booster Energy",
        reason: "unsupported",
        rawText: "Booster Energy",
      },
      {
        kind: "ability",
        source: "quark-drive",
        label: "Quark Drive",
        reason: "unsupported",
        rawText: "Quark Drive",
      },
    ]);
  });

  it("parses Champions speed stat points and speed-reducing nature", () => {
    const result = parseShowdownSet(`Torkoal
SPs: 12 Speed
Quiet Nature`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.build.speed).toStrictEqual({
      statPoints: 12,
      rawText: "SPs: 12 Speed",
    });
    expect(result.build.nature).toBe("negative");
  });

  it("rejects multiple pasted sets", () => {
    const result = parseShowdownSet(`Pikachu
Jolly Nature

Gengar
Timid Nature`);

    expect(result).toMatchObject({
      ok: false,
      errors: [
        {
          code: "multiple-sets",
          message: "Paste a single Showdown set",
        },
      ],
      partialBuild: {
        species: {
          raw: "Pikachu",
          name: "Pikachu",
        },
      },
    });
  });
});
