export type HeldItem = "choice-scarf";
export type Nature = "neutral" | "positive" | "negative";
export type SpeedEv = 0 | 252;

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

export type SpeedTierPokemon = {
  id: number;
  pokedex_no: number;
  name: string;
  EVs: SpeedEv;
  ability: string | null;
  nature: Nature;
  item: HeldItem | null;
};

export type SpeedTier = {
  tier: number;
  pokemon: SpeedTierPokemon[];
};

export type SpeedTierCombination = SpeedTierPokemon & {
  tier: number;
};

export type CombinationContext = {
  evs: SpeedEv;
  nature: Nature;
  ability: string | null;
  item: HeldItem | null;
};

export type CombinationRule = {
  name: string;
  shouldInclude: (context: CombinationContext) => boolean;
};
