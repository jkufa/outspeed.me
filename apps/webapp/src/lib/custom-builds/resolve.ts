import type { SpeedTier, SpeedTierPokemon } from "../speed-tiers";
import { calculateCustomSpeed } from "./speed-calculator";
import type { ShowdownParsedBuild } from "./showdown-parser";
import { toCustomSpeedTierPokemon } from "./row-contract";
import type {
  CustomBuildInput,
  CustomBuildPokemonRuntimeData,
  CustomBuildResolved,
  CustomBuildSpeciesRef,
  CustomBuildStored,
  CustomBuildValidationIssue,
  UnsupportedSpeedModifier,
} from "./types";
import {
  isSupportedCustomBuildModifier,
  normalizeModifierSource,
  validateCustomBuildStored,
} from "./validation";

export type CustomBuildSpeciesLookup = {
  species: CustomBuildPokemonRuntimeData[];
  hasSpecies: (species: CustomBuildSpeciesRef) => boolean;
  resolveSpecies: (species: CustomBuildSpeciesRef) => CustomBuildPokemonRuntimeData | null;
  resolveShowdownSpecies: (
    species: ShowdownParsedBuild["species"],
  ) => CustomBuildPokemonRuntimeData | null;
};

export type CustomBuildResolveResult =
  | {
      ok: true;
      resolved: CustomBuildResolved;
    }
  | {
      ok: false;
      build: CustomBuildStored;
      issues: CustomBuildValidationIssue[];
      strippedModifiers: UnsupportedSpeedModifier[];
    };

export type CustomBuildsResolveResult = {
  resolved: CustomBuildResolved[];
  failures: Exclude<CustomBuildResolveResult, { ok: true }>[];
};

export type ShowdownBuildInputResolveResult =
  | {
      ok: true;
      input: CustomBuildInput;
      strippedModifiers: UnsupportedSpeedModifier[];
    }
  | {
      ok: false;
      issues: CustomBuildValidationIssue[];
      strippedModifiers: UnsupportedSpeedModifier[];
    };

type SpeciesLookupEntry = CustomBuildPokemonRuntimeData & {
  keys: Set<string>;
  candidateBaseSpeeds: Set<number>;
};

