import { parseCsvLine } from "../parser/csv";
import type { CsvPokemonRow } from "./types";

export function parsePokemonCsv(csvText: string): CsvPokemonRow[] {
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
