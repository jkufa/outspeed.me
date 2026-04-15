import { normalizePokemon } from "./normalize";
import { parsePokemonCsv } from "./parse-csv";
import { createPokeApiClient } from "./pokeapi";
import { toPokeApiSlug } from "./slugs";
import type { CsvPokemonRow, NormalizedPokemon, PokeApiPokemon } from "./types";

const MAX_FETCH_CONCURRENCY = 12;

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

  const displayNames = buildDisplayNames(rows, slugs, pokemonBySlug);

  return rows.map((row, index) => {
    const slug = slugs[index];

    if (!slug) {
      throw new Error(`Missing slug for "${row.name}"`);
    }

    const pokemon = pokemonBySlug.get(slug);

    if (!pokemon) {
      throw new Error(`Missing fetched Pokemon for "${row.name}" (${slug})`);
    }

    return normalizePokemon(
      index + 1,
      { ...row, name: displayNames[index] ?? row.name },
      slug,
      pokemon,
    );
  });
}

async function fetchPokemonBySlug(
  slugs: string[],
  fetchPokemon: (slug: string) => Promise<PokeApiPokemon>,
) {
  const uniqueSlugs = [...new Set(slugs)];
  const fetchedPokemon = await mapWithConcurrency(
    uniqueSlugs,
    MAX_FETCH_CONCURRENCY,
    async (slug) => [slug, await fetchPokemon(slug)] as const,
  );

  return new Map(fetchedPokemon);
}

async function mapWithConcurrency<TValue, TResult>(
  values: TValue[],
  concurrency: number,
  mapper: (value: TValue) => Promise<TResult>,
) {
  const results = Array.from<TResult | undefined>({ length: values.length });
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      const value = values[index];

      if (value === undefined) continue;

      results[index] = await mapper(value);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, async () => {
      await worker();
    }),
  );

  return results.filter((result) => result !== undefined);
}

function buildDisplayNames(
  rows: CsvPokemonRow[],
  slugs: string[],
  pokemonBySlug: Map<string, PokeApiPokemon>,
) {
  const displayNames = rows.map((row) => row.name);

  for (const group of groupRowsBySpeciesName(rows)) {
    const baseIndex = group.find((index) => rows[index]?.form === undefined);

    if (baseIndex !== undefined) {
      const baseSignature = getMechanicalSignature(slugs[baseIndex], pokemonBySlug);

      for (const index of group) {
        const row = rows[index];

        if (row?.form === undefined) continue;

        if (getMechanicalSignature(slugs[index], pokemonBySlug) !== baseSignature) {
          displayNames[index] = formatFormDisplayName(row);
        }
      }

      continue;
    }

    const signatures = new Set(
      group.map((index) => getMechanicalSignature(slugs[index], pokemonBySlug)),
    );

    if (signatures.size <= 1) continue;

    for (const index of group) {
      const row = rows[index];

      if (row?.form !== undefined) {
        displayNames[index] = formatFormDisplayName(row);
      }
    }
  }

  return displayNames;
}

function groupRowsBySpeciesName(rows: CsvPokemonRow[]) {
  const groups = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const key = `${row.pokedexNumber}:${row.name}`;
    groups.set(key, [...(groups.get(key) ?? []), index]);
  });

  return groups.values();
}

function getMechanicalSignature(
  slug: string | undefined,
  pokemonBySlug: Map<string, PokeApiPokemon>,
) {
  const pokemon = slug === undefined ? undefined : pokemonBySlug.get(slug);

  if (pokemon === undefined) {
    throw new Error(`Missing fetched Pokemon for mechanical comparison (${slug ?? "unknown"})`);
  }

  return JSON.stringify({
    abilities: pokemon.abilities
      .map((ability) => ({
        name: ability.ability.name,
        isHidden: ability.is_hidden,
        slot: ability.slot,
      }))
      .sort((left, right) => left.slot - right.slot || left.name.localeCompare(right.name)),
    stats: pokemon.stats
      .map((stat) => [stat.stat.name, stat.base_stat] as const)
      .sort(([leftName], [rightName]) => leftName.localeCompare(rightName)),
    types: pokemon.types
      .map((type) => ({ name: type.type.name, slot: type.slot }))
      .sort((left, right) => left.slot - right.slot || left.name.localeCompare(right.name)),
  });
}

function formatFormDisplayName(row: CsvPokemonRow) {
  if (row.form === undefined) return row.name;

  return `${row.name} ${toTitleCase(row.form)}`;
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
