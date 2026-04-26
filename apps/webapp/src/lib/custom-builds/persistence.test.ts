import { describe, expect, it } from "vitest";
import {
  CUSTOM_BUILD_STORAGE_KEY,
  CUSTOM_BUILD_STORAGE_SCHEMA_VERSION,
  clearCustomBuildStorage,
  createCustomBuildStored,
  readCustomBuildStorage,
  writeCustomBuildStorage,
} from ".";
import type { CustomBuildInput } from ".";

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
    values,
  };
}

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

describe("custom build persistence", () => {
  it("loads empty storage as an empty build list", () => {
    expect(readCustomBuildStorage(memoryStorage())).toStrictEqual({
      ok: true,
      status: "empty",
      builds: [],
    });
  });

  it("round-trips valid storage envelopes", () => {
    const storage = memoryStorage();
    const build = createCustomBuildStored(input, {
      id: "build-1",
      now: new Date("2026-04-26T20:00:00.000Z"),
    });

    expect(writeCustomBuildStorage([build], storage)).toStrictEqual({
      ok: true,
      status: "saved",
    });
    expect(readCustomBuildStorage(storage)).toStrictEqual({
      ok: true,
      status: "loaded",
      builds: [build],
    });
  });

  it("returns corrupt without throwing for malformed JSON or invalid builds", () => {
    expect(
      readCustomBuildStorage(memoryStorage({ [CUSTOM_BUILD_STORAGE_KEY]: "{nope" })),
    ).toMatchObject({
      ok: false,
      status: "corrupt",
      builds: [],
    });

    expect(
      readCustomBuildStorage(
        memoryStorage({
          [CUSTOM_BUILD_STORAGE_KEY]: JSON.stringify({
            schemaVersion: CUSTOM_BUILD_STORAGE_SCHEMA_VERSION,
            builds: [{ ...input, id: "", createdAt: "bad", updatedAt: "bad" }],
          }),
        }),
      ),
    ).toMatchObject({
      ok: false,
      status: "corrupt",
      builds: [],
    });
  });

  it("treats schema version mismatch as empty unusable storage", () => {
    expect(
      readCustomBuildStorage(
        memoryStorage({
          [CUSTOM_BUILD_STORAGE_KEY]: JSON.stringify({
            schemaVersion: 999,
            builds: [],
          }),
        }),
      ),
    ).toStrictEqual({
      ok: false,
      status: "schema-mismatch",
      builds: [],
      error: undefined,
    });
  });

  it("reports unavailable storage without throwing", () => {
    expect(readCustomBuildStorage(null)).toStrictEqual({
      ok: false,
      status: "unavailable",
      builds: [],
    });
    expect(writeCustomBuildStorage([], null)).toStrictEqual({
      ok: false,
      status: "unavailable",
    });
    expect(clearCustomBuildStorage(null)).toStrictEqual({
      ok: false,
      status: "unavailable",
    });
  });
});
