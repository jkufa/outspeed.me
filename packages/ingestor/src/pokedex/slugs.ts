import type { CsvPokemonRow } from "./types";

export function toPokeApiSlug(row: CsvPokemonRow) {
  if (row.pokeApiName) {
    return row.pokeApiName;
  }

  if (row.name.startsWith("Mega ")) {
    return toMegaPokeApiSlug(row.name);
  }

  return toBasePokeApiSlug(row.name);
}

export function toMegaPokeApiSlug(name: string) {
  const baseName = name.replace(/^Mega\s+/, "");
  const variantMatch = baseName.match(/\s+([XYZ])$/);

  if (!variantMatch) {
    return `${toBasePokeApiSlug(baseName)}-mega`;
  }

  const variant = variantMatch[1]?.toLowerCase();
  const pokemonName = baseName.replace(/\s+[XYZ]$/, "");

  return `${toBasePokeApiSlug(pokemonName)}-mega-${variant}`;
}

export function toBasePokeApiSlug(name: string) {
  return name
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll("'", "")
    .replaceAll(":", "")
    .replaceAll(" ", "-");
}
