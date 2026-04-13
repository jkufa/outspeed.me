import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type CsvPokemonRow = {
  pokedexNumber: number;
  name: string;
  form: string | undefined;
  pokeApiName: string | undefined;
};

type PokeApiNamedResource = {
  name: string;
  url: string;
};

type PokeApiAbility = {
  ability: PokeApiNamedResource;
  is_hidden: boolean;
  slot: number;
};

type PokeApiStat = {
  base_stat: number;
  effort: number;
  stat: PokeApiNamedResource;
};

type PokeApiPokemon = {
  name: string;
  abilities: PokeApiAbility[];
  stats: PokeApiStat[];
};

type PokeApiPokemonVariety = {
  is_default: boolean;
  pokemon: PokeApiNamedResource;
};

type PokeApiPokemonSpecies = {
  varieties: PokeApiPokemonVariety[];
};

type NormalizedPokemon = {
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

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const SOURCE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SOURCE_DIR, "..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const DEFAULT_INPUT = resolve(REPO_ROOT, "data/champions_pokedex.csv");
const DEFAULT_OUTPUT = resolve(REPO_ROOT, "data/champions_pokedex.json");

async function main() {
  const { inputPath, outputPath } = parseArgs(Bun.argv.slice(2));
  const csvText = await Bun.file(inputPath).text();
  const rows = parsePokemonCsv(csvText);
  const pokemonBySlug = await fetchPokemonBySlug(rows.map(toPokeApiSlug));

  const normalizedPokemon = rows.map((row, index) => {
    const slug = toPokeApiSlug(row);
    const pokemon = pokemonBySlug.get(slug);

    if (!pokemon) {
      throw new Error(`Missing fetched Pokemon for "${row.name}" (${slug})`);
    }

    return normalizePokemon(index + 1, row, slug, pokemon);
  });

  await Bun.$`mkdir -p ${dirname(outputPath)}`;
  await Bun.write(outputPath, `${JSON.stringify(normalizedPokemon, null, 2)}\n`);
  console.error(`Wrote ${normalizedPokemon.length} Pokemon to ${outputPath}`);
}

function parseArgs(args: string[]) {
  const [inputArg, outputArg] = args;
  const inputPath = resolve(inputArg ?? DEFAULT_INPUT);
  const outputPath = resolve(outputArg ?? DEFAULT_OUTPUT);

  return { inputPath, outputPath };
}

function parsePokemonCsv(csvText: string): CsvPokemonRow[] {
  const [headerLine, ...dataLines] = csvText.trim().split(/\r?\n/);

  if (!headerLine) {
    throw new Error("CSV is empty");
  }

  const headers = parseCsvLine(headerLine);
  const pokedexNumberIndex = headers.indexOf("pokedex_number");
  const nameIndex = headers.indexOf("name");
  const formIndex = headers.indexOf("form");
  const pokeApiNameIndex = headers.indexOf("pokeapi_name");

  if (pokedexNumberIndex === -1 || nameIndex === -1) {
    throw new Error('CSV must include "pokedex_number" and "name" headers');
  }

  return dataLines
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const columns = parseCsvLine(line);
      const pokedexNumber = Number(columns[pokedexNumberIndex]);
      const name = columns[nameIndex]?.trim();
      const form = formIndex === -1 ? undefined : normalizeOptionalCell(columns[formIndex]);
      const pokeApiName =
        pokeApiNameIndex === -1 ? undefined : normalizeOptionalCell(columns[pokeApiNameIndex]);

      if (!Number.isInteger(pokedexNumber)) {
        throw new Error(`Invalid pokedex_number on CSV row ${index + 2}`);
      }

      if (!name) {
        throw new Error(`Missing name on CSV row ${index + 2}`);
      }

      return { pokedexNumber, name, form, pokeApiName };
    });
}

function normalizeOptionalCell(value: string | undefined) {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : undefined;
}

function parseCsvLine(line: string) {
  const columns: string[] = [];
  let currentColumn = "";
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && isQuoted && nextCharacter === '"') {
      currentColumn += character;
      index += 1;
      continue;
    }

    if (character === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (character === "," && !isQuoted) {
      columns.push(currentColumn);
      currentColumn = "";
      continue;
    }

    currentColumn += character;
  }

  columns.push(currentColumn);
  return columns;
}

async function fetchPokemonBySlug(slugs: string[]) {
  const uniqueSlugs = [...new Set(slugs)];
  const fetchedPokemon = await Promise.all(
    uniqueSlugs.map(async (slug) => [slug, await fetchPokemon(slug)] as const),
  );

  return new Map(fetchedPokemon);
}

async function fetchPokemon(slug: string): Promise<PokeApiPokemon> {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${slug}`);

  if (response.ok) {
    return (await response.json()) as PokeApiPokemon;
  }

  if (response.status !== 404) {
    throw new Error(`Failed to fetch ${slug}: ${response.status} ${response.statusText}`);
  }

  const fallbackSlug = await fetchDefaultPokemonVarietySlug(slug);
  const fallbackResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon/${fallbackSlug}`);

  if (!fallbackResponse.ok) {
    throw new Error(
      `Failed to fetch ${slug} fallback ${fallbackSlug}: ${fallbackResponse.status} ${fallbackResponse.statusText}`,
    );
  }

  return (await fallbackResponse.json()) as PokeApiPokemon;
}

async function fetchDefaultPokemonVarietySlug(slug: string) {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${slug}`);

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

function normalizePokemon(
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

function toPokeApiSlug(row: CsvPokemonRow) {
  if (row.pokeApiName) {
    return row.pokeApiName;
  }

  if (row.name.startsWith("Mega ")) {
    return toMegaPokeApiSlug(row.name);
  }

  return toBasePokeApiSlug(row.name);
}

function toMegaPokeApiSlug(name: string) {
  const baseName = name.replace(/^Mega\s+/, "");
  const variantMatch = baseName.match(/\s+([XYZ])$/);

  if (!variantMatch) {
    return `${toBasePokeApiSlug(baseName)}-mega`;
  }

  const variant = variantMatch[1]?.toLowerCase();
  const pokemonName = baseName.replace(/\s+[XYZ]$/, "");

  return `${toBasePokeApiSlug(pokemonName)}-mega-${variant}`;
}

function toBasePokeApiSlug(name: string) {
  return name
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll("'", "")
    .replaceAll(":", "")
    .replaceAll(" ", "-");
}

await main();