export function buildCustomBuildSpeciesLookup(
  tiers: readonly SpeedTier[],
): CustomBuildSpeciesLookup {
  const entriesById = new Map<number, SpeciesLookupEntry>();
  const entriesByKey = new Map<string, CustomBuildPokemonRuntimeData>();

  for (const row of tiers.flatMap((tier) => tier.pokemon)) {
    const candidates = deriveBaseSpeedCandidates(row);
    if (candidates.size === 0) {
      continue;
    }

    const existing = entriesById.get(row.id);
    if (existing) {
      existing.candidateBaseSpeeds = intersect(existing.candidateBaseSpeeds, candidates);
      addSpeciesKeys(existing, row);
      continue;
    }

    const entry: SpeciesLookupEntry = {
      id: row.id,
      slug: row.slug,
      pokedexNo: row.pokedexNo,
      name: row.name,
      baseSpeed: Math.min(...candidates),
      sprite: row.sprite,
      keys: new Set(),
      candidateBaseSpeeds: candidates,
    };
    entriesById.set(row.id, entry);
    addSpeciesKeys(entry, row);
  }

  const species = [...entriesById.values()]
    .map((entry) => {
      const baseSpeed =
        entry.candidateBaseSpeeds.size > 0
          ? Math.min(...entry.candidateBaseSpeeds)
          : entry.baseSpeed;

      return {
        id: entry.id,
        slug: entry.slug,
        pokedexNo: entry.pokedexNo,
        name: entry.name,
        baseSpeed,
        sprite: entry.sprite,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);

  const runtimeById = new Map<number, CustomBuildPokemonRuntimeData>(
    species.map((entry) => [entry.id, entry]),
  );
  for (const entry of entriesById.values()) {
    const runtime = runtimeById.get(entry.id);
    if (runtime === undefined) {
      continue;
    }

    for (const key of entry.keys) {
      entriesByKey.set(key, runtime);
    }
  }

  const resolveSpecies = (speciesRef: CustomBuildSpeciesRef) =>
    runtimeById.get(speciesRef.id) ?? entriesByKey.get(speciesKey(speciesRef.slug)) ?? null;

  return {
    species,
    hasSpecies(speciesRef) {
      return resolveSpecies(speciesRef) !== null;
    },
    resolveSpecies,
    resolveShowdownSpecies(speciesRef) {
      const keys = [
        speciesRef.raw,
        speciesRef.name,
        speciesRef.form === undefined ? null : `${speciesRef.name}-${speciesRef.form}`,
        speciesRef.form === undefined ? null : `${speciesRef.name} ${speciesRef.form}`,
      ];

      for (const key of keys) {
        if (key === null) {
          continue;
        }

        const entry = entriesByKey.get(speciesKey(key));
        if (entry !== undefined) {
          return entry;
        }
      }

      return null;
    },
  };
}

export function resolveCustomBuild(
  build: CustomBuildStored,
  lookup: CustomBuildSpeciesLookup,
): CustomBuildResolveResult {
  const strippedModifiers = findUnsupportedModifiers(build);
  const validation = validateCustomBuildStored(build, {
    hasSpecies: (species) => lookup.hasSpecies(species),
  });
  const blockingIssues = validation.ok
    ? []
    : validation.issues.filter(
        (issue) => issue.code !== "invalid-ability" && issue.code !== "invalid-item",
      );

  if (blockingIssues.length > 0) {
    return {
      ok: false,
      build,
      issues: blockingIssues,
      strippedModifiers,
    };
  }

  const pokemon = lookup.resolveSpecies(build.species);
  if (pokemon === null) {
    return {
      ok: false,
      build,
      issues: [
        {
          code: "invalid-species",
          message: `${build.species.name} is not available in the current Champions speed tier data`,
          path: "species",
        },
      ],
      strippedModifiers,
    };
  }

  const ability = strippedModifiers.some((modifier) => modifier.kind === "ability")
    ? null
    : build.ability;
  const item = strippedModifiers.some((modifier) => modifier.kind === "item") ? null : build.item;
  const calculation = calculateCustomSpeed({
    baseSpeed: pokemon.baseSpeed,
    statPoints: build.speedStatPoints,
    nature: build.nature,
    ability,
    item,
  });
  const label = build.nickname?.trim() || pokemon.name;
  const row = toCustomSpeedTierPokemon({
    buildId: build.id,
    origin: build.origin,
    label,
    species: pokemon,
    nature: build.nature,
    calculation,
    abilitySource: ability?.source ?? null,
    itemSource: item?.source ?? null,
  });

  return {
    ok: true,
    resolved: {
      build,
      pokemon,
      calculation,
      row,
      strippedModifiers,
    },
  };
}

export function resolveCustomBuilds(
  builds: readonly CustomBuildStored[],
  lookup: CustomBuildSpeciesLookup,
): CustomBuildsResolveResult {
  const resolved: CustomBuildResolved[] = [];
  const failures: CustomBuildsResolveResult["failures"] = [];

  for (const build of builds) {
    const result = resolveCustomBuild(build, lookup);
    if (result.ok) {
      resolved.push(result.resolved);
    } else {
      failures.push(result);
    }
  }

  return { resolved, failures };
}

export function resolveShowdownBuildInput(
  build: ShowdownParsedBuild,
  lookup: CustomBuildSpeciesLookup,
): ShowdownBuildInputResolveResult {
  const species = lookup.resolveShowdownSpecies(build.species);
  const strippedModifiers = build.unsupportedSpeedModifiers;

  if (species === null) {
    return {
      ok: false,
      strippedModifiers,
      issues: [
        {
          code: "invalid-species",
          message: `${build.species.raw} is not available in the current Champions speed tier data`,
          path: "species",
        },
      ],
    };
  }

  return {
    ok: true,
    strippedModifiers,
    input: {
      species: {
        id: species.id,
        slug: species.slug,
        pokedexNo: species.pokedexNo,
        name: species.name,
      },
      nature: build.nature ?? "neutral",
      speedStatPoints: build.speed?.statPoints ?? 0,
      ability: build.ability,
      item: build.item,
      nickname: build.nickname,
      origin: "showdown",
    },
  };
}

export function toCustomSpeedTiers(resolved: readonly CustomBuildResolved[]): SpeedTier[] {
  const rowsBySpeed = new Map<number, SpeedTierPokemon[]>();

  for (const { row } of resolved) {
    const rows = rowsBySpeed.get(row.finalSpeed) ?? [];
    rows.push(row);
    rowsBySpeed.set(row.finalSpeed, rows);
  }

  return [...rowsBySpeed.entries()]
    .sort(([leftSpeed], [rightSpeed]) => rightSpeed - leftSpeed)
    .map(([speed, pokemon]) => ({ speed, pokemon }));
}

export function mergeCustomSpeedTiers(
  builtInTiers: readonly SpeedTier[],
  customTiers: readonly SpeedTier[],
): SpeedTier[] {
  const rowsBySpeed = new Map<number, SpeedTierPokemon[]>();

  for (const tier of builtInTiers) {
    rowsBySpeed.set(tier.speed, [...tier.pokemon]);
  }

  for (const tier of customTiers) {
    const rows = rowsBySpeed.get(tier.speed) ?? [];
    rows.push(...tier.pokemon);
    rowsBySpeed.set(tier.speed, rows);
  }

  return [...rowsBySpeed.entries()]
    .sort(([leftSpeed], [rightSpeed]) => rightSpeed - leftSpeed)
    .map(([speed, pokemon]) => ({ speed, pokemon }));
}

function addSpeciesKeys(entry: SpeciesLookupEntry, row: SpeedTierPokemon) {
  entry.keys.add(speciesKey(row.slug));
  entry.keys.add(speciesKey(row.name));
  entry.keys.add(speciesKey(String(row.id)));
  entry.keys.add(speciesKey(String(row.pokedexNo)));
}

function deriveBaseSpeedCandidates(row: SpeedTierPokemon) {
  const candidates = new Set<number>();
  const statPoints = row.spread.statPoints ?? evsToStatPoints(row.spread.evs);

  for (let baseSpeed = 1; baseSpeed <= 255; baseSpeed += 1) {
    const calculation = calculateCustomSpeed({
      baseSpeed,
      statPoints,
      nature: row.spread.nature,
      ability: null,
      item: null,
      level: row.spread.level,
      ivs: row.spread.ivs,
    });

    if (calculation.rawSpeed === row.spread.rawSpeed) {
      candidates.add(baseSpeed);
    }
  }

  return candidates;
}

function evsToStatPoints(evs: number) {
  if (evs === 0) {
    return 0;
  }

  return Math.min(Math.floor((evs + 4) / 8), 32);
}

function findUnsupportedModifiers(build: CustomBuildStored): UnsupportedSpeedModifier[] {
  return [build.ability, build.item].flatMap((modifier) => {
    if (modifier === null) {
      return [];
    }

    const normalizedSource = normalizeModifierSource(modifier.source);
    if (isSupportedCustomBuildModifier({ ...modifier, source: normalizedSource }, modifier.kind)) {
      return [];
    }

    return [
      {
        kind: modifier.kind,
        source: normalizedSource,
        label: modifier.label,
        reason: "unsupported" as const,
      },
    ];
  });
}

function speciesKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function intersect(left: Set<number>, right: Set<number>) {
  return new Set([...left].filter((value) => right.has(value)));
}
