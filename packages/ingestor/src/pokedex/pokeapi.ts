import { ingestorConfig } from "../config";
import type { PokeApiPokemon, PokeApiPokemonSpecies } from "./types";

type Fetch = typeof fetch;

export type PokeApiClientOptions = {
  baseUrl?: string;
  fetch?: Fetch;
};

export function createPokeApiClient(options: PokeApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? ingestorConfig.pokeApiBaseUrl;
  const fetchPokemonResource = options.fetch ?? fetch;

  async function fetchPokemon(slug: string): Promise<PokeApiPokemon> {
    const response = await fetchPokemonResource(`${baseUrl}/pokemon/${slug}`);

    if (response.ok) {
      return (await response.json()) as PokeApiPokemon;
    }

    if (response.status !== 404) {
      throw new Error(`Failed to fetch ${slug}: ${response.status} ${response.statusText}`);
    }

    const fallbackSlug = await fetchDefaultPokemonVarietySlug(slug);
    const fallbackResponse = await fetchPokemonResource(`${baseUrl}/pokemon/${fallbackSlug}`);

    if (!fallbackResponse.ok) {
      throw new Error(
        `Failed to fetch ${slug} fallback ${fallbackSlug}: ${fallbackResponse.status} ${fallbackResponse.statusText}`,
      );
    }

    return (await fallbackResponse.json()) as PokeApiPokemon;
  }

  async function fetchDefaultPokemonVarietySlug(slug: string) {
    const response = await fetchPokemonResource(`${baseUrl}/pokemon-species/${slug}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${slug}: 404 Not Found`);
    }

    const species = (await response.json()) as PokeApiPokemonSpecies;
    const defaultVariety =
      species.varieties.find((variety) => variety.is_default) ?? species.varieties[0];

    if (!defaultVariety) {
      throw new Error(`Pokemon species ${slug} has no varieties`);
    }

    return defaultVariety.pokemon.name;
  }

  return { fetchPokemon };
}
