import { describe, expect, it } from "vitest";
import type { SpeedTier, SpeedTierPokemon } from "../speed-tiers";
import {
  buildCustomBuildSpeciesLookup,
  createCustomBuildStored,
  mergeCustomSpeedTiers,
  resolveCustomBuild,
  resolveCustomBuilds,
  resolveShowdownBuildInput,
  toCustomSpeedTiers,
} from ".";
import type { CustomBuildInput, ShowdownParsedBuild } from ".";

function pokemon(overrides: Partial<SpeedTierPokemon> = {}): SpeedTierPokemon {
  return {
    combinationId: "pokemon:1|nature:neutral|evs:0|ability:none|item:none",
    id: 1,
    slug: "testmon",
    pokedexNo: 999,
    name: "Testmon",
    sprite: null,
    spread: { nature: "neutral", evs: 0, ivs: 31, level: 50, rawSpeed: 120 },
    effects: [],
    finalSpeed: 120,
    ...overrides,
  };
}

const builtInTiers: SpeedTier[] = [
  {
    speed: 136,
    pokemon: [
      pokemon({
        combinationId: "pokemon:2|nature:neutral|evs:0|ability:none|item:none",
        id: 2,
        slug: "same-speed",
        pokedexNo: 998,
        name: "Same Speed",
        finalSpeed: 136,
      }),
    ],
  },
  {
    speed: 120,
    pokemon: [pokemon()],
  },
];

const input: CustomBuildInput = {
  species: {
    id: 1,
    slug: "testmon",
    pokedexNo: 999,
    name: "Testmon",
  },
  nature: "neutral",
  speedStatPoints: 16,
  ability: null,
  item: null,
  origin: "manual",
};

describe("custom build resolver", () => {
  it("builds dataset-bound species lookup data from speed tiers", () => {
    const lookup = buildCustomBuildSpeciesLookup(builtInTiers);

    expect(lookup.species).toContainEqual({
      id: 1,
      slug: "testmon",
      pokedexNo: 999,
      name: "Testmon",
      baseSpeed: 100,
      sprite: null,
    });
    expect(lookup.resolveShowdownSpecies({ raw: "Testmon", name: "Testmon" })?.id).toBe(1);
  });

  it("resolves stored builds into custom speed tier rows", () => {
    const lookup = buildCustomBuildSpeciesLookup(builtInTiers);
    const build = createCustomBuildStored(
      { ...input, nickname: "Fast Testmon" },
      { id: "build-1", now: new Date("2026-04-26T20:00:00.000Z") },
    );
    const result = resolveCustomBuild(build, lookup);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.resolved.calculation).toMatchObject({
      rawSpeed: 136,
      finalSpeed: 136,
      evs: 128,
      statPoints: 16,
    });
    expect(result.resolved.row).toMatchObject({
      combinationId: "custom:build-1|species:1|nature:neutral|sp:16|ability:none|item:none",
      name: "Fast Testmon",
      finalSpeed: 136,
      source: {
        kind: "custom-build",
        buildId: "build-1",
        origin: "manual",
        label: "Fast Testmon",
      },
    });
  });

  it("strips unsupported modifiers before calculation and exposes them", () => {
    const lookup = buildCustomBuildSpeciesLookup(builtInTiers);
    const build = createCustomBuildStored(
      {
        ...input,
        ability: { kind: "ability", source: "quark-drive", label: "Quark Drive" },
      },
      { id: "build-1", now: new Date("2026-04-26T20:00:00.000Z") },
    );
    const result = resolveCustomBuild(build, lookup);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.resolved.strippedModifiers).toStrictEqual([
      {
        kind: "ability",
        source: "quark-drive",
        label: "Quark Drive",
        reason: "unsupported",
      },
    ]);
    expect(result.resolved.calculation.finalSpeed).toBe(136);
    expect(result.resolved.row.effects).toStrictEqual([]);
  });

  it("resolves Showdown parser output while preserving stripped modifiers", () => {
    const lookup = buildCustomBuildSpeciesLookup(builtInTiers);
    const parsed: ShowdownParsedBuild = {
      origin: "showdown",
      rawText: "Testmon @ Booster Energy",
      species: { raw: "Testmon", name: "Testmon" },
      nature: null,
      speed: null,
      ability: null,
      item: null,
      unsupportedSpeedModifiers: [
        {
          kind: "item",
          source: "booster-energy",
          label: "Booster Energy",
          reason: "unsupported",
        },
      ],
    };

    expect(resolveShowdownBuildInput(parsed, lookup)).toStrictEqual({
      ok: true,
      input: {
        species: input.species,
        nature: "neutral",
        speedStatPoints: 0,
        ability: null,
        item: null,
        nickname: undefined,
        origin: "showdown",
      },
      strippedModifiers: parsed.unsupportedSpeedModifiers,
    });
  });

  it("merges custom rows by final speed without mutating built-in data", () => {
    const lookup = buildCustomBuildSpeciesLookup(builtInTiers);
    const build = createCustomBuildStored(input, {
      id: "build-1",
      now: new Date("2026-04-26T20:00:00.000Z"),
    });
    const resolved = resolveCustomBuilds([build], lookup);
    const customTiers = toCustomSpeedTiers(resolved.resolved);
    const merged = mergeCustomSpeedTiers(builtInTiers, customTiers);

    expect(builtInTiers[0].pokemon).toHaveLength(1);
    expect(merged).toHaveLength(2);
    expect(merged[0].speed).toBe(136);
    expect(merged[0].pokemon.map((row) => row.combinationId)).toStrictEqual([
      "pokemon:2|nature:neutral|evs:0|ability:none|item:none",
      "custom:build-1|species:1|nature:neutral|sp:16|ability:none|item:none",
    ]);
  });
});
