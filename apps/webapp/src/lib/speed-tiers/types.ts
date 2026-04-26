export type Nature = "neutral" | "positive" | "negative";
export type SpeedEv = 0 | 252;
export type SpeedInvestmentEvs = number;
export type SpeedStatPoints = number;
export type SpeedEffectKind = "ability" | "item" | "field" | "weather" | "terrain" | "stage";

export type SpeedTierRowSource =
  | {
      kind: "built-in";
    }
  | {
      kind: "custom-build";
      buildId: string;
      origin: "manual" | "showdown";
      storageSchemaVersion: number;
      label: string;
    };

export type SpeedSpread = {
  nature: Nature;
  evs: SpeedInvestmentEvs;
  statPoints?: SpeedStatPoints;
  ivs: number;
  level: number;
  rawSpeed: number;
};

export type SpeedEffect = {
  kind: SpeedEffectKind;
  source: string;
  label: string;
  multiplier?: number;
  stage?: number;
  condition?: string;
};

export type PokemonSprite = {
  filename: string;
  path: string;
  sourceUrl: string;
};

export type SpeedTierPokemon = {
  combinationId: string;
  id: number;
  slug: string;
  pokedexNo: number;
  name: string;
  sprite: PokemonSprite | null;
  spread: SpeedSpread;
  effects: SpeedEffect[];
  finalSpeed: number;
  source?: SpeedTierRowSource;
};

export type SpeedTier = {
  speed: number;
  pokemon: SpeedTierPokemon[];
};

export type SpeedTierDisplayMember = {
  id: number;
  slug: string;
  pokedexNo: number;
  name: string;
  sprite: PokemonSprite | null;
};

export type SpeedTierDisplayPokemon = Omit<SpeedTierPokemon, "effects"> & {
  members: SpeedTierDisplayMember[];
  effects: SpeedEffect[];
  sourceEffects: SpeedEffect[];
};

export type SpeedTierDisplayTier = {
  speed: number;
  pokemon: SpeedTierDisplayPokemon[];
};

export const fieldConditionFilterValues = [
  "sun",
  "rain",
  "sand",
  "snow",
  "electric-terrain",
  "grassy-terrain",
  "misty-terrain",
  "psychic-terrain",
  "tailwind",
] as const;
export type FieldConditionFilter = (typeof fieldConditionFilterValues)[number];

export const itemFilterValues = ["choice-scarf"] as const;
export type ItemFilter = (typeof itemFilterValues)[number];

export const spreadFilterKeys = [
  "positive-252",
  "positive-0",
  "neutral-252",
  "neutral-0",
  "negative-0",
] as const;
export type SpreadFilterKey = (typeof spreadFilterKeys)[number];

export type SpeedTierFilters = {
  /** Pokedex numbers; empty = no species restriction. */
  pokemon: number[];
  items: ItemFilter[];
  fieldConditions: FieldConditionFilter[];
  spreads: SpreadFilterKey[];
};

export type EffectChip = {
  key: string;
  label: string;
  kind: SpeedEffectKind | "multiplier" | "condition";
};
