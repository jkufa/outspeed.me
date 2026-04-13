import { describe, expect, it } from "vitest";
import { toPokeApiSlug } from "../slugs";
import type { CsvPokemonRow } from "../types";

function row(name: string, pokeApiName?: string): CsvPokemonRow {
  return {
    pokedexNumber: 1,
    name,
    form: undefined,
    pokeApiName,
  };
}

describe("toPokeApiSlug", () => {
  it("normalizes punctuation in base names", () => {
    expect(toPokeApiSlug(row("Mr. Mime"))).toBe("mr-mime");
    expect(toPokeApiSlug(row("Farfetch'd"))).toBe("farfetchd");
    expect(toPokeApiSlug(row("Type: Null"))).toBe("type-null");
  });

  it("normalizes mega variants", () => {
    expect(toPokeApiSlug(row("Mega Charizard X"))).toBe("charizard-mega-x");
    expect(toPokeApiSlug(row("Mega Charizard Y"))).toBe("charizard-mega-y");
    expect(toPokeApiSlug(row("Mega Venusaur"))).toBe("venusaur-mega");
  });

  it("uses explicit PokeAPI names first", () => {
    expect(toPokeApiSlug(row("Mega Charizard X", "custom-slug"))).toBe("custom-slug");
  });
});
