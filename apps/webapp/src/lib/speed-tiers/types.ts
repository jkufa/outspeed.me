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

export type SpeedTierPokemon = {
  id: number;
  pokedexNo: number;
  name: string;
  spread: SpeedSpread;
  effects: SpeedEffect[];
  finalSpeed: number;
};

export type SpeedTier = {
  speed: number;
  pokemon: SpeedTierPokemon[];
};

export type BoostFilter = "none" | "ability" | "item";
export type WeatherFilter = "any" | "sun" | "rain" | "sand" | "snow";
export type NatureFilter = "any" | Nature;
export type StatPointFilter = "any" | 0 | 32;

export type SpeedTierFilters = {
  search: string;
  boosts: BoostFilter[];
  weather: WeatherFilter;
  nature: NatureFilter;
  statPoints: StatPointFilter;
};

export type EffectChip = {
  key: string;
  label: string;
  kind: SpeedEffectKind | "multiplier" | "condition";
};
