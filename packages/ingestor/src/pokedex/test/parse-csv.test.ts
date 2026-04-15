import { describe, expect, it } from "vitest";
import { parsePokemonCsv } from "../parse-csv";

describe("parsePokemonCsv", () => {
  it("parses required and optional columns", () => {
    expect(
      parsePokemonCsv(
        [
          "pokedex_number,name,form,pokeapi_name",
          "6,Mega Charizard X,mega-x,charizard-mega-x",
          "25,Pikachu,,",
        ].join("\n"),
      ),
    ).toEqual([
      {
        pokedexNumber: 6,
        name: "Mega Charizard X",
        form: "mega-x",
        pokeApiName: "charizard-mega-x",
      },
      {
        pokedexNumber: 25,
        name: "Pikachu",
        form: undefined,
        pokeApiName: undefined,
      },
    ]);
  });

  it("skips comment lines", () => {
    expect(
      parsePokemonCsv(
        [
          "pokedex_number,name,form,pokeapi_name",
          "# Gourgeist uses new Variety display names while PokeAPI keeps old slugs.",
          "711,Gourgeist,medium-variety,gourgeist-average",
        ].join("\n"),
      ),
    ).toEqual([
      {
        pokedexNumber: 711,
        name: "Gourgeist",
        form: "medium-variety",
        pokeApiName: "gourgeist-average",
      },
    ]);
  });

  it("requires pokedex_number and name headers", () => {
    expect(() => parsePokemonCsv("name\nPikachu")).toThrow(
      'CSV must include "pokedex_number" and "name" headers',
    );
  });

  it("rejects invalid pokedex numbers", () => {
    expect(() => parsePokemonCsv("pokedex_number,name\nnope,Pikachu")).toThrow(
      "Invalid pokedex_number on CSV row 2",
    );
  });

  it("rejects missing names", () => {
    expect(() => parsePokemonCsv("pokedex_number,name\n25,")).toThrow("Missing name on CSV row 2");
  });
});
