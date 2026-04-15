import { describe, expect, it } from "vitest";
import { ingestPokedex } from "../ingest";
import type { PokeApiPokemon } from "../types";

function pokemon(overrides: Partial<PokeApiPokemon> = {}): PokeApiPokemon {
  return {
    name: "pokemon",
    abilities: [
      {
        ability: { name: "overgrow", url: "https://pokeapi.co/api/v2/ability/65/" },
        is_hidden: false,
        slot: 1,
      },
    ],
    stats: [
      {
        base_stat: 100,
        effort: 0,
        stat: { name: "speed", url: "https://pokeapi.co/api/v2/stat/6/" },
      },
    ],
    types: [
      {
        slot: 1,
        type: { name: "normal", url: "https://pokeapi.co/api/v2/type/1/" },
      },
    ],
    ...overrides,
  };
}

function csv(rows: string[]) {
  return ["pokedex_number,name,form,pokeapi_name", ...rows].join("\n");
}

describe("ingestPokedex", () => {
  it("adds form names when a form differs from the base Pokemon", async () => {
    const pokedex = await ingestPokedex(
      csv(["59,Arcanine,,arcanine", "59,Arcanine,hisui,arcanine-hisui"]),
      {
        fetchPokemon: async (slug) =>
          slug === "arcanine-hisui"
            ? pokemon({
                name: slug,
                abilities: [
                  {
                    ability: {
                      name: "rock-head",
                      url: "https://pokeapi.co/api/v2/ability/69/",
                    },
                    is_hidden: true,
                    slot: 3,
                  },
                ],
              })
            : pokemon({ name: slug }),
      },
    );

    expect(pokedex.map((entry) => entry.name)).toEqual(["Arcanine", "Arcanine Hisui"]);
  });

  it("adds form names when same-name forms differ without a base row", async () => {
    const pokedex = await ingestPokedex(
      csv([
        "711,Gourgeist,medium-variety,gourgeist-average",
        "711,Gourgeist,small-variety,gourgeist-small",
      ]),
      {
        fetchPokemon: async (slug) =>
          pokemon({
            name: slug,
            stats: [
              {
                base_stat: slug === "gourgeist-small" ? 99 : 84,
                effort: 0,
                stat: { name: "speed", url: "https://pokeapi.co/api/v2/stat/6/" },
              },
            ],
          }),
      },
    );

    expect(pokedex.map((entry) => entry.name)).toEqual([
      "Gourgeist Medium Variety",
      "Gourgeist Small Variety",
    ]);
  });

  it("keeps cosmetic form names plain when mechanics match", async () => {
    const pokedex = await ingestPokedex(
      csv([
        "925,Maushold,family-of-four,maushold-family-of-four",
        "925,Maushold,family-of-three,maushold-family-of-three",
      ]),
      {
        fetchPokemon: async (slug) => pokemon({ name: slug }),
      },
    );

    expect(pokedex.map((entry) => entry.name)).toEqual(["Maushold", "Maushold"]);
  });

  it("treats typing as a mechanical form difference", async () => {
    const pokedex = await ingestPokedex(csv(["479,Rotom,,rotom", "479,Rotom,wash,rotom-wash"]), {
      fetchPokemon: async (slug) =>
        slug === "rotom-wash"
          ? pokemon({
              name: slug,
              types: [
                {
                  slot: 1,
                  type: { name: "electric", url: "https://pokeapi.co/api/v2/type/13/" },
                },
                {
                  slot: 2,
                  type: { name: "water", url: "https://pokeapi.co/api/v2/type/11/" },
                },
              ],
            })
          : pokemon({ name: slug }),
    });

    expect(pokedex.map((entry) => entry.name)).toEqual(["Rotom", "Rotom Wash"]);
  });
});
