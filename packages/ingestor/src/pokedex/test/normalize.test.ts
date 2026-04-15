import { describe, expect, it } from "vitest";
import { normalizePokemon } from "../normalize";

describe("normalizePokemon", () => {
  it("maps PokeAPI abilities and stats into the local pokedex shape", () => {
    expect(
      normalizePokemon(
        1,
        {
          pokedexNumber: 25,
          name: "Pikachu",
          form: undefined,
          pokeApiName: undefined,
        },
        "pikachu",
        {
          name: "pikachu",
          abilities: [
            {
              ability: { name: "static", url: "https://pokeapi.co/api/v2/ability/9/" },
              is_hidden: false,
              slot: 1,
            },
            {
              ability: { name: "lightning-rod", url: "https://pokeapi.co/api/v2/ability/31/" },
              is_hidden: true,
              slot: 3,
            },
          ],
          stats: [
            {
              base_stat: 90,
              effort: 2,
              stat: { name: "speed", url: "https://pokeapi.co/api/v2/stat/6/" },
            },
          ],
          types: [
            {
              slot: 1,
              type: { name: "electric", url: "https://pokeapi.co/api/v2/type/13/" },
            },
          ],
        },
      ),
    ).toEqual({
      id: 1,
      slug: "pikachu",
      pokedexNumber: 25,
      name: "Pikachu",
      abilities: [
        { name: "static", isHidden: false, slot: 1 },
        { name: "lightning-rod", isHidden: true, slot: 3 },
      ],
      stats: {
        speed: 90,
      },
    });
  });
});
