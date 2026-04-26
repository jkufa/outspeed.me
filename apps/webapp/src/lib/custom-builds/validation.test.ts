import { describe, expect, it } from "vitest";
import { validateCustomBuildInput } from "./validation";
import type { CustomBuildInput } from "./types";

const validInput: CustomBuildInput = {
  species: {
    id: 1,
    slug: "testmon",
    pokedexNo: 999,
    name: "Testmon",
  },
  nature: "neutral",
  speedStatPoints: 16,
  ability: { kind: "ability", source: "swift-swim", label: "Swift Swim" },
  item: { kind: "item", source: "choice-scarf", label: "Choice Scarf" },
  origin: "manual",
};

describe("custom build validation", () => {
  it("accepts valid manual custom build inputs", () => {
    expect(validateCustomBuildInput(validInput, { hasSpecies: () => true })).toStrictEqual({
      ok: true,
    });
  });

  it("rejects non-integer or out-of-range Speed SP", () => {
    expect(
      validateCustomBuildInput(
        { ...validInput, speedStatPoints: 32.5 },
        { hasSpecies: () => true },
      ),
    ).toMatchObject({
      ok: false,
      issues: [{ code: "invalid-speed-stat-points", path: "speedStatPoints" }],
    });

    expect(
      validateCustomBuildInput({ ...validInput, speedStatPoints: 33 }, { hasSpecies: () => true }),
    ).toMatchObject({
      ok: false,
      issues: [{ code: "invalid-speed-stat-points", path: "speedStatPoints" }],
    });
  });

  it("rejects species outside the current speed tier data", () => {
    expect(validateCustomBuildInput(validInput, { hasSpecies: () => false })).toMatchObject({
      ok: false,
      issues: [{ code: "invalid-species", path: "species" }],
    });
  });

  it("rejects unsupported speed modifiers for manual inputs", () => {
    expect(
      validateCustomBuildInput(
        {
          ...validInput,
          ability: { kind: "ability", source: "quark-drive", label: "Quark Drive" },
        },
        { hasSpecies: () => true },
      ),
    ).toMatchObject({
      ok: false,
      issues: [{ code: "invalid-ability", path: "ability" }],
    });
  });
});
