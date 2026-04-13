import type { CsvPokemonRow, NormalizedPokemon, PokeApiPokemon } from "./types";

export function normalizePokemon(
  id: number,
  row: CsvPokemonRow,
  slug: string,
  pokemon: PokeApiPokemon,
): NormalizedPokemon {
  return {
    id,
    slug,
    pokedexNumber: row.pokedexNumber,
    name: row.name,
    abilities: pokemon.abilities.map((ability) => ({
      name: ability.ability.name,
      isHidden: ability.is_hidden,
      slot: ability.slot,
    })),
    stats: Object.fromEntries(pokemon.stats.map((stat) => [stat.stat.name, stat.base_stat])),
  };
}
