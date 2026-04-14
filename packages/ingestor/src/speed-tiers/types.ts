export type HeldItem = "choice-scarf";
export type Nature = "neutral" | "positive" | "negative";
export type SpeedEv = 0 | 252;
export type SpeedEffectKind = "ability" | "item" | "field" | "weather" | "terrain" | "stage";

export type PokedexPokemon = {
  id: number;
  slug: string;
  pokedexNumber: number;
  name: string;
  abilities: {
    name: string;
  }[];
  stats: Record<string, number>;
};

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

export type SpeedCalculationStep = {
  label: string;
  speed: number;
  multiplier?: number;
};

export type SpeedCalculation = {
  rawSpeed: number;
  finalSpeed: number;
  effects: SpeedEffect[];
  steps: SpeedCalculationStep[];
};

export type SpeedTierPokemon = {
  combinationId: string;
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

export type SpeedTierCombination = SpeedTierPokemon & {
  speed: number;
};

export type CombinationContext = {
  pokemon: PokedexPokemon;
  evs: SpeedEv;
  nature: Nature;
  ability: string | null;
  item: HeldItem | null;
};

export type CombinationRule = {
  name: string;
  shouldInclude: (context: CombinationContext) => boolean;
};
