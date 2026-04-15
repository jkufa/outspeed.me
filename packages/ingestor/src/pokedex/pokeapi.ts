import { ingestorConfig } from "../config";
import type { PokeApiPokemon, PokeApiPokemonSpecies } from "./types";

type Fetch = typeof fetch;
const MAX_FETCH_ATTEMPTS = 3;

export type PokeApiClientOptions = {
  baseUrl?: string;
  fetch?: Fetch;
};

export function createPokeApiClient(options: PokeApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? ingestorConfig.pokeApiBaseUrl;
  const fetchPokemonResource = options.fetch ?? fetch;

  async function fetchPokemon(slug: string): Promise<PokeApiPokemon> {
    const response = await fetchWithRetry(`${baseUrl}/pokemon/${slug}`, fetchPokemonResource);

    if (response.ok) {
      return (await response.json()) as PokeApiPokemon;
    }

    if (response.status !== 404) {
      throw new Error(`Failed to fetch ${slug}: ${response.status} ${response.statusText}`);
    }

    const fallbackSlug = await fetchDefaultPokemonVarietySlug(slug);
    const fallbackResponse = await fetchWithRetry(
      `${baseUrl}/pokemon/${fallbackSlug}`,
      fetchPokemonResource,
    );

    if (!fallbackResponse.ok) {
      throw new Error(
        `Failed to fetch ${slug} fallback ${fallbackSlug}: ${fallbackResponse.status} ${fallbackResponse.statusText}`,
      );
    }

    return (await fallbackResponse.json()) as PokeApiPokemon;
  }

  async function fetchDefaultPokemonVarietySlug(slug: string) {
    const response = await fetchWithRetry(
      `${baseUrl}/pokemon-species/${slug}`,
      fetchPokemonResource,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${slug}: ${response.status} ${response.statusText}`);
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

async function fetchWithRetry(url: string, fetchResource: Fetch) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetchResource(url);
    } catch (error) {
      lastError = error;

      if (attempt === MAX_FETCH_ATTEMPTS) break;

      await sleep(250 * attempt);
    }
  }

  throw lastError;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
