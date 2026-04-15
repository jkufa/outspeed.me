export type Nature = "neutral" | "positive" | "negative";
export type SpeedEv = 0 | 252;
export type SpeedEffectKind = "ability" | "item" | "field" | "weather" | "terrain" | "stage";

export type SpeedSpread = {
  nature: Nature;
  evs: SpeedEv;
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

export type BoostFilter = "none" | "ability" | "item";
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
export type NatureFilter = "any" | Nature;
export type StatPointFilter = "any" | 0 | 32;

export type SpeedTierFilters = {
  search: string;
  boosts: BoostFilter[];
  fieldConditions: FieldConditionFilter[];
  nature: NatureFilter;
  statPoints: StatPointFilter;
};

export type EffectChip = {
  key: string;
  label: string;
  kind: SpeedEffectKind | "multiplier" | "condition";
};
