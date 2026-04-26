import { CUSTOM_BUILD_STORAGE_KEY, CUSTOM_BUILD_STORAGE_SCHEMA_VERSION } from "./types";
import type { CustomBuildStorageEnvelope, CustomBuildStored } from "./types";
import { validateCustomBuildStored } from "./validation";

export type CustomBuildStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export type CustomBuildStorageReadResult =
  | {
      ok: true;
      status: "empty" | "loaded";
      builds: CustomBuildStored[];
    }
  | {
      ok: false;
      status: "corrupt" | "schema-mismatch" | "unavailable";
      builds: [];
      error?: unknown;
    };

export type CustomBuildStorageWriteResult =
  | {
      ok: true;
      status: "saved" | "cleared";
    }
  | {
      ok: false;
      status: "unavailable";
      error?: unknown;
    };

export function readCustomBuildStorage(
  storage: CustomBuildStorage | null = getBrowserCustomBuildStorage(),
): CustomBuildStorageReadResult {
  if (storage === null) {
    return { ok: false, status: "unavailable", builds: [] };
  }

  let raw: string | null;
  try {
    raw = storage.getItem(CUSTOM_BUILD_STORAGE_KEY);
  } catch (error) {
    return { ok: false, status: "unavailable", builds: [], error };
  }

  if (raw === null || raw.trim() === "") {
    return { ok: true, status: "empty", builds: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { ok: false, status: "corrupt", builds: [], error };
  }

  const envelope = parseStorageEnvelope(parsed);
  if (envelope.status !== "valid") {
    return {
      ok: false,
      status: envelope.status,
      builds: [],
      error: envelope.error,
    };
  }

  return { ok: true, status: "loaded", builds: envelope.builds };
}

export function writeCustomBuildStorage(
  builds: readonly CustomBuildStored[],
  storage: CustomBuildStorage | null = getBrowserCustomBuildStorage(),
): CustomBuildStorageWriteResult {
  if (storage === null) {
    return { ok: false, status: "unavailable" };
  }

  const envelope: CustomBuildStorageEnvelope = {
    schemaVersion: CUSTOM_BUILD_STORAGE_SCHEMA_VERSION,
    builds: [...builds],
  };

  try {
    storage.setItem(CUSTOM_BUILD_STORAGE_KEY, JSON.stringify(envelope));
  } catch (error) {
    return { ok: false, status: "unavailable", error };
  }

  return { ok: true, status: "saved" };
}

export function clearCustomBuildStorage(
  storage: CustomBuildStorage | null = getBrowserCustomBuildStorage(),
): CustomBuildStorageWriteResult {
  if (storage === null) {
    return { ok: false, status: "unavailable" };
  }

  try {
    storage.removeItem(CUSTOM_BUILD_STORAGE_KEY);
  } catch (error) {
    return { ok: false, status: "unavailable", error };
  }

  return { ok: true, status: "cleared" };
}

export function getBrowserCustomBuildStorage(): CustomBuildStorage | null {
  try {
    if (typeof globalThis.localStorage === "undefined") {
      return null;
    }

    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function parseStorageEnvelope(value: unknown):
  | {
      status: "valid";
      builds: CustomBuildStored[];
    }
  | {
      status: "corrupt" | "schema-mismatch";
      error?: unknown;
    } {
  if (value === null || typeof value !== "object") {
    return { status: "corrupt" };
  }

  const envelope = value as Partial<CustomBuildStorageEnvelope>;

  if (envelope.schemaVersion !== CUSTOM_BUILD_STORAGE_SCHEMA_VERSION) {
    return { status: "schema-mismatch" };
  }

  if (!Array.isArray(envelope.builds)) {
    return { status: "corrupt" };
  }

  const builds: CustomBuildStored[] = [];
  for (const build of envelope.builds) {
    const stored = build as CustomBuildStored;
    const validation = validateCustomBuildStored(stored);

    if (!validation.ok) {
      return { status: "corrupt", error: validation.issues };
    }

    builds.push(stored);
  }

  return { status: "valid", builds };
}
