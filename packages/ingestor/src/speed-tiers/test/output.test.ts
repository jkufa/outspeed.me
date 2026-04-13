import { describe, expect, it } from "vitest";
import { groupBySpeedTier, speedTiersToCsv } from "../output";

describe("groupBySpeedTier", () => {
  it("sorts tiers descending and Pokemon by pokedex number, id, then name", () => {
    expect(
      groupBySpeedTier([
        {
          tier: 100,
          id: 2,
          pokedex_no: 25,
          name: "Pikachu",
          EVs: 0,
          ability: null,
          nature: "neutral",
          item: null,
        },
        {
          tier: 200,
          id: 3,
          pokedex_no: 6,
          name: "Charizard",
          EVs: 252,
          ability: null,
          nature: "positive",
          item: null,
        },
        {
          tier: 100,
          id: 1,
          pokedex_no: 25,
          name: "Pikachu-A",
          EVs: 0,
          ability: null,
          nature: "neutral",
          item: null,
        },
      ]),
    ).toEqual([
      {
        tier: 200,
        pokemon: [
          {
            id: 3,
            pokedex_no: 6,
            name: "Charizard",
            EVs: 252,
            ability: null,
            nature: "positive",
            item: null,
          },
        ],
      },
      {
        tier: 100,
        pokemon: [
          {
            id: 1,
            pokedex_no: 25,
            name: "Pikachu-A",
            EVs: 0,
            ability: null,
            nature: "neutral",
            item: null,
          },
          {
            id: 2,
            pokedex_no: 25,
            name: "Pikachu",
            EVs: 0,
            ability: null,
            nature: "neutral",
            item: null,
          },
        ],
      },
    ]);
  });
});

describe("speedTiersToCsv", () => {
  it("writes headers and escapes values", () => {
    expect(
      speedTiersToCsv([
        {
          tier: 100,
          pokemon: [
            {
              id: 1,
              pokedex_no: 122,
              name: "Mr. Mime, Jr.",
              EVs: 0,
              ability: "filter",
              nature: "neutral",
              item: null,
            },
          ],
        },
      ]),
    ).toBe(
      'tier,id,pokedex_no,name,EVs,ability,nature,item\n100,1,122,"Mr. Mime, Jr.",0,filter,neutral,\n',
    );
  });
});
