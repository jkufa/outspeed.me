export type CsvPokemonRow = {
  pokedexNumber: number;
  name: string;
  form: string | undefined;
  pokeApiName: string | undefined;
};

export type PokeApiNamedResource = {
  name: string;
  url: string;
};

export type PokeApiAbility = {
  ability: PokeApiNamedResource;
  is_hidden: boolean;
  slot: number;
};

export type PokeApiStat = {
  base_stat: number;
  effort: number;
  stat: PokeApiNamedResource;
};

export type PokeApiPokemon = {
  name: string;
  abilities: PokeApiAbility[];
  stats: PokeApiStat[];
};

export type PokeApiPokemonVariety = {
  is_default: boolean;
  pokemon: PokeApiNamedResource;
};

export type PokeApiPokemonSpecies = {
  varieties: PokeApiPokemonVariety[];
};

export type NormalizedPokemon = {
  id: number;
  slug: string;
  pokedexNumber: number;
  name: string;
  abilities: {
    name: string;
    isHidden: boolean;
    slot: number;
  }[];
  stats: Record<string, number>;
};
