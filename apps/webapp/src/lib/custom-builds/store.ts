import { writable } from "svelte/store";
import type { Readable } from "svelte/store";
import {
  clearCustomBuildStorage,
  readCustomBuildStorage,
  writeCustomBuildStorage,
} from "./persistence";
import type {
  CustomBuildStorage,
  CustomBuildStorageReadResult,
  CustomBuildStorageWriteResult,
} from "./persistence";
import { CUSTOM_BUILD_STORAGE_SCHEMA_VERSION } from "./types";
import type {
  CustomBuildId,
  CustomBuildInput,
  CustomBuildStored,
  CustomBuildValidationIssue,
} from "./types";
import { validateCustomBuildInput } from "./validation";
import type { CustomBuildValidationOptions } from "./validation";

export type CustomBuildStoreHydrationStatus = "idle" | CustomBuildStorageReadResult["status"];

export type CustomBuildStoreState = {
  builds: CustomBuildStored[];
  hydrationStatus: CustomBuildStoreHydrationStatus;
  lastWriteStatus: CustomBuildStorageWriteResult["status"] | null;
};

export type CustomBuildMutationResult =
  | {
      ok: true;
      build?: CustomBuildStored;
      write: CustomBuildStorageWriteResult;
    }
  | {
      ok: false;
      issues: CustomBuildValidationIssue[];
    };

export type CustomBuildStore = Readable<CustomBuildStoreState> & {
  hydrate: () => CustomBuildStorageReadResult;
  add: (input: CustomBuildInput) => CustomBuildMutationResult;
  update: (id: CustomBuildId, input: CustomBuildInput) => CustomBuildMutationResult;
  remove: (id: CustomBuildId) => CustomBuildMutationResult;
  replace: (builds: readonly CustomBuildStored[]) => CustomBuildStorageWriteResult;
  clear: () => CustomBuildStorageWriteResult;
};

export type CreateCustomBuildStoreOptions = CustomBuildValidationOptions & {
  storage?: CustomBuildStorage | null;
  createId?: () => CustomBuildId;
  now?: () => Date;
};

export function createCustomBuildStore(
  options: CreateCustomBuildStoreOptions = {},
): CustomBuildStore {
  const { subscribe, set, update } = writable<CustomBuildStoreState>({
    builds: [],
    hydrationStatus: "idle",
    lastWriteStatus: null,
  });
  const storage = options.storage;
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? createCustomBuildId;

  function persist(builds: readonly CustomBuildStored[]) {
    const write = writeCustomBuildStorage(builds, storage);
    update((state) => ({ ...state, lastWriteStatus: write.status }));
    return write;
  }

  return {
    subscribe,
    hydrate() {
      const read = readCustomBuildStorage(storage);
      set({
        builds: read.ok ? read.builds : [],
        hydrationStatus: read.status,
        lastWriteStatus: null,
      });
      return read;
    },
    add(input) {
      const validation = validateCustomBuildInput(input, options);
      if (!validation.ok) {
        return { ok: false, issues: validation.issues };
      }

      const build = createCustomBuildStored(input, { id: createId(), now: now() });
      let builds: CustomBuildStored[] = [];
      update((state) => {
        builds = [...state.builds, build];
        return { ...state, builds };
      });

      return { ok: true, build, write: persist(builds) };
    },
    update(id, input) {
      const validation = validateCustomBuildInput(input, options);
      if (!validation.ok) {
        return { ok: false, issues: validation.issues };
      }

      let savedBuild: CustomBuildStored | undefined;
      let builds: CustomBuildStored[] = [];
      update((state) => {
        builds = state.builds.map((build) => {
          if (build.id !== id) {
            return build;
          }

          savedBuild = {
            ...input,
            id,
            schemaVersion: CUSTOM_BUILD_STORAGE_SCHEMA_VERSION,
            createdAt: build.createdAt,
            updatedAt: now().toISOString(),
          };
          return savedBuild;
        });

        return { ...state, builds };
      });

      if (savedBuild === undefined) {
        return {
          ok: false,
          issues: [
            {
              code: "invalid-storage-schema",
              message: "Custom build was not found",
              path: "id",
            },
          ],
        };
      }

      return { ok: true, build: savedBuild, write: persist(builds) };
    },
    remove(id) {
      let removed = false;
      let builds: CustomBuildStored[] = [];
      update((state) => {
        builds = state.builds.filter((build) => {
          const keep = build.id !== id;
          removed ||= !keep;
          return keep;
        });

        return { ...state, builds };
      });

      if (!removed) {
        return {
          ok: false,
          issues: [
            {
              code: "invalid-storage-schema",
              message: "Custom build was not found",
              path: "id",
            },
          ],
        };
      }

      return { ok: true, write: persist(builds) };
    },
    replace(builds) {
      const nextBuilds = [...builds];
      set({
        builds: nextBuilds,
        hydrationStatus: "loaded",
        lastWriteStatus: null,
      });
      return persist(nextBuilds);
    },
    clear() {
      const write = clearCustomBuildStorage(storage);
      set({
        builds: [],
        hydrationStatus: "empty",
        lastWriteStatus: write.status,
      });
      return write;
    },
  };
}

export function createCustomBuildStored(
  input: CustomBuildInput,
  {
    id = createCustomBuildId(),
    now = new Date(),
  }: {
    id?: CustomBuildId;
    now?: Date;
  } = {},
): CustomBuildStored {
  const timestamp = now.toISOString();

  return {
    ...input,
    id,
    schemaVersion: CUSTOM_BUILD_STORAGE_SCHEMA_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createCustomBuildId(): CustomBuildId {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `build-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
