import type { Nature } from "../speed-tiers";
import { CUSTOM_BUILD_STORAGE_SCHEMA_VERSION } from "./types";
import type {
  CustomBuildId,
  CustomBuildOrigin,
  CustomBuildPokemonRuntimeData,
  CustomBuildSpeedTierPokemon,
  CustomSpeedCalculationResult,
} from "./types";

export type CustomBuildCombinationIdentity = {
  buildId: CustomBuildId;
  speciesId: number;
  nature: Nature;
  speedStatPoints: number;
  abilitySource: string | null;
  itemSource: string | null;
};

export type CustomBuildRowConversionInput = {
  buildId: CustomBuildId;
  origin: CustomBuildOrigin;
  label: string;
  species: CustomBuildPokemonRuntimeData;
  nature: Nature;
  calculation: CustomSpeedCalculationResult;
  abilitySource: string | null;
  itemSource: string | null;
};

export function buildCustomCombinationId(identity: CustomBuildCombinationIdentity) {
  return [
    `custom:${identity.buildId}`,
    `species:${identity.speciesId}`,
    `nature:${identity.nature}`,
    `sp:${identity.speedStatPoints}`,
    `ability:${identity.abilitySource ?? "none"}`,
    `item:${identity.itemSource ?? "none"}`,
  ].join("|");
}

export function toCustomSpeedTierPokemon({
  abilitySource,
  buildId,
  calculation,
  itemSource,
  label,
  nature,
  origin,
  species,
}: CustomBuildRowConversionInput): CustomBuildSpeedTierPokemon {
  return {
    combinationId: buildCustomCombinationId({
      buildId,
      speciesId: species.id,
      nature,
      speedStatPoints: calculation.statPoints,
      abilitySource,
      itemSource,
    }),
    id: species.id,
    slug: species.slug,
    pokedexNo: species.pokedexNo,
    name: label,
    sprite: species.sprite,
    spread: {
      nature,
      evs: calculation.evs,
      statPoints: calculation.statPoints,
      ivs: calculation.ivs,
      level: calculation.level,
      rawSpeed: calculation.rawSpeed,
    },
    effects: calculation.effects,
    finalSpeed: calculation.finalSpeed,
    source: {
      kind: "custom-build",
      buildId,
      origin,
      storageSchemaVersion: CUSTOM_BUILD_STORAGE_SCHEMA_VERSION,
      label,
    },
  };
}
