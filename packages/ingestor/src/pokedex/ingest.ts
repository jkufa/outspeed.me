import { normalizePokemon } from "./normalize";
import { parsePokemonCsv } from "./parse-csv";
import { createPokeApiClient } from "./pokeapi";
import { toPokeApiSlug } from "./slugs";
import type { NormalizedPokemon, PokeApiPokemon } from "./types";

export type IngestPokedexOptions = {
  fetchPokemon?: (slug: string) => Promise<PokeApiPokemon>;
};

export async function ingestPokedex(
  csvText: string,
  options: IngestPokedexOptions = {},
): Promise<NormalizedPokemon[]> {
  const rows = parsePokemonCsv(csvText);
  const fetchPokemon = options.fetchPokemon ?? createPokeApiClient().fetchPokemon;
  const slugs = rows.map(toPokeApiSlug);
  const pokemonBySlug = await fetchPokemonBySlug(slugs, fetchPokemon);

  return rows.map((row, index) => {
    const slug = slugs[index];

    if (!slug) {
      throw new Error(`Missing slug for "${row.name}"`);
    }

    const pokemon = pokemonBySlug.get(slug);

    if (!pokemon) {
      throw new Error(`Missing fetched Pokemon for "${row.name}" (${slug})`);
    }

    return normalizePokemon(index + 1, row, slug, pokemon);
  });
}

async function fetchPokemonBySlug(
  slugs: string[],
  fetchPokemon: (slug: string) => Promise<PokeApiPokemon>,
) {
  const uniqueSlugs = [...new Set(slugs)];
  const fetchedPokemon = await Promise.all(
    uniqueSlugs.map(async (slug) => [slug, await fetchPokemon(slug)] as const),
  );

  return new Map(fetchedPokemon);
}
