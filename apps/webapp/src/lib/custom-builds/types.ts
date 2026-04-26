import type {
  Nature,
  PokemonSprite,
  SpeedEffect,
  SpeedInvestmentEvs,
  SpeedSpread,
  SpeedStatPoints,
  SpeedTierPokemon,
  SpeedTierRowSource,
} from "../speed-tiers";

export const CUSTOM_BUILD_STORAGE_SCHEMA_VERSION = 1 as const;
export const CUSTOM_BUILD_STORAGE_KEY = "outspeed.me:custom-builds:v1" as const;

export type CustomBuildStorageSchemaVersion = typeof CUSTOM_BUILD_STORAGE_SCHEMA_VERSION;
export type CustomBuildId = string;
export type CustomBuildOrigin = "manual" | "showdown";
export type IsoDateTimeString = string;

export type CustomBuildSpeciesRef = {
  id: number;
  slug: string;
  pokedexNo: number;
  name: string;
};

export type CustomBuildModifierKind = "ability" | "item";

export type CustomBuildModifierInput = {
  kind: CustomBuildModifierKind;
  source: string;
  label?: string;
};

export type CustomBuildInput = {
  species: CustomBuildSpeciesRef;
  nature: Nature;
  speedStatPoints: SpeedStatPoints;
  ability: CustomBuildModifierInput | null;
  item: CustomBuildModifierInput | null;
  nickname?: string;
  origin: CustomBuildOrigin;
};

export type CustomBuildStored = CustomBuildInput & {
  id: CustomBuildId;
  schemaVersion: CustomBuildStorageSchemaVersion;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
};

export type CustomBuildStorageEnvelope = {
  schemaVersion: CustomBuildStorageSchemaVersion;
  builds: CustomBuildStored[];
};

export type CustomBuildPokemonRuntimeData = CustomBuildSpeciesRef & {
  baseSpeed: number;
  sprite: PokemonSprite | null;
};

export type CustomBuildSpeedSpread = Omit<SpeedSpread, "evs" | "statPoints"> & {
  evs: SpeedInvestmentEvs;
  statPoints: SpeedStatPoints;
};

export type CustomBuildRowSource = Extract<SpeedTierRowSource, { kind: "custom-build" }>;

export type CustomBuildSpeedTierPokemon = Omit<SpeedTierPokemon, "source" | "spread"> & {
  spread: CustomBuildSpeedSpread;
  source: CustomBuildRowSource;
};

export type SpeedCalculationStep = {
  label: string;
  speed: number;
  multiplier?: number;
};

export type CustomSpeedCalculationResult = {
  rawSpeed: number;
  finalSpeed: number;
  evs: SpeedInvestmentEvs;
  statPoints: SpeedStatPoints;
  ivs: number;
  level: number;
  effects: SpeedEffect[];
  steps: SpeedCalculationStep[];
};

export type UnsupportedSpeedModifier = {
  kind: CustomBuildModifierKind;
  source: string;
  label?: string;
  reason: "unsupported" | "unknown" | "not-speed-affecting";
  rawText?: string;
};

export type SupportedSpeedModifierMetadata = {
  kind: CustomBuildModifierKind;
  source: string;
  label: string;
  effectKind: SpeedEffect["kind"];
  multiplier?: number;
  stage?: number;
  condition?: string;
  supportedOrigins: CustomBuildOrigin[];
};

export type CustomBuildResolved = {
  build: CustomBuildStored;
  pokemon: CustomBuildPokemonRuntimeData;
  calculation: CustomSpeedCalculationResult;
  row: CustomBuildSpeedTierPokemon;
  strippedModifiers: UnsupportedSpeedModifier[];
};
